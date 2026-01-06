#!/usr/bin/env node
/**
 * Generate comprehensive asset manifest for preloading system.
 *
 * Scans /public/ directory and creates a JSON manifest with all assets
 * organized by loading levels:
 *
 * Level 0: Game cards for GameSelector
 * Level 1: Game-specific assets for StartScreen
 * Level 1.1: Campaign-specific assets (background loading)
 * Level 2: In-game assets (background loading during gameplay)
 *
 * Run: node scripts/generate-asset-manifest.js
 * Or:  npm run generate:assets
 */

import { readdirSync, writeFileSync, existsSync, statSync, mkdirSync } from 'fs';
import { join, extname, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DIR = join(__dirname, '..', 'public');
const OUTPUT_FILE = join(PUBLIC_DIR, 'asset-manifest.json');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
const AUDIO_EXTENSIONS = ['.ogg', '.mp3', '.wav', '.m4a'];
const FAVICON_NAMES = ['favicon.png', 'favicon.svg', 'favicon.ico'];
const GAME_CARD_NAMES = ['game-card.webp', 'game-card.png'];

/**
 * Check file type by extension.
 */
function isImageFile(filename) {
  return IMAGE_EXTENSIONS.includes(extname(filename).toLowerCase());
}

function isAudioFile(filename) {
  return AUDIO_EXTENSIONS.includes(extname(filename).toLowerCase());
}

function isAssetFile(filename) {
  return isImageFile(filename) || isAudioFile(filename);
}

function findFirstExistingFile(dirPath, names) {
  for (const name of names) {
    if (existsSync(join(dirPath, name))) return name;
  }
  return null;
}

/**
 * Get all files from a directory (non-recursive).
 * Returns paths relative to PUBLIC_DIR.
 */
function getFilesFromDir(dirPath, filter = isAssetFile) {
  if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
    return [];
  }

  return readdirSync(dirPath)
    .filter((f) => !f.startsWith('.') && filter(f))
    .map((f) => '/' + relative(PUBLIC_DIR, join(dirPath, f)))
    .sort();
}

/**
 * Get all files from a directory recursively.
 * Returns paths relative to PUBLIC_DIR.
 */
function getFilesRecursive(dirPath, filter = isAssetFile) {
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
      results.push(...getFilesRecursive(entryPath, filter));
    } else if (filter(entry)) {
      results.push('/' + relative(PUBLIC_DIR, entryPath));
    }
  }

  return results.sort();
}

/**
 * Get all subdirectories in a directory.
 */
function getSubdirectories(dirPath) {
  if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
    return [];
  }

  return readdirSync(dirPath).filter((entry) => {
    if (entry.startsWith('.')) return false;
    return statSync(join(dirPath, entry)).isDirectory();
  });
}

/**
 * Scan all games and their assets.
 */
function scanGames() {
  const gamesDir = join(PUBLIC_DIR, 'games');
  if (!existsSync(gamesDir)) {
    return {};
  }

  console.log('📁 Scanning games...');

  const games = {};
  const gameIds = getSubdirectories(gamesDir).filter((id) => id !== 'shared');

  for (const gameId of gameIds) {
    const gameDir = join(gamesDir, gameId);
    console.log(`   📂 ${gameId}`);

    games[gameId] = scanGameAssets(gameDir, gameId);
  }

  return games;
}

/**
 * Scan assets for a specific game.
 */
function scanGameAssets(gameDir, gameId) {
  const iconsDir = join(gameDir, 'icons');
  const campaignIconsDir = join(iconsDir, 'campaigns');
  const faviconDir = join(gameDir, 'favicon');

  const gameCardFilename = findFirstExistingFile(iconsDir, GAME_CARD_NAMES);
  const faviconInFaviconDir = findFirstExistingFile(faviconDir, FAVICON_NAMES);
  const faviconInIconsDir = findFirstExistingFile(iconsDir, FAVICON_NAMES);
  const faviconFilename = faviconInFaviconDir ?? faviconInIconsDir;
  const mainMenuMusicFilename = findFirstExistingFile(join(gameDir, 'music'), [
    'menu.ogg',
    'MainMenu.ogg',
  ]);
  const defeatMusicFilename = findFirstExistingFile(join(gameDir, 'music'), [
    'defeat.ogg',
    'Defeat.ogg',
  ]);
  const victoryMusicFilename = findFirstExistingFile(join(gameDir, 'music'), [
    'victory.ogg',
    'Victory.ogg',
  ]);
  const retreatMusicFilename = findFirstExistingFile(join(gameDir, 'music'), [
    'retreat.ogg',
    'Retreat.ogg',
  ]);

  const campaignIcons = getFilesFromDir(campaignIconsDir, isImageFile);
  const gameplayIcons = getFilesFromDir(iconsDir, isImageFile).filter((iconPath) => {
    const filename = iconPath.split('/').pop() || '';
    return !GAME_CARD_NAMES.includes(filename) && !FAVICON_NAMES.includes(filename);
  });

  const game = {
    // Level 0: For GameSelector cards
    cardAssets: {
      gameCard: gameCardFilename
        ? `/games/${gameId}/icons/${gameCardFilename}`
        : null,
      favicon: faviconFilename
        ? faviconInFaviconDir
          ? `/games/${gameId}/favicon/${faviconFilename}`
          : `/games/${gameId}/icons/${faviconFilename}`
        : null,
    },

    // Level 1: StartScreen assets
    level1: {
      icons: campaignIcons,
      sounds: getFilesFromDir(join(gameDir, 'sounds'), isAudioFile),
      mainMenuMusic: mainMenuMusicFilename
        ? `/games/${gameId}/music/${mainMenuMusicFilename}`
        : null,
      startImages: getFilesRecursive(join(gameDir, 'images', 'start')),
      campaignStartImages: {},
    },

    // Level 2: End game assets (loaded during gameplay)
    level2: {
      defeatMusic: defeatMusicFilename ? `/games/${gameId}/music/${defeatMusicFilename}`
        : null,
      victoryMusic: victoryMusicFilename ? `/games/${gameId}/music/${victoryMusicFilename}`
        : null,
      retreatMusic: retreatMusicFilename ? `/games/${gameId}/music/${retreatMusicFilename}`
        : null,
      icons: gameplayIcons,
      endImages: {
        victory: getFilesRecursive(join(gameDir, 'images', 'victory')),
        defeat: getFilesRecursive(join(gameDir, 'images', 'defeat')),
        retreat: getFilesRecursive(join(gameDir, 'images', 'retreat')),
      },
    },

    // Voice lines (loaded per campaign)
    voices: getFilesRecursive(join(gameDir, 'voices'), isAudioFile),

    // Campaigns
    campaigns: {},
  };

  // Scan campaigns
  const campaignsDir = join(gameDir, 'images', 'campaigns');
  if (existsSync(campaignsDir)) {
    const campaignIds = getSubdirectories(campaignsDir);

    for (const campaignId of campaignIds) {
      const campaignDir = join(campaignsDir, campaignId);

      // Campaign start images for Level 1
      const startImages = getFilesRecursive(join(campaignDir, 'start'));
      if (startImages.length > 0) {
        game.level1.campaignStartImages[campaignId] = startImages;
      }

      // Campaign-specific assets (Level 1.1 and Level 2)
      game.campaigns[campaignId] = {
        // Level 1.1: Loaded when campaign button is pressed
        level1_1: {
          music: existsSync(join(gameDir, 'music', `${campaignId}.ogg`))
            ? `/games/${gameId}/music/${campaignId}.ogg`
            : null,
          // Also check for capitalized version (Hero.ogg, DarkUrge.ogg, etc.)
          musicAlt: null,
          playImages: {
            easy: getFilesRecursive(join(campaignDir, 'play', 'easy')),
          },
        },

        // Level 2: Loaded during gameplay
        level2: {
          playImages: {
            medium: getFilesRecursive(join(campaignDir, 'play', 'medium')),
            hard: getFilesRecursive(join(campaignDir, 'play', 'hard')),
          },
          endImages: {
            victory: getFilesRecursive(join(campaignDir, 'victory')),
            defeat: getFilesRecursive(join(campaignDir, 'defeat')),
            retreat: getFilesRecursive(join(campaignDir, 'retreat')),
          },
        },
      };
    }
  }

  // Check for campaign music with different naming patterns
  const musicDir = join(gameDir, 'music');
  if (existsSync(musicDir)) {
    const musicFiles = getFilesFromDir(musicDir, isAudioFile);

    // Known system music files to exclude from campaign detection
    const systemMusicFiles = [
      'menu',
      'mainmenu',
      'victory',
      'defeat',
      'retreat',
    ];

    // Get existing campaign IDs (lowercase for comparison)
    const existingCampaignIds = Object.keys(game.campaigns).map((id) =>
      id.toLowerCase()
    );

    // Create campaign entries for music files that don't have campaign folders
    for (const musicPath of musicFiles) {
      const filename = musicPath.split('/').pop()?.replace('.ogg', '') || '';
      const filenameLower = filename.toLowerCase();

      // Skip system music files
      if (systemMusicFiles.includes(filenameLower)) {
        continue;
      }

      // Check if campaign already exists (case-insensitive)
      const existingIndex = existingCampaignIds.indexOf(filenameLower);
      if (existingIndex !== -1) {
        // Campaign exists - ensure music is set
        const existingId = Object.keys(game.campaigns)[existingIndex];
        if (!game.campaigns[existingId].level1_1.music) {
          game.campaigns[existingId].level1_1.music = musicPath;
        }
        continue;
      }

      // Create a new campaign entry using lowercase ID
      // This matches the convention in game configs (hero, mindFlayer, etc.)
      game.campaigns[filenameLower] = {
        level1_1: {
          music: musicPath,
          musicAlt: null,
          playImages: {
            easy: [],
          },
        },
        level2: {
          playImages: {
            medium: [],
            hard: [],
          },
          endImages: {
            victory: [],
            defeat: [],
            retreat: [],
          },
        },
      };
    }
  }

  // Count assets
  const level1Count =
    game.level1.icons.length +
    game.level1.sounds.length +
    (game.level1.mainMenuMusic ? 1 : 0) +
    game.level1.startImages.length +
    Object.values(game.level1.campaignStartImages).flat().length;

  const level2Count =
    (game.level2.defeatMusic ? 1 : 0) +
    (game.level2.victoryMusic ? 1 : 0) +
    (game.level2.retreatMusic ? 1 : 0) +
    game.level2.icons.length +
    game.level2.endImages.victory.length +
    game.level2.endImages.defeat.length +
    game.level2.endImages.retreat.length;

  console.log(
    `      Level 1: ${level1Count} assets, Level 2: ${level2Count} assets`
  );
  console.log(
    `      Campaigns: ${Object.keys(game.campaigns).join(', ') || 'none'}`
  );
  console.log(`      Voices: ${game.voices.length} files`);

  return game;
}

/**
 * Generate the complete manifest.
 */
function generateManifest() {
  console.log('🎮 Generating asset manifest...\n');

  // Ensure /public exists so dev/build can run without it committed.
  if (!existsSync(PUBLIC_DIR)) {
    mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const manifest = {
    version: '1.0.0',
    engine: { icons: [], images: [], sounds: [] },
    games: scanGames(),
  };

  // Calculate totals
  let totalAssets = 0;

  // Engine assets
  totalAssets +=
    manifest.engine.icons.length +
    manifest.engine.images.length +
    manifest.engine.sounds.length;

  // Game assets
  for (const game of Object.values(manifest.games)) {
    totalAssets +=
      game.level1.icons.length +
      game.level1.sounds.length +
      (game.level1.mainMenuMusic ? 1 : 0) +
      game.level1.startImages.length;
    totalAssets +=
      (game.level2.defeatMusic ? 1 : 0) +
      (game.level2.victoryMusic ? 1 : 0) +
      (game.level2.retreatMusic ? 1 : 0) +
      game.level2.icons.length;
    totalAssets += game.voices.length;

    for (const campaign of Object.values(game.campaigns)) {
      totalAssets +=
        (campaign.level1_1.music ? 1 : 0) +
        campaign.level1_1.playImages.easy.length;
      totalAssets +=
        campaign.level2.playImages.medium.length +
        campaign.level2.playImages.hard.length +
        campaign.level2.endImages.victory.length +
        campaign.level2.endImages.defeat.length +
        campaign.level2.endImages.retreat.length;
    }
  }

  // Write manifest
  writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

  console.log(`\n✨ Generated asset manifest: ${OUTPUT_FILE}`);
  console.log(`   Total assets indexed: ${totalAssets}`);
  console.log(`   Games: ${Object.keys(manifest.games).join(', ')}\n`);

  return manifest;
}

// Run
generateManifest();
