import type { Companion } from '@engine/types';
import { assetLoader } from '@engine/services';
import { checkFileExists, getAssetPaths } from '@engine/utils/assetLoader';

const normalizeKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

const getFilename = (path: string): string => {
  const parts = path.split('/');
  return parts[parts.length - 1] ?? path;
};

const getBaseName = (filename: string): string => filename.replace(/\.[^/.]+$/, '');

type Candidate = { filename: string; baseKey: string };

const scoreVoiceCandidate = (candidate: Candidate, keys: string[]): number => {
  const [idKey, descKey] = keys;

  if (candidate.baseKey === idKey) return 100;
  if (descKey && candidate.baseKey === descKey) return 95;

  if (idKey && idKey.startsWith(candidate.baseKey)) return 85;
  if (descKey && descKey.startsWith(candidate.baseKey)) return 80;

  if (idKey && candidate.baseKey.startsWith(idKey)) return 70;
  if (descKey && candidate.baseKey.startsWith(descKey)) return 65;

  return 0;
};

export const resolveCompanionVoiceFilename = async (
  gameId: string,
  companion: Companion
): Promise<string | null> => {
  const idKey = normalizeKey(companion.id);
  const descKey = normalizeKey(companion.desc ?? '');

  const gameAssets = await assetLoader.getGameAssets(gameId);
  const manifestFiles = gameAssets?.voices?.map(getFilename) ?? [];

  const candidates: Candidate[] = manifestFiles.map((filename) => ({
    filename,
    baseKey: normalizeKey(getBaseName(filename)),
  }));

  let best: { filename: string; score: number } | null = null;
  for (const candidate of candidates) {
    const score = scoreVoiceCandidate(candidate, [idKey, descKey]);
    if (score <= 0) continue;
    if (!best || score > best.score) best = { filename: candidate.filename, score };
  }

  if (best) {
    return best.filename;
  }

  // Fallback without manifest (e.g., PoC): try a few common extensions by companion id.
  const extensions = ['m4a', 'ogg', 'mp3', 'wav'] as const;
  for (const ext of extensions) {
    const filename = `${companion.id}.${ext}`;
    const paths = getAssetPaths('voices', filename, gameId);
    if (await checkFileExists(paths.specific)) return filename;
  }

  return null;
};
