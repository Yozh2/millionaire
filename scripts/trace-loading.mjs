#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const DEFAULT_PORT = 4177;
const TRACE_ROOT = '.agent/runtime/loading-traces';

const NETWORK_PROFILES = {
  'slow-3g': {
    offline: false,
    latency: 400,
    downloadThroughput: Math.floor((400 * 1024) / 8),
    uploadThroughput: Math.floor((400 * 1024) / 8),
  },
  'fast-3g': {
    offline: false,
    latency: 150,
    downloadThroughput: Math.floor((1.6 * 1024 * 1024) / 8),
    uploadThroughput: Math.floor((750 * 1024) / 8),
  },
  'regular-4g': {
    offline: false,
    latency: 40,
    downloadThroughput: Math.floor((9 * 1024 * 1024) / 8),
    uploadThroughput: Math.floor((3 * 1024 * 1024) / 8),
  },
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    game: 'transformers',
    profile: 'slow-3g',
    port: DEFAULT_PORT,
    out: '',
    url: '',
    server: 'preview',
    headed: false,
    skipBuild: false,
    scenario: 'gameplay',
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--headed') {
      options.headed = true;
      continue;
    }
    if (arg === '--skip-build') {
      options.skipBuild = true;
      continue;
    }
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const value = args[i + 1];
    if (value == null || value.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`);
    }
    i += 1;
    if (key === 'port') options.port = Number(value);
    else if (key === 'server' && !['dev', 'preview'].includes(value)) {
      throw new Error('--server must be "dev" or "preview"');
    } else if (key === 'skip-build') options.skipBuild = value === 'true';
    else if (key in options) options[key] = value;
    else throw new Error(`Unknown option: ${arg}`);
  }

  if (!NETWORK_PROFILES[options.profile]) {
    throw new Error(
      `Unknown profile "${options.profile}". Use one of: ${Object.keys(
        NETWORK_PROFILES,
      ).join(', ')}`,
    );
  }

  return options;
};

const nowStamp = () => {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '-',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
};

const run = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.stdio ?? 'inherit',
      shell: false,
      ...options,
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else
        reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
    });
    child.on('error', reject);
  });

const waitForHttp = async (url, timeoutMs = 30_000) => {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Server did not become ready: ${url}; ${lastError ?? ''}`);
};

const startVite = async (port) => {
  await run('npm', ['run', 'generate:manifests'], { stdio: 'inherit' });

  const viteBin = path.resolve('node_modules/.bin/vite');
  const command = existsSync(viteBin) ? viteBin : 'npx';
  const args = existsSync(viteBin)
    ? ['--host', '127.0.0.1', '--port', String(port)]
    : ['vite', '--host', '127.0.0.1', '--port', String(port)];

  const child = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[vite] ${chunk}`);
  });
  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[vite] ${chunk}`);
  });

  await waitForHttp(`http://127.0.0.1:${port}/millionaire/`);
  return child;
};

const startPreview = async (port, skipBuild) => {
  if (!skipBuild) {
    await run('npm', ['run', 'build'], { stdio: 'inherit' });
  }

  const viteBin = path.resolve('node_modules/.bin/vite');
  const command = existsSync(viteBin) ? viteBin : 'npx';
  const args = existsSync(viteBin)
    ? ['preview', '--host', '127.0.0.1', '--port', String(port)]
    : ['vite', 'preview', '--host', '127.0.0.1', '--port', String(port)];

  const child = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[preview] ${chunk}`);
  });
  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[preview] ${chunk}`);
  });

  await waitForHttp(`http://127.0.0.1:${port}/millionaire/`);
  return child;
};

const classifyUrl = (rawUrl) => {
  try {
    const parsed = new URL(rawUrl);
    const pathname = parsed.pathname;
    const assetMatch = pathname.match(
      /\/millionaire\/games\/([^/]+)\/([^/]+)\/(.+)$/,
    );
    if (assetMatch) {
      return {
        gameId: assetMatch[1],
        bucket: assetMatch[2],
        assetPath: assetMatch[3],
      };
    }
    if (pathname.includes('/node_modules/')) return { bucket: 'vendor' };
    if (pathname.includes('/src/games/')) return { bucket: 'game-source' };
    if (pathname.includes('/src/engine/')) return { bucket: 'engine-source' };
    if (pathname.includes('/src/hub/')) return { bucket: 'hub-source' };
    if (pathname.endsWith('/asset-manifest.json'))
      return { bucket: 'manifest' };
    if (pathname.endsWith('/manifest.json'))
      return { bucket: 'image-manifest' };
    return { bucket: 'app' };
  } catch {
    return { bucket: 'unknown' };
  }
};

const formatBytes = (value) => {
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB'];
  let next = value;
  let index = 0;
  while (next >= 1024 && index < units.length - 1) {
    next /= 1024;
    index += 1;
  }
  return `${next.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const formatMs = (value) => {
  if (!Number.isFinite(value)) return 'n/a';
  return `${Math.round(value)} ms`;
};

const shortUrl = (rawUrl) => {
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return rawUrl;
  }
};

const waitForTraceEvent = async (page, name, timeout = 180_000) => {
  await page.waitForFunction(
    (eventName) =>
      window.__millionaireTraceEvents?.some(
        (event) => event.name === eventName,
      ),
    name,
    { timeout },
  );
};

const waitForAssetLevelEnd = async (
  page,
  { level, game, campaignId = null },
  timeout = 240_000,
) => {
  await page.waitForFunction(
    ({ expectedLevel, expectedGame, expectedCampaignId }) =>
      window.__millionaireTraceEvents?.some((event) => {
        if (event.name !== 'asset-level:end') return false;
        const details = event.details ?? {};
        return (
          details.level === expectedLevel &&
          details.gameId === expectedGame &&
          details.campaignId === expectedCampaignId
        );
      }),
    {
      expectedLevel: level,
      expectedGame: game,
      expectedCampaignId: campaignId,
    },
    { timeout },
  );
};

const runScenario = async (page, game) => {
  page.setDefaultTimeout(120_000);
  await page.goto(`/millionaire/${game}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120_000,
  });

  await waitForAssetLevelEnd(page, { level: 'level1', game });
  await page.getByRole('button', { name: /без звука|without sound/i }).click({
    timeout: 30_000,
  });
  const firstCampaign = page.locator('[data-campaign-card="true"]').first();
  await firstCampaign.click({
    timeout: 30_000,
  });
  const campaignId = await firstCampaign.evaluate(
    (node) => node.getAttribute('data-campaign-id') ?? null,
  );
  await page.getByRole('button', { name: /покатили|начать|start|fly/i }).click({
    timeout: 30_000,
  });
  await waitForAssetLevelEnd(page, { level: 'level1_1', game, campaignId });
  await page.waitForTimeout(2_000);
};

const summarize = ({
  entries,
  traceEvents,
  consoleMessages,
  errors,
  options,
}) => {
  const completeEntries = entries
    .filter((entry) => Number.isFinite(entry.durationMs))
    .sort((a, b) => b.durationMs - a.durationMs);
  const bySize = entries
    .filter((entry) => Number.isFinite(entry.encodedDataLength))
    .sort((a, b) => b.encodedDataLength - a.encodedDataLength);
  const failed = entries.filter((entry) => entry.failed || entry.status >= 400);
  const totalBytes = entries.reduce(
    (sum, entry) => sum + (entry.encodedDataLength || 0),
    0,
  );

  const buckets = new Map();
  for (const entry of entries) {
    const bucket = entry.bucket ?? 'unknown';
    const current = buckets.get(bucket) ?? {
      count: 0,
      bytes: 0,
      maxDurationMs: 0,
    };
    current.count += 1;
    current.bytes += entry.encodedDataLength || 0;
    current.maxDurationMs = Math.max(
      current.maxDurationMs,
      entry.durationMs || 0,
    );
    buckets.set(bucket, current);
  }

  const traceLines = traceEvents.map((event) => {
    const details = event.details
      ? ` ${JSON.stringify(event.details).replaceAll('|', '\\|')}`
      : '';
    return `| ${formatMs(event.at)} | ${event.name} |${details} |`;
  });

  const requestRows = completeEntries
    .slice(0, 25)
    .map(
      (entry) =>
        `| ${formatMs(entry.durationMs)} | ${formatBytes(
          entry.encodedDataLength,
        )} | ${entry.status ?? ''} | ${entry.bucket ?? ''} | ${shortUrl(
          entry.url,
        ).replaceAll('|', '%7C')} |`,
    );

  const sizeRows = bySize
    .slice(0, 20)
    .map(
      (entry) =>
        `| ${formatBytes(entry.encodedDataLength)} | ${formatMs(
          entry.durationMs,
        )} | ${entry.status ?? ''} | ${entry.bucket ?? ''} | ${shortUrl(
          entry.url,
        ).replaceAll('|', '%7C')} |`,
    );

  const bucketRows = Array.from(buckets.entries())
    .sort((a, b) => b[1].bytes - a[1].bytes)
    .map(
      ([bucket, stats]) =>
        `| ${bucket} | ${stats.count} | ${formatBytes(
          stats.bytes,
        )} | ${formatMs(stats.maxDurationMs)} |`,
    );

  const failureRows = failed.map(
    (entry) =>
      `| ${entry.status ?? 'failed'} | ${entry.errorText ?? ''} | ${
        entry.bucket ?? ''
      } | ${shortUrl(entry.url).replaceAll('|', '%7C')} |`,
  );

  return [
    `# Loading Trace: ${options.game} (${options.profile})`,
    '',
    `- Requests: ${entries.length}`,
    `- Transferred: ${formatBytes(totalBytes)}`,
    `- Trace events: ${traceEvents.length}`,
    `- Console messages: ${consoleMessages.length}`,
    `- Page errors: ${errors.length}`,
    '',
    '## Buckets',
    '',
    '| Bucket | Requests | Transferred | Slowest |',
    '| --- | ---: | ---: | ---: |',
    ...bucketRows,
    '',
    '## Slowest Requests',
    '',
    '| Duration | Size | Status | Bucket | URL |',
    '| ---: | ---: | ---: | --- | --- |',
    ...requestRows,
    '',
    '## Largest Requests',
    '',
    '| Size | Duration | Status | Bucket | URL |',
    '| ---: | ---: | ---: | --- | --- |',
    ...sizeRows,
    '',
    '## Loading Trace Events',
    '',
    '| At | Event | Details |',
    '| ---: | --- | --- |',
    ...traceLines,
    '',
    '## Failures',
    '',
    failureRows.length
      ? [
          '| Status | Error | Bucket | URL |',
          '| --- | --- | --- | --- |',
          ...failureRows,
        ].join('\n')
      : 'No failed network requests captured.',
    '',
  ].join('\n');
};

const main = async () => {
  const options = parseArgs();
  const outDir =
    options.out ||
    path.join(TRACE_ROOT, `${nowStamp()}-${options.game}-${options.profile}`);
  await mkdir(outDir, { recursive: true });

  let server = null;
  let browser = null;
  let context = null;
  try {
    if (!options.url) {
      server =
        options.server === 'preview'
          ? await startPreview(options.port, options.skipBuild)
          : await startVite(options.port);
    }

    const baseURL = options.url || `http://127.0.0.1:${options.port}`;
    try {
      browser = await chromium.launch({ headless: !options.headed });
    } catch (error) {
      if (!String(error).includes('Executable doesn')) throw error;
      browser = await chromium.launch({
        channel: 'chrome',
        headless: !options.headed,
      });
    }

    context = await browser.newContext({
      baseURL,
      viewport: { width: 1366, height: 900 },
      deviceScaleFactor: 1,
      recordHar: {
        path: path.join(outDir, 'network.har'),
        content: 'omit',
      },
    });

    await context.addInitScript(() => {
      window.__millionaireTraceEvents = [];
      window.__millionaireLoadingTrace = {
        event(event) {
          window.__millionaireTraceEvents.push(event);
        },
      };
    });

    const page = await context.newPage();
    const client = await context.newCDPSession(page);
    const requests = new Map();
    const consoleMessages = [];
    const errors = [];
    let firstTimestamp = null;

    await client.send('Network.enable');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    await client.send(
      'Network.emulateNetworkConditions',
      NETWORK_PROFILES[options.profile],
    );

    client.on('Network.requestWillBeSent', (event) => {
      firstTimestamp ??= event.timestamp;
      const classified = classifyUrl(event.request.url);
      requests.set(event.requestId, {
        requestId: event.requestId,
        url: event.request.url,
        method: event.request.method,
        resourceType: event.type,
        startMs: (event.timestamp - firstTimestamp) * 1000,
        initiatorType: event.initiator?.type ?? null,
        ...classified,
      });
    });

    client.on('Network.responseReceived', (event) => {
      const entry = requests.get(event.requestId);
      if (!entry) return;
      entry.status = event.response.status;
      entry.mimeType = event.response.mimeType;
      entry.responseMs = (event.timestamp - firstTimestamp) * 1000;
      entry.fromDiskCache = event.response.fromDiskCache;
      entry.fromServiceWorker = event.response.fromServiceWorker;
      const headerLength = Number(event.response.headers?.['content-length']);
      if (Number.isFinite(headerLength)) entry.contentLength = headerLength;
    });

    client.on('Network.loadingFinished', (event) => {
      const entry = requests.get(event.requestId);
      if (!entry) return;
      entry.endMs = (event.timestamp - firstTimestamp) * 1000;
      entry.durationMs = entry.endMs - entry.startMs;
      entry.encodedDataLength = event.encodedDataLength;
    });

    client.on('Network.loadingFailed', (event) => {
      const entry = requests.get(event.requestId);
      if (!entry) return;
      entry.endMs = (event.timestamp - firstTimestamp) * 1000;
      entry.durationMs = entry.endMs - entry.startMs;
      entry.failed = true;
      entry.errorText = event.errorText;
    });

    page.on('console', (message) => {
      consoleMessages.push({
        type: message.type(),
        text: message.text(),
      });
    });
    page.on('pageerror', (error) => {
      errors.push(error.stack || error.message);
    });

    try {
      await runScenario(page, options.game);
      await page.screenshot({
        path: path.join(outDir, 'final.png'),
        fullPage: true,
      });
    } finally {
      const traceEvents = await page.evaluate(
        () => window.__millionaireTraceEvents ?? [],
      );
      const entries = Array.from(requests.values()).sort(
        (a, b) => a.startMs - b.startMs,
      );
      const summary = summarize({
        entries,
        traceEvents,
        consoleMessages,
        errors,
        options,
      });

      await writeFile(
        path.join(outDir, 'trace.json'),
        JSON.stringify(
          { options, entries, traceEvents, consoleMessages, errors },
          null,
          2,
        ),
      );
      await writeFile(path.join(outDir, 'summary.md'), summary);

      console.log(`Loading trace written to ${outDir}`);
    }
  } finally {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
    server?.kill('SIGTERM');
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
