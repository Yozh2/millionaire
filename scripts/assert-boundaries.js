#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const TEXT_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.mjs',
  '.ts',
  '.tsx',
  '.json',
  '.md',
]);

const getExtension = (file) => {
  const index = file.lastIndexOf('.');
  return index === -1 ? '' : file.slice(index);
};

const walk = (dir) => {
  if (!existsSync(dir)) return [];

  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...walk(path));
      continue;
    }
    if (TEXT_EXTENSIONS.has(getExtension(path))) {
      files.push(path);
    }
  }
  return files;
};

const readProjectFile = (path) => readFileSync(path, 'utf8');
const rel = (path) => path.slice(ROOT.length + 1);
const failures = [];

const checkFiles = (files, rules) => {
  for (const file of files) {
    const source = readProjectFile(file);
    for (const rule of rules) {
      if (rule.pattern.test(source)) {
        failures.push(`${rel(file)}: ${rule.message}`);
      }
    }
  }
};

const srcFiles = walk(join(ROOT, 'src'));
const engineFiles = walk(join(ROOT, 'src', 'engine'));
const gameFiles = walk(join(ROOT, 'src', 'games'));
const hubFiles = walk(join(ROOT, 'src', 'hub'));

checkFiles(srcFiles, [
  { pattern: /@app\b/, message: 'old @app alias remains' },
  { pattern: /@pages\b/, message: 'old @pages alias remains' },
  { pattern: /@games\b/, message: 'old @games alias remains' },
]);

checkFiles(engineFiles, [
  {
    pattern:
      /from ['"](?:@hub|(?:\.\.\/)+hub)|import\(['"](?:@hub|(?:\.\.\/)+hub)/,
    message: 'engine imports hub',
  },
  {
    pattern:
      /from ['"](?:@games|(?:\.\.\/)+games)|import\(['"](?:@games|(?:\.\.\/)+games)/,
    message: 'engine imports games',
  },
]);

checkFiles(gameFiles, [
  {
    pattern:
      /from ['"](?:@hub|(?:\.\.\/)+hub)|import\(['"](?:@hub|(?:\.\.\/)+hub)/,
    message: 'game imports hub',
  },
]);

checkFiles(hubFiles, [
  {
    pattern: /from ['"]@games\b|from ['"](?:\.\.\/)+games\b/,
    message: 'hub imports concrete game directly',
  },
  {
    pattern:
      /import\.meta\.glob\(['"]\/src\/games\/\*\/index\.ts['"],\s*\{\s*eager:\s*true/s,
    message: 'hub eagerly imports full game modules',
  },
]);

if (failures.length > 0) {
  console.error('Boundary check failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Boundary check passed.');
