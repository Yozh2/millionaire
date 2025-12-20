#!/usr/bin/env node
/**
 * Convert wallpaper images in /public to .webp.
 *
 * Targets:
 *   - public/images/**
 *   - public/games/<gameId>/images/**
 *   - public/games/<gameId>/icons/** (non-favicon only)
 *
 * Converts .png/.jpg/.jpeg → .webp with:
 *   - size: 1920x620 (cover + center crop)
 *   - quality: 85
 *   - colorspace/profile: sRGB (via ColorSync ICC on macOS)
 *   - no alpha channel (cwebp -noalpha)
 *
 * Source images are deleted after successful conversion (unless --keep-source).
 *
 * Run:
 *   node scripts/convert-images.js
 *   node scripts/convert-images.js --dry-run
 */

import { spawn, spawnSync } from 'child_process';
import {
  existsSync,
  readdirSync,
  statSync,
  unlinkSync,
  rmSync,
  renameSync,
} from 'fs';
import { join, extname, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DIR = join(__dirname, '..', 'public');
const ENGINE_IMAGES_DIR = join(PUBLIC_DIR, 'images');
const GAMES_DIR = join(PUBLIC_DIR, 'games');

const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

function parseArgs(argv) {
  const options = {
    cwebp: 'cwebp',
    sips: 'sips',
    width: 1920,
    height: 620,
    quality: 85,
    iconsQuality: 100,
    srgbProfile:
      process.platform === 'darwin'
        ? '/System/Library/ColorSync/Profiles/sRGB Profile.icc'
        : null,
    concurrency: Math.max(1, Math.min(4, (os.cpus()?.length ?? 2) - 1)),
    dryRun: false,
    keepSource: false,
    verbose: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--keep-source') options.keepSource = true;
    else if (arg === '--verbose') options.verbose = true;
    else if (arg === '--cwebp') options.cwebp = argv[++i] ?? options.cwebp;
    else if (arg === '--sips') options.sips = argv[++i] ?? options.sips;
    else if (arg === '--srgb-profile')
      options.srgbProfile = argv[++i] ?? options.srgbProfile;
    else if (arg === '--width') options.width = Number(argv[++i]);
    else if (arg === '--height') options.height = Number(argv[++i]);
    else if (arg === '--quality') options.quality = Number(argv[++i]);
    else if (arg === '--icons-quality') options.iconsQuality = Number(argv[++i]);
    else if (arg === '--concurrency') options.concurrency = Number(argv[++i]);
    else if (arg === '--help' || arg === '-h') options.help = true;
    else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (
    !Number.isFinite(options.width) ||
    !Number.isFinite(options.height) ||
    !Number.isFinite(options.quality) ||
    !Number.isFinite(options.concurrency)
  ) {
    throw new Error('Invalid numeric option value');
  }

  if (options.width <= 0 || options.height <= 0) {
    throw new Error('--width/--height must be > 0');
  }

  if (options.quality < 0 || options.quality > 100) {
    throw new Error('--quality must be 0..100');
  }

  if (options.iconsQuality < 0 || options.iconsQuality > 100) {
    throw new Error('--icons-quality must be 0..100');
  }

  if (options.concurrency <= 0) {
    throw new Error('--concurrency must be > 0');
  }

  return options;
}

function printHelp() {
  console.log(`
Convert wallpaper images in /public to .webp

Usage:
  node scripts/convert-images.js [options]

Options:
  --dry-run           Print planned actions only
  --keep-source       Do not delete .png/.jpg/.jpeg sources
  --cwebp <path>      cwebp binary (default: cwebp)
  --sips <path>       sips binary (default: sips)
  --srgb-profile <p>  ICC profile path for sRGB (default: macOS system profile)
  --width <n>         Output width (default: 1920)
  --height <n>        Output height (default: 620)
  --quality <0..100>  WebP quality (default: 85)
  --icons-quality <0..100> WebP quality for icons (100 = lossless, default: 100)
  --concurrency <n>   Parallel conversions (default: auto)
  --verbose           Show tool output
  -h, --help          Show help
`.trim());
}

function isSourceImage(filename) {
  const ext = extname(filename).toLowerCase();
  return SOURCE_EXTENSIONS.has(ext);
}

function isLikelyFaviconFilename(filename) {
  const lower = filename.toLowerCase();
  return (
    lower === 'favicon.ico' ||
    lower === 'favicon.png' ||
    lower === 'favicon.svg' ||
    lower.startsWith('favicon-') ||
    lower === 'apple-touch-icon.png' ||
    lower === 'apple-touch-icon.ico' ||
    lower === 'site.webmanifest'
  );
}

function isSourceIconImage(filename) {
  return isSourceImage(filename) && !isLikelyFaviconFilename(filename);
}

function getSubdirectories(dirPath) {
  if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
    return [];
  }

  return readdirSync(dirPath).filter((entry) => {
    if (entry.startsWith('.')) return false;
    const entryPath = join(dirPath, entry);
    return statSync(entryPath).isDirectory();
  });
}

function getFilesRecursive(dirPath, filterFn) {
  if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
    return [];
  }

  const results = [];
  const entries = readdirSync(dirPath);

  for (const entry of entries) {
    if (entry.startsWith('.')) continue;
    const entryPath = join(dirPath, entry);
    const stat = statSync(entryPath);

    if (stat.isDirectory()) {
      results.push(...getFilesRecursive(entryPath, filterFn));
    } else if (filterFn(entry)) {
      results.push(entryPath);
    }
  }

  return results;
}

function getTargetRoots() {
  const roots = [];

  if (existsSync(ENGINE_IMAGES_DIR)) {
    roots.push(ENGINE_IMAGES_DIR);
  }

  if (existsSync(GAMES_DIR)) {
    for (const gameId of getSubdirectories(GAMES_DIR)) {
      const imagesDir = join(GAMES_DIR, gameId, 'images');
      if (existsSync(imagesDir) && statSync(imagesDir).isDirectory()) {
        roots.push(imagesDir);
      }
    }
  }

  return roots;
}

function getIconRoots() {
  const roots = [];

  if (!existsSync(GAMES_DIR)) return roots;

  for (const gameId of getSubdirectories(GAMES_DIR)) {
    const iconsDir = join(GAMES_DIR, gameId, 'icons');
    if (existsSync(iconsDir) && statSync(iconsDir).isDirectory()) {
      roots.push(iconsDir);
    }
  }

  return roots;
}

function spawnAsync(command, args, { verbose } = { verbose: false }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: verbose ? 'inherit' : ['ignore', 'ignore', 'pipe'],
    });

    let stderr = '';
    if (!verbose && child.stderr) {
      child.stderr.on('data', (chunk) => {
        stderr += String(chunk);
      });
    }

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(
        new Error(
          `Command failed (${code}): ${command} ${args.join(' ')}\n${stderr}`.trim(),
        ),
      );
    });
  });
}

function resolveBinary(command, fallbackCandidates = []) {
  const hasPathSep =
    command.includes('/') ||
    command.includes('\\') ||
    command.startsWith('.') ||
    command.startsWith('~');

  if (hasPathSep) {
    return existsSync(command) ? command : null;
  }

  const pathEntries = (process.env.PATH || '')
    .split(':')
    .filter(Boolean)
    .concat(fallbackCandidates);

  for (const entry of pathEntries) {
    const candidate = join(entry, command);
    if (existsSync(candidate)) return candidate;
  }

  return null;
}

function checkBinary(command, versionArgs) {
  const result = spawnSync(command, versionArgs, { encoding: 'utf8' });
  if (result.error) return { ok: false, error: result.error };
  if (typeof result.status === 'number' && result.status !== 0) {
    return {
      ok: false,
      error: new Error((result.stderr || result.stdout || '').trim()),
    };
  }
  return { ok: true };
}

function getImageSizeWithSips(inputPath, sipsCommand) {
  const result = spawnSync(
    sipsCommand,
    ['-g', 'pixelWidth', '-g', 'pixelHeight', '-1', inputPath],
    { encoding: 'utf8' },
  );

  if (result.error) throw result.error;
  if (typeof result.status === 'number' && result.status !== 0) {
    throw new Error((result.stderr || result.stdout || '').trim());
  }

  const output = `${result.stdout}\n${result.stderr}`;
  const widthMatch = output.match(/pixelWidth:\s*(\d+)/);
  const heightMatch = output.match(/pixelHeight:\s*(\d+)/);

  const width = widthMatch ? Number(widthMatch[1]) : NaN;
  const height = heightMatch ? Number(heightMatch[1]) : NaN;

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error(`Failed to read image size via sips: ${inputPath}`);
  }

  return { width, height };
}

function buildOutputPath(inputPath) {
  const ext = extname(inputPath);
  const base = basename(inputPath, ext);
  return join(dirname(inputPath), `${base}.webp`);
}

async function convertOne(inputPath, options) {
  const outputPath = buildOutputPath(inputPath);
  const unique = `${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}`;
  const tmpPngPath = `${outputPath}.tmp.${unique}.png`;
  const tmpWebpPath = `${outputPath}.tmp.${unique}.webp`;

  if (options.dryRun) {
    console.log(`DRY  ${inputPath} -> ${outputPath}`);
    return { inputPath, outputPath, converted: false, deleted: false };
  }

  rmSync(tmpPngPath, { force: true });
  rmSync(tmpWebpPath, { force: true });

  const { width: inW, height: inH } = getImageSizeWithSips(inputPath, options.sips);
  const targetW = options.width;
  const targetH = options.height;

  const inputAspect = inW / inH;
  const targetAspect = targetW / targetH;

  let scaledW;
  let scaledH;
  if (inputAspect >= targetAspect) {
    const scale = targetH / inH;
    scaledH = targetH;
    scaledW = Math.ceil(inW * scale);
  } else {
    const scale = targetW / inW;
    scaledW = targetW;
    scaledH = Math.ceil(inH * scale);
  }

  const sipsArgs = [
    '-s',
    'format',
    'png',
    '--resampleHeightWidth',
    String(scaledH),
    String(scaledW),
    '--cropToHeightWidth',
    String(targetH),
    String(targetW),
  ];

  if (options.srgbProfile && existsSync(options.srgbProfile)) {
    sipsArgs.push('--matchTo', options.srgbProfile);
  }

  sipsArgs.push(inputPath, '--out', tmpPngPath);

  const cwebpArgs = [
    '-q',
    String(options.quality),
    '-m',
    '6',
    '-mt',
    '-noalpha',
    '-metadata',
    'icc',
    tmpPngPath,
    '-o',
    tmpWebpPath,
  ];

  try {
    await spawnAsync(options.sips, sipsArgs, { verbose: options.verbose });
    await spawnAsync(options.cwebp, cwebpArgs, { verbose: options.verbose });

    if (!existsSync(tmpWebpPath)) {
      throw new Error(`cwebp did not produce output: ${tmpWebpPath}`);
    }

    rmSync(outputPath, { force: true });
    renameSync(tmpWebpPath, outputPath);

    if (!options.keepSource) {
      unlinkSync(inputPath);
    }

    return { inputPath, outputPath, converted: true, deleted: !options.keepSource };
  } finally {
    rmSync(tmpPngPath, { force: true });
    rmSync(tmpWebpPath, { force: true });
  }
}

async function convertOneIcon(inputPath, options) {
  const outputPath = buildOutputPath(inputPath);
  const unique = `${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}`;
  const tmpPngPath = `${outputPath}.tmp.${unique}.png`;
  const tmpWebpPath = `${outputPath}.tmp.${unique}.webp`;

  if (options.dryRun) {
    console.log(`DRY  ${inputPath} -> ${outputPath}`);
    return { inputPath, outputPath, converted: false, deleted: false };
  }

  rmSync(tmpPngPath, { force: true });
  rmSync(tmpWebpPath, { force: true });

  const sipsArgs = ['-s', 'format', 'png'];
  if (options.srgbProfile && existsSync(options.srgbProfile)) {
    sipsArgs.push('--matchTo', options.srgbProfile);
  }
  sipsArgs.push(inputPath, '--out', tmpPngPath);

  const cwebpQualityArgs =
    options.iconsQuality === 100
      ? ['-lossless', '-z', '9']
      : ['-q', String(options.iconsQuality)];

  const cwebpArgs = [
    ...cwebpQualityArgs,
    '-m',
    '6',
    '-mt',
    '-metadata',
    'icc',
    tmpPngPath,
    '-o',
    tmpWebpPath,
  ];

  try {
    await spawnAsync(options.sips, sipsArgs, { verbose: options.verbose });
    await spawnAsync(options.cwebp, cwebpArgs, { verbose: options.verbose });

    if (!existsSync(tmpWebpPath)) {
      throw new Error(`cwebp did not produce output: ${tmpWebpPath}`);
    }

    rmSync(outputPath, { force: true });
    renameSync(tmpWebpPath, outputPath);

    if (!options.keepSource) {
      unlinkSync(inputPath);
    }

    return { inputPath, outputPath, converted: true, deleted: !options.keepSource };
  } finally {
    rmSync(tmpPngPath, { force: true });
    rmSync(tmpWebpPath, { force: true });
  }
}

async function runWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let index = 0;

  async function runner() {
    while (true) {
      const current = index++;
      if (current >= items.length) return;
      results[current] = await worker(items[current], current);
    }
  }

  const runners = [];
  for (let i = 0; i < Math.min(concurrency, items.length); i++) {
    runners.push(runner());
  }

  await Promise.all(runners);
  return results;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const resolvedSips = resolveBinary(
    options.sips,
    process.platform === 'darwin' ? ['/usr/bin'] : [],
  );
  if (resolvedSips) options.sips = resolvedSips;

  const resolvedCwebp = resolveBinary(
    options.cwebp,
    process.platform === 'darwin' ? ['/opt/homebrew/bin', '/usr/local/bin'] : [],
  );
  if (resolvedCwebp) options.cwebp = resolvedCwebp;

  const roots = getTargetRoots();
  const iconRoots = getIconRoots();
  if (roots.length === 0 && iconRoots.length === 0) {
    console.log('No target directories found under /public.');
    return;
  }

  if (!options.dryRun) {
    const sipsCheck = checkBinary(options.sips, ['--version']);
    if (!sipsCheck.ok) {
      throw new Error(
        `Required binary not found: ${options.sips} (needed for resize/crop/colorspace)`,
      );
    }

    const cwebpCheck = checkBinary(options.cwebp, ['-version']);
    if (!cwebpCheck.ok) {
      throw new Error(
        `Required binary not found: ${options.cwebp} (needed to encode .webp).\n` +
          `Install on macOS: brew install webp\n` +
          `Or pass an explicit path: node scripts/convert-images.js --cwebp /path/to/cwebp`,
      );
    }
  }

  const sourceFiles = roots
    .flatMap((root) => getFilesRecursive(root, isSourceImage))
    .sort();

  const iconSourceFiles = iconRoots
    .flatMap((root) => getFilesRecursive(root, isSourceIconImage))
    .sort();

  if (sourceFiles.length === 0 && iconSourceFiles.length === 0) {
    console.log('No .png/.jpg/.jpeg files found to convert.');
    return;
  }

  console.log(
    `Found ${sourceFiles.length} wallpaper source image(s) under:\n` +
      (roots.length ? roots.map((r) => `  - ${r}`).join('\n') : '  (none)') +
      '\n\n' +
      `Found ${iconSourceFiles.length} icon source image(s) under:\n` +
      (iconRoots.length ? iconRoots.map((r) => `  - ${r}`).join('\n') : '  (none)') +
      '\n',
  );

  const startedAt = Date.now();
  let converted = 0;
  let deleted = 0;

  await runWithConcurrency(sourceFiles, options.concurrency, async (inputPath) => {
    const result = await convertOne(inputPath, options);
    if (result.converted) converted++;
    if (result.deleted) deleted++;
    if (!options.dryRun) {
      console.log(`OK   ${result.outputPath}`);
    }
    return result;
  });

  await runWithConcurrency(iconSourceFiles, options.concurrency, async (inputPath) => {
    const result = await convertOneIcon(inputPath, options);
    if (result.converted) converted++;
    if (result.deleted) deleted++;
    if (!options.dryRun) {
      console.log(`OK   ${result.outputPath}`);
    }
    return result;
  });

  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
  if (options.dryRun) {
    console.log(`\nDry run complete in ${seconds}s.`);
  } else {
    console.log(
      `\nDone in ${seconds}s. Converted: ${converted}. Sources deleted: ${deleted}.`,
    );
    console.log(
      'Tip: re-run `npm run generate:manifests` to refresh manifest.json files.',
    );
  }
}

main().catch((err) => {
  console.error(err?.stack || err);
  process.exitCode = 1;
});
