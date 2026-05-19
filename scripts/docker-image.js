#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

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

export const buildDockerImage = ({ distDir, tag }) => {
  run('docker', [
    'build',
    '-f',
    'docker/offline.Dockerfile',
    '--build-arg',
    `DIST_DIR=${distDir}`,
    '-t',
    tag,
    '.',
  ]);
};
