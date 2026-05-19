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

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    ...options,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const listResult = spawnSync(
  'git',
  ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'],
  { encoding: 'utf8' },
);

if (listResult.error) {
  console.error(listResult.error.message);
  process.exit(1);
}

if (listResult.status !== 0) {
  process.exit(listResult.status ?? 1);
}

const stagedFiles = listResult.stdout.split('\0').filter(Boolean);
const formatTargets = stagedFiles.filter((file) => {
  if (!existsSync(file)) return false;
  const dotIndex = file.lastIndexOf('.');
  if (dotIndex === -1) return false;
  return FORMAT_EXTENSIONS.has(file.slice(dotIndex));
});

if (formatTargets.length === 0) {
  console.log('[format-staged] No staged files need Prettier.');
  process.exit(0);
}

console.log(
  `[format-staged] Formatting ${formatTargets.length} staged file(s).`,
);
run('npx', ['--no-install', 'prettier', '--write', ...formatTargets]);
run('git', ['add', ...formatTargets]);
