import { useEffect, useMemo, useState } from 'react';
import type {
  HeaderSlideshowConfig,
  QuestionDifficulty,
  SlideshowScreen,
} from '@engine/types';
import { gameImagesDir, publicDir } from '@public';

/** Manifest structure matching generate-image-manifest.js output */
interface ImageManifest {
  images?: string[];
  start?: { images?: string[] };
  play?: {
    images?: string[];
    easy?: { images?: string[] };
    medium?: { images?: string[] };
    hard?: { images?: string[] };
  };
  end?: {
    images?: string[];
    won?: { images?: string[] };
    took?: { images?: string[] };
    lost?: { images?: string[] };
  };
  campaigns?: Record<string, unknown>;
}

/** Cache for loaded manifests */
const manifestCache: Record<string, ImageManifest | null> = {};

async function loadManifest(basePath: string): Promise<ImageManifest | null> {
  const cacheKey = basePath;
  if (cacheKey in manifestCache) return manifestCache[cacheKey];

  try {
    const response = await fetch(`${basePath}/manifest.json`);
    if (!response.ok) {
      manifestCache[cacheKey] = null;
      return null;
    }
    const data = (await response.json()) as ImageManifest;
    manifestCache[cacheKey] = data;
    return data;
  } catch {
    manifestCache[cacheKey] = null;
    return null;
  }
}

const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === 'object' ? (v as Record<string, unknown>) : null;

function getImagesAtPath(node: unknown, parts: string[]): string[] {
  let cur: unknown = node;
  for (const part of parts) {
    const rec = asRecord(cur);
    if (!rec) return [];
    cur = rec[part];
  }
  const rec = asRecord(cur);
  const images = rec?.images;
  return Array.isArray(images) ? (images as string[]) : [];
}

function findFirstMatch(
  nodes: Array<{ node: unknown; basePath: string }>,
  partsList: string[][]
): { images: string[]; basePath: string; subfolder: string } | null {
  for (const { node, basePath } of nodes) {
    for (const parts of partsList) {
      const images = getImagesAtPath(node, parts);
      if (images.length > 0) {
        return { images, basePath, subfolder: parts.join('/') };
      }
    }
  }
  return null;
}

function partsForScreen(
  screen: SlideshowScreen,
  difficulty?: QuestionDifficulty
): string[][] {
  if (screen === 'start') return [['start'], []];
  if (screen === 'play') {
    const parts: string[][] = [];
    if (difficulty) parts.push(['play', difficulty]);
    parts.push(['play']);
    parts.push([]);
    return parts;
  }
  return [['end', screen], ['end'], []];
}

export interface UseHeaderImagesResult {
  enabled: boolean;
  transitionDuration: number;
  displayDuration: number;
  opacity: number;
  isLoading: boolean;
  images: string[];
  basePath: string;
  subfolder: string;
}

export function useHeaderImages(
  slideshowConfig: HeaderSlideshowConfig | undefined,
  {
    gameId,
    campaignId,
    screen,
    difficulty,
  }: {
    gameId: string;
    campaignId?: string;
    screen: SlideshowScreen;
    difficulty?: QuestionDifficulty;
  }
): UseHeaderImagesResult {
  const enabled = slideshowConfig?.enabled ?? true;
  const transitionDuration = slideshowConfig?.transitionDuration ?? 1500;
  const displayDuration = slideshowConfig?.displayDuration ?? 15000;
  const opacity = slideshowConfig?.opacity ?? 1;

  const [images, setImages] = useState<string[]>([]);
  const [basePath, setBasePath] = useState<string>('');
  const [subfolder, setSubfolder] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const gameBasePath = useMemo(() => gameImagesDir(gameId), [gameId]);
  const engineBasePath = useMemo(() => publicDir('images'), []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function resolveImages() {
      if (cancelled) return;

      const gameManifest = await loadManifest(gameBasePath);
      const engineManifest = await loadManifest(engineBasePath);

      const nodes: Array<{ node: unknown; basePath: string }> = [];

      if (campaignId && gameManifest?.campaigns) {
        const campaigns = gameManifest.campaigns;
        const campaignsRecord = asRecord(campaigns);
        const campaignNode = campaignsRecord?.[campaignId];

        if (campaignNode) {
          nodes.push({
            node: campaignNode,
            basePath: `${gameBasePath}/campaigns/${campaignId}`,
          });
        }

        nodes.push({ node: campaigns, basePath: `${gameBasePath}/campaigns` });
      }

      if (gameManifest) nodes.push({ node: gameManifest, basePath: gameBasePath });
      if (engineManifest) nodes.push({ node: engineManifest, basePath: engineBasePath });

      const match = findFirstMatch(nodes, partsForScreen(screen, difficulty));
      if (match) {
        if (!cancelled) {
          setImages(match.images);
          setBasePath(match.basePath);
          setSubfolder(match.subfolder);
          setIsLoading(false);
        }
        return;
      }

      if (screen !== 'start') {
        const startFallback = findFirstMatch(
          nodes.filter((n) => n.basePath === gameBasePath || n.basePath === engineBasePath),
          partsForScreen('start')
        );
        if (startFallback) {
          if (!cancelled) {
            setImages(startFallback.images);
            setBasePath(startFallback.basePath);
            setSubfolder(startFallback.subfolder);
            setIsLoading(false);
          }
          return;
        }
      }

      if (!cancelled) {
        setImages([]);
        setIsLoading(false);
      }
    }

    setIsLoading(true);
    void resolveImages();

    return () => {
      cancelled = true;
    };
  }, [campaignId, difficulty, enabled, engineBasePath, gameBasePath, screen]);

  return {
    enabled,
    transitionDuration,
    displayDuration,
    opacity,
    isLoading,
    images,
    basePath,
    subfolder,
  };
}

export default useHeaderImages;
