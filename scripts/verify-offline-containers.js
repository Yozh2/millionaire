#!/usr/bin/env node
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const readArg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${name}`);
  }
  return value;
};

const splitGames = (value) =>
  value
    .split(',')
    .map((gameId) => gameId.trim())
    .filter(Boolean)
    .sort();

const sameList = (actual, expected) =>
  actual.length === expected.length &&
  actual.every((id, index) => id === expected[index]);

const flattenAssetPaths = (value) => {
  if (!value) return [];
  if (typeof value === 'string') return value.startsWith('/') ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(flattenAssetPaths);
  if (typeof value === 'object') {
    return Object.values(value).flatMap(flattenAssetPaths);
  }
  return [];
};

const verifyTarget = async ({
  browser,
  name,
  url,
  expectedGames,
  screenshotPath,
}) => {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  const failedRequests = [];
  const badResponses = [];
  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', (message) => {
    consoleMessages.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
  page.on('requestfailed', (request) => {
    failedRequests.push(
      `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`,
    );
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      badResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.waitForSelector('#root', { state: 'attached', timeout: 10_000 });
  await page.waitForTimeout(2_000);

  const manifest = await page.evaluate(async () => {
    const response = await fetch('/asset-manifest.json');
    if (!response.ok)
      throw new Error(`asset-manifest status ${response.status}`);
    return response.json();
  });

  const manifestGames = Object.keys(manifest.games ?? {}).sort();
  if (!sameList(manifestGames, expectedGames)) {
    throw new Error(
      `${name}: expected manifest games ${expectedGames.join(', ')}, got ${manifestGames.join(', ')}`,
    );
  }

  const assetPaths = [...new Set(flattenAssetPaths(manifest.games))].slice(
    0,
    12,
  );
  const assetChecks = await page.evaluate(async (paths) => {
    return Promise.all(
      paths.map(async (path) => {
        const response = await fetch(path);
        return { path, ok: response.ok, status: response.status };
      }),
    );
  }, assetPaths);
  const missingAssets = assetChecks.filter((asset) => !asset.ok);
  if (missingAssets.length > 0) {
    throw new Error(`${name}: missing assets ${JSON.stringify(missingAssets)}`);
  }

  const text = (await page.locator('body').innerText()).trim();
  const controls = await page.locator('button, a, [role="button"]').count();
  if (text.length < 20) {
    throw new Error(
      `${name}: page text is too short: ${JSON.stringify(text)}; diagnostics ${JSON.stringify(
        {
          consoleMessages,
          pageErrors,
          failedRequests,
          badResponses,
        },
      )}`,
    );
  }
  if (controls === 0) {
    throw new Error(`${name}: no interactive controls rendered`);
  }
  if (
    failedRequests.length > 0 ||
    badResponses.length > 0 ||
    pageErrors.length > 0
  ) {
    throw new Error(
      `${name}: browser issues ${JSON.stringify({
        consoleMessages,
        pageErrors,
        failedRequests,
        badResponses,
      })}`,
    );
  }

  await page.screenshot({ path: screenshotPath, fullPage: true });
  const title = await page.title();
  await page.close();

  return {
    name,
    url,
    title,
    games: manifestGames,
    checkedAssets: assetChecks.length,
    controls,
    textSample: text.slice(0, 160),
    screenshotPath,
  };
};

const main = async () => {
  const gameUrl = readArg('--game-url', 'http://127.0.0.1:18081/');
  const bundleUrl = readArg('--bundle-url', 'http://127.0.0.1:18082/');
  const gameId = readArg('--game', 'nnr');
  const bundleGames = splitGames(readArg('--bundle-games', 'nnr,poc'));
  const screenshotsDir = readArg(
    '--screenshots-dir',
    join('.build', 'offline-verification'),
  );

  mkdirSync(screenshotsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    const results = [];
    results.push(
      await verifyTarget({
        browser,
        name: 'offline-game',
        url: gameUrl,
        expectedGames: [gameId],
        screenshotPath: join(screenshotsDir, 'offline-game.png'),
      }),
    );
    results.push(
      await verifyTarget({
        browser,
        name: 'offline-bundle',
        url: bundleUrl,
        expectedGames: bundleGames,
        screenshotPath: join(screenshotsDir, 'offline-bundle.png'),
      }),
    );
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
