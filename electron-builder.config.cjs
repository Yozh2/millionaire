const path = require('node:path');

const gameId = process.env.MILLIONAIRE_DESKTOP_GAME_ID || 'game';
const productName =
  process.env.MILLIONAIRE_DESKTOP_PRODUCT_NAME || 'Millionaire Game';
const distPath = process.env.MILLIONAIRE_DESKTOP_DIST || '.build/desktop';
const outputPath =
  process.env.MILLIONAIRE_DESKTOP_OUTPUT || '.build/desktop-packages';

module.exports = {
  appId: `io.github.yozh2.millionaire.${gameId}`,
  productName,
  directories: {
    output: outputPath,
  },
  files: ['package.json', 'electron/main.cjs'],
  extraResources: [
    {
      from: path.resolve(distPath),
      to: 'app-dist',
    },
  ],
  asar: true,
  npmRebuild: false,
  mac: {
    target: ['zip'],
    category: 'public.app-category.games',
  },
  win: {
    target: ['portable'],
  },
  linux: {
    target: ['AppImage'],
    category: 'Game',
  },
  artifactName: '${productName}-${version}-${os}-${arch}.${ext}',
};
