import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const FORMAT_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.ts',
  '.tsx',
  '.yml',
  '.yaml',
]);

const runText = (args) => {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.status !== 0) return null;
  return result.stdout.trim();
};

const run = (command, args) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const listFiles = (args) => {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  return result.stdout.split('\0').filter(Boolean);
};

const getFormatBase = () => {
  if (process.env.FORMAT_BASE) return process.env.FORMAT_BASE;

  const upstream = runText([
    'rev-parse',
    '--abbrev-ref',
    '--symbolic-full-name',
    '@{u}',
  ]);
  if (upstream) {
    const mergeBase = runText(['merge-base', 'HEAD', upstream]);
    if (mergeBase) return mergeBase;
  }

  const previousCommit = runText(['rev-parse', '--verify', 'HEAD~1']);
  return previousCommit;
};

const isFormatTarget = (file) => {
  if (!existsSync(file)) return false;
  const dotIndex = file.lastIndexOf('.');
  if (dotIndex === -1) return false;
  return FORMAT_EXTENSIONS.has(file.slice(dotIndex));
};

const base = getFormatBase();
const changedSinceBase = base
  ? listFiles(['diff', '--name-only', '--diff-filter=ACMR', '-z', base, 'HEAD'])
  : listFiles(['ls-files', '-z']);
const uncommittedChanges = listFiles([
  'diff',
  '--name-only',
  '--diff-filter=ACMR',
  '-z',
]);

const targets = [
  ...new Set([...changedSinceBase, ...uncommittedChanges]),
].filter(isFormatTarget);

if (targets.length === 0) {
  console.log('[format:changed] No changed files need Prettier check.');
  process.exit(0);
}

console.log(`[format:changed] Checking ${targets.length} changed file(s).`);
run('npx', ['--no-install', 'prettier', '--check', ...targets]);
