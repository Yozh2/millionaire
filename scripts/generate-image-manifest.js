#!/usr/bin/env node
/**
 * Generate image manifests for header slideshows.
 *
 * Scans public/games/{gameId}/images/ directories and creates
 * manifest.json files listing images by difficulty level.
 *
 * Image naming convention:
 *   - easy-*.{jpg,png,webp}   → easy difficulty
 *   - medium-*.{jpg,png,webp} → medium difficulty
 *   - hard-*.{jpg,png,webp}   → hard difficulty
 *
 * Run: node scripts/generate-image-manifest.js
 * Or:  npm run generate:manifests
 */

import { readdirSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DIR = join(__dirname, '..', 'public');
const GAMES_DIR = join(PUBLIC_DIR, 'games');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

/**
 * Check if a file is an image based on extension.
 */
function isImageFile(filename) {
  const ext = extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Determine difficulty from filename prefix.
 * e.g., "easy-tavern.jpg" → "easy"
 */
function getDifficulty(filename) {
  const lower = filename.toLowerCase();
  for (const diff of DIFFICULTIES) {
    if (lower.startsWith(`${diff}-`) || lower.startsWith(`${diff}_`)) {
      return diff;
    }
  }
  // Default to 'easy' if no prefix
  return 'easy';
}

/**
 * Scan a game's images directory and generate manifest.
 */
function generateManifest(gameId) {
  const imagesDir = join(GAMES_DIR, gameId, 'images');

  if (!existsSync(imagesDir)) {
    return null;
  }

  const stats = statSync(imagesDir);
  if (!stats.isDirectory()) {
    return null;
  }

  const manifest = {
    easy: [],
    medium: [],
    hard: [],
  };

  const files = readdirSync(imagesDir);

  for (const file of files) {
    if (!isImageFile(file)) continue;
    if (file === 'manifest.json') continue;

    const difficulty = getDifficulty(file);
    manifest[difficulty].push(file);
  }

  // Sort files within each difficulty for consistency
  for (const diff of DIFFICULTIES) {
    manifest[diff].sort();
  }

  // Only write if there are any images
  const totalImages =
    manifest.easy.length + manifest.medium.length + manifest.hard.length;

  if (totalImages === 0) {
    return null;
  }

  const manifestPath = join(imagesDir, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  return { gameId, manifest, path: manifestPath };
}

/**
 * Main: scan all games and generate manifests.
 */
function main() {
  console.log('🖼️  Generating image manifests...\n');

  if (!existsSync(GAMES_DIR)) {
    console.log('No games directory found at:', GAMES_DIR);
    return;
  }

  const games = readdirSync(GAMES_DIR);
  let generated = 0;

  for (const gameId of games) {
    const gamePath = join(GAMES_DIR, gameId);
    if (!statSync(gamePath).isDirectory()) continue;

    const result = generateManifest(gameId);

    if (result) {
      const { manifest } = result;
      const counts = DIFFICULTIES.map(
        (d) => `${d}: ${manifest[d].length}`
      ).join(', ');
      console.log(`  ✅ ${gameId}: ${counts}`);
      generated++;
    }
  }

  if (generated === 0) {
    console.log('  No image directories found.');
    console.log('\n  To add slideshow images:');
    console.log('  1. Create: public/games/{gameId}/images/');
    console.log('  2. Add images with prefixes: easy-*, medium-*, hard-*');
    console.log('  3. Run this script again\n');
  } else {
    console.log(`\n✨ Generated ${generated} manifest(s)\n`);
  }
}

main();
