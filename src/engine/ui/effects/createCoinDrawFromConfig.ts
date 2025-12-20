import type { ComponentType } from 'react';
import { isValidElement } from 'react';
import type { DrawCoinFunction, GameConfig } from '@engine/types';
import { drawDefaultCoin } from './ParticleCanvas';
import { DefaultCoinIcon } from '../icons/DefaultIcons';

type ReactChildLike =
  | string
  | number
  | boolean
  | null
  | undefined
  | ReactChildLike[]
  | { props?: { children?: ReactChildLike } };

const firstStringLike = (node: ReactChildLike): string | null => {
  if (typeof node === 'string') {
    const s = node.trim();
    return s.length ? s : null;
  }
  if (typeof node === 'number') return String(node);
  if (!node) return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = firstStringLike(child);
      if (found) return found;
    }
    return null;
  }
  if (typeof node === 'object' && 'props' in node) {
    return firstStringLike((node as any).props?.children);
  }
  return null;
};

const firstImgSrc = (node: unknown): string | null => {
  if (!isValidElement(node)) return null;

  if (typeof node.type === 'string' && node.type === 'img') {
    const src = (node.props as any)?.src;
    if (typeof src === 'string' && src.length) return src;
  }

  const children = (node.props as any)?.children;
  if (children == null) return null;
  if (Array.isArray(children)) {
    for (const child of children) {
      const found = firstImgSrc(child);
      if (found) return found;
    }
    return null;
  }
  return firstImgSrc(children);
};

const safeRenderIcon = (Icon?: ComponentType): unknown => {
  if (!Icon) return null;
  if (typeof Icon !== 'function') return null;
  if ((Icon as any).prototype?.isReactComponent) return null;
  try {
    return (Icon as any)();
  } catch {
    return null;
  }
};

const unique = <T,>(items: T[]): T[] => [...new Set(items)];

const createSpriteCoinDraw = (sources: string[]): DrawCoinFunction => {
  const uniqueSources = unique(sources).filter(Boolean);
  const images: Array<HTMLImageElement | null> = Array.from(
    { length: uniqueSources.length },
    () => null
  );
  const ready = Array.from({ length: uniqueSources.length }, () => false);

  const ensure = (i: number): HTMLImageElement | null => {
    if (uniqueSources.length === 0) return null;
    const idx = i % uniqueSources.length;
    const existing = images[idx];
    if (existing || typeof Image === 'undefined') return existing;

    const img = new Image();
    img.decoding = 'async';
    img.src = uniqueSources[idx]!;
    img.onload = () => {
      ready[idx] = true;
    };
    img.onerror = () => {
      ready[idx] = false;
    };

    images[idx] = img;
    return img;
  };

  return (ctx, size, colorIndex) => {
    if (uniqueSources.length === 0) {
      drawDefaultCoin(ctx, size, colorIndex);
      return;
    }

    const idx = Math.abs(colorIndex) % uniqueSources.length;
    const img = ensure(idx);
    if (img && ready[idx] && img.naturalWidth > 0) {
      const drawSize = size * 1.2;
      const prevSmoothing = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
      ctx.imageSmoothingEnabled = prevSmoothing;
      return;
    }

    drawDefaultCoin(ctx, size, colorIndex);
  };
};

const createEmojiCoinDraw = (glyphs: string[]): DrawCoinFunction => {
  const uniqueGlyphs = unique(glyphs)
    .map((g) => g.trim())
    .filter(Boolean);

  return (ctx, size, colorIndex) => {
    if (uniqueGlyphs.length === 0) {
      drawDefaultCoin(ctx, size, colorIndex);
      return;
    }

    const glyph = uniqueGlyphs[Math.abs(colorIndex) % uniqueGlyphs.length]!;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.max(10, Math.round(size * 0.95))}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
    ctx.fillText(glyph, 0, 0);
    ctx.restore();
  };
};

export const createCoinDrawFromConfig = (config: GameConfig): DrawCoinFunction => {
  const candidates: Array<ComponentType | undefined> = [
    config.icons?.coin ?? DefaultCoinIcon,
    config.endIcons?.tookMoney,
    config.endIcons?.won,
  ];

  const rendered = candidates.map((Icon) => safeRenderIcon(Icon)).filter(Boolean);

  const sources = unique(
    rendered
      .map((node) => firstImgSrc(node))
      .filter((v): v is string => typeof v === 'string' && v.length > 0)
  );
  if (sources.length > 0) {
    return createSpriteCoinDraw(sources);
  }

  const glyphs = unique(
    rendered
      .map((node) => firstStringLike(node as ReactChildLike))
      .filter((v): v is string => typeof v === 'string' && v.length > 0)
  );
  if (glyphs.length > 0) {
    return createEmojiCoinDraw(glyphs);
  }

  return config.drawCoinParticle ?? drawDefaultCoin;
};
