#!/usr/bin/env node
/**
 * Prepare dist/ for gh-pages deploy:
 * - remove .DS_Store files
 * - disable Git LFS filters in gh-pages output
 */
import { existsSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '..', 'dist');

if (!existsSync(DIST_DIR)) {
  console.error('[prepare-dist] dist/ not found. Run build first.');
  process.exit(1);
}

const removeDsStore = (dir) => {
  for (const entry of readdirSync(dir)) {
    const entryPath = join(dir, entry);
    const stat = statSync(entryPath);
    if (stat.isDirectory()) {
      removeDsStore(entryPath);
      continue;
    }
    if (entry === '.DS_Store') {
      unlinkSync(entryPath);
    }
  }
};

removeDsStore(DIST_DIR);

const lfsBypass = [
  '# Disable LFS filters in gh-pages output',
  '*.m4a -filter -diff -merge',
  '*.mp3 -filter -diff -merge',
  '*.ogg -filter -diff -merge',
  '*.wav -filter -diff -merge',
  '*.ttf -filter -diff -merge',
  '*.otf -filter -diff -merge',
  '*.woff -filter -diff -merge',
  '*.woff2 -filter -diff -merge',
  '',
].join('\n');

writeFileSync(join(DIST_DIR, '.gitattributes'), lfsBypass);
