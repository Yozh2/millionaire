#!/usr/bin/env node
/**
 * Generate image manifests for header slideshows.
 *
 * Scans the image directory structure and creates manifest.json files
 * for both engine fallback images and game-specific images.
 *
 * Directory structure:
 *   public/images/                    - Engine fallback images
 *   public/games/{gameId}/images/     - Game-specific images
 *
 * See README.md for full directory structure documentation.
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
const ENGINE_IMAGES_DIR = join(PUBLIC_DIR, 'images');
const GAMES_DIR = join(PUBLIC_DIR, 'games');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

/**
 * Check if a file is an image based on extension.
 */
function isImageFile(filename) {
  const ext = extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Get all image files from a directory (non-recursive).
 */
function getImagesFromDir(dirPath) {
  if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
    return [];
  }

  return readdirSync(dirPath)
    .filter(isImageFile)
    .sort();
}

/**
 * Recursively scan a directory and build nested manifest structure.
 */
function scanDirectory(dirPath, depth = 0) {
  if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
    return null;
  }

  const entries = readdirSync(dirPath);
  const result = {};
  let hasContent = false;

  // Get images in current directory
  const images = entries.filter(isImageFile).sort();
  if (images.length > 0) {
    result._images = images;
    hasContent = true;
  }

  // Recurse into subdirectories
  for (const entry of entries) {
    const entryPath = join(dirPath, entry);
    if (statSync(entryPath).isDirectory() && !entry.startsWith('.')) {
      const subResult = scanDirectory(entryPath, depth + 1);
      if (subResult) {
        result[entry] = subResult;
        hasContent = true;
      }
    }
  }

  return hasContent ? result : null;
}

/**
 * Flatten manifest for simpler consumption.
 * Converts nested structure with _images to cleaner format.
 */
function flattenManifest(obj) {
  if (!obj) return null;

  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === '_images') {
      // Images array stays as-is at this level
      result.images = value;
    } else if (typeof value === 'object') {
      const flattened = flattenManifest(value);
      if (flattened) {
        result[key] = flattened;
      }
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Generate manifest for engine fallback images.
 */
function generateEngineManifest() {
  console.log('📁 Scanning engine fallback images...');

  const manifest = scanDirectory(ENGINE_IMAGES_DIR);

  if (!manifest) {
    console.log('   No engine images found');
    return null;
  }

  const flattened = flattenManifest(manifest);
  const manifestPath = join(ENGINE_IMAGES_DIR, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(flattened, null, 2));

  console.log(`   ✅ Created ${manifestPath}`);
  return flattened;
}

/**
 * Generate manifest for a specific game.
 */
function generateGameManifest(gameId) {
  const imagesDir = join(GAMES_DIR, gameId, 'images');

  if (!existsSync(imagesDir)) {
    return null;
  }

  const manifest = scanDirectory(imagesDir);

  if (!manifest) {
    return null;
  }

  const flattened = flattenManifest(manifest);
  const manifestPath = join(imagesDir, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(flattened, null, 2));

  return { gameId, manifest: flattened, path: manifestPath };
}

/**
 * Count images in manifest recursively.
 */
function countImages(obj) {
  if (!obj) return 0;

  let count = 0;
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'images' && Array.isArray(value)) {
      count += value.length;
    } else if (typeof value === 'object') {
      count += countImages(value);
    }
  }
  return count;
}

/**
 * Main: scan all directories and generate manifests.
 */
function main() {
  console.log('🖼️  Generating image manifests...\n');

  let totalManifests = 0;
  let totalImages = 0;

  // Generate engine manifest
  const engineManifest = generateEngineManifest();
  if (engineManifest) {
    totalManifests++;
    totalImages += countImages(engineManifest);
  }

  // Generate game manifests
  if (existsSync(GAMES_DIR)) {
    console.log('\n📁 Scanning game images...');

    const games = readdirSync(GAMES_DIR);

    for (const gameId of games) {
      const gamePath = join(GAMES_DIR, gameId);
      if (!statSync(gamePath).isDirectory()) continue;

      const result = generateGameManifest(gameId);

      if (result) {
        const imageCount = countImages(result.manifest);
        console.log(`   ✅ ${gameId}: ${imageCount} images`);
        totalManifests++;
        totalImages += imageCount;
      }
    }
  }

  console.log('');

  if (totalManifests === 0) {
    console.log('📭 No images found.\n');
    console.log('To add slideshow images, create directories:');
    console.log('  • public/images/start/');
    console.log('  • public/images/play/{easy,medium,hard}/');
    console.log('  • public/images/{victory,retreat,defeat}/');
    console.log('  • public/games/{gameId}/images/...\n');
    console.log('See README.md for full structure documentation.\n');
  } else {
    console.log(`✨ Generated ${totalManifests} manifest(s) with ${totalImages} images total\n`);
  }
}

main();
