import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';

import type {
  GameConfig,
  QuestionDifficulty,
  SlideshowScreen,
} from '@engine/types';
import { VolumeButton } from '@engine/ui/components/buttons';
import {
  PortalHeaderTuner,
  type PortalHeaderTunerValues
} from '@engine/ui/components/sliders';
import { DEFAULT_PORTAL_HEADER_TUNER_VALUES } from '@engine/ui/components/sliders/portalHeaderTunerDefaults';
import { useHeaderImages } from './useHeaderImages';
import { usePortalTunerUi } from './portal/usePortalTunerUi';
import { PortalHeaderCanvasLayer } from './portal/PortalHeaderCanvasLayer';
import { useViewportAnchorTop } from './portal/useViewportAnchorTop';

type Motion = 'open' | 'close';

function prefersReducedMotion() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  } catch {
    return false;
  }
}

type PortalConfig = {
  targetAspect: number; // 960/310
  portalMargin: number; // safe padding inside canvas
  superN: number; // 2=ellipse, higher=more rectangular

  portalDetail: number;
  revealDetail: number;
  portalTSpeed: number;
  revealTSpeed: number;

  layersCount: number;
  layerScaleInner: number;
  layerScaleOuter: number;
  layerAlphaInner: number;
  layerAlphaOuter: number;

  gapOpen: number;
  gapClose: number;
  openDelayGamma: number;
  closeDelayGamma: number;

  alphaOpenInnerGamma: number;
  alphaOpenOuterGamma: number;
  alphaCloseInnerGamma: number;
  alphaCloseOuterGamma: number;

  enableBlur: boolean;
  featherBasePx: number;
  blurStepPx: number;
  featherMult: number;
  coreMult: number;

  layerPhaseOffset: number;
  layerPhaseJitter: number;
};

const DEFAULT_PORTAL_CFG: PortalConfig = {
  targetAspect: 960 / 310,
  portalMargin: 0.05,
  superN: 2.7,

  portalDetail: 0.9,
  revealDetail: 1.1,
  portalTSpeed: 0.55,
  revealTSpeed: 0.8,

  layersCount: 3,
  layerScaleInner: 0.9,
  layerScaleOuter: 1.1,
  layerAlphaInner: 1.0,
  layerAlphaOuter: 0.1,

  gapOpen: 0.12,
  gapClose: 0.1,
  openDelayGamma: 1.8,
  closeDelayGamma: 0.65,

  alphaOpenInnerGamma: 1.25,
  alphaOpenOuterGamma: 0.55,
  alphaCloseInnerGamma: 1.05,
  alphaCloseOuterGamma: 2.2,

  enableBlur: false,
  featherBasePx: 2.5,
  blurStepPx: 3.0,
  featherMult: 2.3,
  coreMult: 1.0,

  layerPhaseOffset: 0.75,
  layerPhaseJitter: 0.35,
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function powAbs(value: number, power: number) {
  return Math.pow(Math.abs(value), power);
}

function sgn(value: number) {
  // Avoid discontinuities around -0 / tiny float noise (important for angle=0/2π seam).
  const EPS = 1e-12;
  if (Math.abs(value) < EPS) return 0;
  return value < 0 ? -1 : 1;
}

function nowMs() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function hash01(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function easeInPow(t: number, power: number) {
  return Math.pow(clamp01(t), Math.max(1e-3, power));
}

function easeOutPow(t: number, power: number) {
  const x = 1 - clamp01(t);
  return 1 - Math.pow(x, Math.max(1e-3, power));
}

type LayerDef = { scale: number; alpha: number };

function makeLayers(cfg: PortalConfig): LayerDef[] {
  const layersCount = Math.max(1, Math.round(cfg.layersCount));
  const layers: LayerDef[] = [];
  for (let layerIndex = 0; layerIndex < layersCount; layerIndex += 1) {
    const t = layersCount === 1 ? 0 : layerIndex / (layersCount - 1);
    layers.push({
      scale: lerp(cfg.layerScaleInner, cfg.layerScaleOuter, t),
      alpha: lerp(cfg.layerAlphaInner, cfg.layerAlphaOuter, t),
    });
  }
  return layers;
}

function getPortalHalfDims(
  cfg: PortalConfig,
  width: number,
  height: number
): { a: number; b: number } {
  const maxH = height * 0.5 * (1 - cfg.portalMargin * 2);
  const maxW = width * 0.5 * (1 - cfg.portalMargin * 2);

  const b = maxH;
  const a = Math.min(maxW, b * cfg.targetAspect);
  const b2 = Math.min(b, a / cfg.targetAspect);

  return { a, b: b2 };
}

function superellipsePoint(angle: number, a: number, b: number, n: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const p = 2 / n;
  return {
    x: a * sgn(cos) * powAbs(cos, p),
    y: b * sgn(sin) * powAbs(sin, p),
  };
}

function wobbleScale(
  angle: number,
  time: number,
  detail: number,
  profile: 'portal' | 'reveal',
  seed: number
) {
  const k = profile === 'reveal' ? 0.85 : 1.0;

  const s1 = (hash01(seed + 1.3) - 0.5) * 2;
  const s2 = (hash01(seed + 2.7) - 0.5) * 2;
  const s3 = (hash01(seed + 5.1) - 0.5) * 2;

  const anglePhase = s1 * 1.8;
  const timePhase = s2 * 1.6;

  const v1 = 1.0 + 0.1 * s3;
  const v2 = 1.0 + 0.07 * s1;

  // Big features
  // IMPORTANT: keep angular frequencies integer-valued.
  // Fractional values (e.g. 0.5) break 2π periodicity so angle=0 and angle=2π no longer match,
  // which shows up as a seam / phase break where the path closes.
  const lump =
    0.11 * Math.sin((angle + anglePhase) * 1.0 + (time + timePhase) * 0.33 * v1) +
    0.08 * Math.sin((angle + anglePhase) * 2.0 - (time + timePhase) * 0.21 * v2) +
    0.06 * Math.sin((angle - anglePhase * 0.6) * 4.0 + (time - timePhase * 0.4) * 0.18);

  const fine =
    0.082 * Math.sin(2 * (angle + anglePhase) + (time + timePhase) * 1.05 * v1) +
    0.061 * Math.sin(3 * (angle - anglePhase * 0.6) - (time + timePhase) * 0.78 * v2) +
    0.044 * Math.sin(5 * (angle + anglePhase * 0.4) + (time - timePhase) * 0.46) +
    0.03 * Math.sin(9 * (angle - anglePhase) - (time - timePhase) * 0.31) +
    0.022 * Math.sin(13 * (angle + anglePhase * 0.2) + (time + timePhase) * 0.27);

  return 1 + k * detail * (fine + lump);
}

function drawSuperBlobPath(
  ctx: CanvasRenderingContext2D,
  cfg: PortalConfig,
  a: number,
  b: number,
  time: number,
  profile: 'portal' | 'reveal',
  opts: { steps: number; detail: number; seed: number }
) {
  const { steps, detail, seed } = opts;

  const size = Math.min(a, b);
  const sizeScale = clamp01(size / 220);
  const effectiveDetail = detail * (0.12 + 0.88 * sizeScale);

  ctx.beginPath();
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    const p = superellipsePoint(angle, a, b, cfg.superN);
    const wobble = wobbleScale(angle, time, effectiveDetail, profile, seed);

    const x = p.x * wobble;
    const y = p.y * wobble;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function layerFactor(
  cfg: PortalConfig,
  reveal: number,
  layerIndex: number,
  layersCount: number,
  motion: Motion
) {
  const n1 = Math.max(1, layersCount - 1);

  if (motion === 'close') {
    const totalDelay = n1 * cfg.gapClose;
    const denom = Math.max(0.001, 1 - totalDelay);
    const closeT = 1 - clamp01(reveal);
    const r = layerIndex / n1;
    const delay = Math.pow(r, cfg.closeDelayGamma) * totalDelay;
    const shrink = clamp01((closeT - delay) / denom);
    return 1 - shrink;
  }

  const totalDelay = n1 * cfg.gapOpen;
  const denom = Math.max(0.001, 1 - totalDelay);
  const openT = clamp01(reveal);
  const r = (layersCount - 1 - layerIndex) / n1;
  const delay = Math.pow(r, cfg.openDelayGamma) * totalDelay;
  return clamp01((openT - delay) / denom);
}

function layerAlphaFactor(
  cfg: PortalConfig,
  p: number,
  layerIndex: number,
  layersCount: number,
  motion: Motion
) {
  const pp = clamp01(p);
  const h = layersCount <= 1 ? 0 : layerIndex / (layersCount - 1);

  if (motion === 'open') {
    const gamma = lerp(cfg.alphaOpenInnerGamma, cfg.alphaOpenOuterGamma, h);
    return Math.pow(pp, gamma);
  }

  const gamma = lerp(cfg.alphaCloseInnerGamma, cfg.alphaCloseOuterGamma, h);
  return Math.pow(pp, gamma);
}

function drawPyramidMask(
  ctx: CanvasRenderingContext2D,
  cfg: PortalConfig,
  layers: LayerDef[],
  cx: number,
  cy: number,
  baseA: number,
  baseB: number,
  masterProgress: number,
  time: number,
  profile: 'portal' | 'reveal',
  motion: Motion
) {
  const detail = profile === 'reveal' ? cfg.revealDetail : cfg.portalDetail;
  const steps = profile === 'reveal' ? 220 : 250;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(255,255,255,1)';

  for (let layerIndex = 0; layerIndex < layers.length; layerIndex += 1) {
    const layer = layers[layerIndex];
    const p = layerFactor(cfg, masterProgress, layerIndex, layers.length, motion);
    const alphaFactor = layerAlphaFactor(cfg, p, layerIndex, layers.length, motion);

    const minA = 6;
    const minB = 6;
    const a = Math.max(minA, baseA * layer.scale * p);
    const b = Math.max(minB, baseB * layer.scale * p);

    const seed = (profile === 'reveal' ? 1000 : 2000) + layerIndex * 17.0;
    const t =
      time +
      layerIndex * cfg.layerPhaseOffset +
      (hash01(seed + 9.9) - 0.5) * cfg.layerPhaseJitter;

    if (!cfg.enableBlur) {
      if (ctx.filter !== 'none') ctx.filter = 'none';

      ctx.globalAlpha = layer.alpha * alphaFactor * 0.18;
      drawSuperBlobPath(ctx, cfg, a * 1.1, b * 1.1, t + 0.33, profile, {
        steps,
        detail,
        seed: seed + 303,
      });
      ctx.fill();

      ctx.globalAlpha = layer.alpha * alphaFactor * 0.32;
      drawSuperBlobPath(ctx, cfg, a * 1.04, b * 1.04, t + 0.22, profile, {
        steps,
        detail,
        seed: seed + 101,
      });
      ctx.fill();

      ctx.globalAlpha = layer.alpha * alphaFactor;
      drawSuperBlobPath(ctx, cfg, a, b, t, profile, { steps, detail, seed });
      ctx.fill();
      continue;
    }

    const blurPx = cfg.featherBasePx + (layers.length - 1 - layerIndex) * cfg.blurStepPx;

    const outerFilter = cfg.enableBlur ? `blur(${blurPx * cfg.featherMult}px)` : 'none';
    if (ctx.filter !== outerFilter) ctx.filter = outerFilter;
    ctx.globalAlpha = layer.alpha * alphaFactor * 0.55;
    drawSuperBlobPath(ctx, cfg, a * 1.03, b * 1.03, t + 0.22, profile, {
      steps,
      detail,
      seed: seed + 101,
    });
    ctx.fill();

    const coreBlur = Math.max(0.4, blurPx * cfg.coreMult);
    const coreFilter = cfg.enableBlur ? `blur(${coreBlur}px)` : 'none';
    if (ctx.filter !== coreFilter) ctx.filter = coreFilter;
    ctx.globalAlpha = layer.alpha * alphaFactor;
    drawSuperBlobPath(ctx, cfg, a, b, t, profile, { steps, detail, seed });
    ctx.fill();
  }

  if (ctx.filter !== 'none') ctx.filter = 'none';
  ctx.restore();
  ctx.globalAlpha = 1;
}

function ensureOffscreen(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  if (img.complete) return img;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  });
  return img;
}

function getSourceDims(source: CanvasImageSource): { w: number; h: number } | null {
  if (source instanceof HTMLImageElement) {
    const w = source.naturalWidth || source.width;
    const h = source.naturalHeight || source.height;
    if (!w || !h) return null;
    return { w, h };
  }

  if (source instanceof HTMLCanvasElement) {
    const w = source.width;
    const h = source.height;
    if (!w || !h) return null;
    return { w, h };
  }

  if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) {
    const w = source.width;
    const h = source.height;
    if (!w || !h) return null;
    return { w, h };
  }

  const anySource = source as unknown as { width?: number; height?: number };
  if (typeof anySource.width === 'number' && typeof anySource.height === 'number') {
    const w = anySource.width;
    const h = anySource.height;
    if (!w || !h) return null;
    return { w, h };
  }

  return null;
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  w: number,
  h: number
) {
  const dims = getSourceDims(img);
  if (!dims) return;
  const iw = dims.w;
  const ih = dims.h;

  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

type PortalCanvasHandle = {
  show: (imageSrc: string) => void;
  hide: () => void;
  isShowing: () => boolean;
};

type PortalAnimState = {
  motion: Motion;
  reveal: number;
  alpha: number;
  phaseShift: number;
  currentSrc: string;
  nextSrc: string;
};

type CachedImage = {
  source: CanvasImageSource;
  release: () => void;
};

function usePortalCanvas({
  canvasRef,
  containerRef,
  cfg,
  openMs,
  closeMs,
  opacity,
  onLayoutSize,
}: {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  cfg: PortalConfig;
  openMs: number;
  closeMs: number;
  opacity: number;
  onLayoutSize?: (size: { w: number; h: number }) => void;
}): PortalCanvasHandle {
  const reduceMotion = useMemo(() => prefersReducedMotion(), []);
  const idleMotionEnabled = !reduceMotion;
  const maxDpr = 2;
  const targetFps = 60;
  const maxCachedImages = 12;
  const maxRasterPixels = 1_600_000;

  const tokenRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const portalScaleRef = useRef({ x: 0.9, y: 0.85 });
  const maskPadRef = useRef({ css: 0, px: 0 });
  const rafRef = useRef<number | null>(null);
  const drawFrameRef = useRef<(() => void) | null>(null);
  const startedAtRef = useRef(nowMs());
  const lastFrameMsRef = useRef(0);
  const frozenTimeRef = useRef(0);
  const mainCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const portalMaskCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const revealMaskCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const stateRef = useRef<PortalAnimState>({
    motion: 'open',
    reveal: 0,
    alpha: 0,
    phaseShift: 0,
    currentSrc: '',
    nextSrc: '',
  });

  const imageCacheRef = useRef(new Map<string, CachedImage>());
  const pendingLoadsRef = useRef(new Map<string, Promise<void>>());
  const layersRef = useRef<LayerDef[]>(makeLayers(cfg));
  const portalMaskRef = useRef<HTMLCanvasElement | null>(null);
  const revealMaskRef = useRef<HTMLCanvasElement | null>(null);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const ensureLoop = useCallback(() => {
    const drawFrame = drawFrameRef.current;
    if (!drawFrame) return;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(drawFrame);
  }, []);

  const pruneImageCache = useCallback(
    (keep: string[]) => {
      const keepSet = new Set(keep.filter(Boolean));
      const cache = imageCacheRef.current;

      for (const key of Array.from(cache.keys())) {
        if (!keepSet.has(key)) {
          const entry = cache.get(key);
          cache.delete(key);
          entry?.release();
        }
      }

      while (cache.size > maxCachedImages) {
        const oldestKey = cache.keys().next().value as string | undefined;
        if (!oldestKey) break;
        if (keepSet.has(oldestKey)) {
          const img = cache.get(oldestKey);
          if (img) {
            cache.delete(oldestKey);
            cache.set(oldestKey, img);
          } else {
            cache.delete(oldestKey);
          }
          continue;
        }
        const entry = cache.get(oldestKey);
        cache.delete(oldestKey);
        entry?.release();
      }
    },
    [maxCachedImages]
  );

  useEffect(() => {
    layersRef.current = makeLayers(cfg);
  }, [cfg]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      // IMPORTANT: avoid getBoundingClientRect() here because it includes CSS transforms (e.g. tuner scale),
      // which leads to double-scaling and visible horizontal drift. clientWidth/Height reflect layout size.
      const w = Math.max(1, Math.round(el.clientWidth));
      const h = Math.max(1, Math.round(el.clientHeight));
      const dpr = Math.max(1, Math.min(maxDpr, window.devicePixelRatio || 1));
      sizeRef.current = { w, h, dpr };
      onLayoutSize?.({ w, h });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const pixelW = Math.max(1, Math.floor(w * dpr));
      const pixelH = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== pixelW) canvas.width = pixelW;
      if (canvas.height !== pixelH) canvas.height = pixelH;

      const enableBlur = cfg.enableBlur;
      const layersCount = Math.max(1, Math.round(cfg.layersCount));
      const maxBlurPx = enableBlur
        ? cfg.featherBasePx + (layersCount - 1) * cfg.blurStepPx
        : 0;
      const padCss = enableBlur ? Math.ceil(maxBlurPx * cfg.featherMult + 6) : 0;
      const padPx = Math.max(0, Math.ceil(padCss * dpr));
      maskPadRef.current = { css: padCss, px: padPx };

      const maskW = pixelW + padPx * 2;
      const maskH = pixelH + padPx * 2;

      if (!portalMaskRef.current) portalMaskRef.current = ensureOffscreen(maskW, maskH);
      if (!revealMaskRef.current) revealMaskRef.current = ensureOffscreen(maskW, maskH);

      if (portalMaskRef.current.width !== maskW) portalMaskRef.current.width = maskW;
      if (portalMaskRef.current.height !== maskH) portalMaskRef.current.height = maskH;
      if (revealMaskRef.current.width !== maskW) revealMaskRef.current.width = maskW;
      if (revealMaskRef.current.height !== maskH) revealMaskRef.current.height = maskH;

      portalMaskCtxRef.current = portalMaskRef.current.getContext('2d');
      revealMaskCtxRef.current = revealMaskRef.current.getContext('2d');
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [
    canvasRef,
    containerRef,
    cfg.enableBlur,
    cfg.blurStepPx,
    cfg.featherBasePx,
    cfg.featherMult,
    cfg.layersCount,
    maxDpr,
    onLayoutSize,
  ]);

  const rasterizeImage = useCallback(
    async (src: string): Promise<CachedImage> => {
      const img = await loadImage(src);
      const { w, h, dpr } = sizeRef.current;

      const desiredW = Math.max(1, Math.floor(w * dpr));
      const desiredH = Math.max(1, Math.floor(h * dpr));
      const desiredPixels = desiredW * desiredH;

      const scale =
        desiredPixels > maxRasterPixels
          ? Math.sqrt(maxRasterPixels / Math.max(1, desiredPixels))
          : 1;

      const rasterW = Math.max(1, Math.floor(desiredW * scale));
      const rasterH = Math.max(1, Math.floor(desiredH * scale));

      const canvas = document.createElement('canvas');
      canvas.width = rasterW;
      canvas.height = rasterH;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        drawCoverImage(ctx, img, rasterW, rasterH);
      }

      try {
        // Help WebKit drop decoded backing store sooner.
        img.src = '';
      } catch {
        // ignore
      }

      return {
        source: canvas,
        release: () => {
          canvas.width = 0;
          canvas.height = 0;
        },
      };
    },
    [maxRasterPixels]
  );

  const ensureImage = useCallback((src: string) => {
    if (!src) return;
    if (imageCacheRef.current.has(src)) return;
    if (pendingLoadsRef.current.has(src)) return;

    const p = rasterizeImage(src)
      .then((entry) => {
        imageCacheRef.current.set(src, entry);
      })
      .catch(() => {})
      .finally(() => {
        pendingLoadsRef.current.delete(src);
      });

    pendingLoadsRef.current.set(src, p);
  }, [rasterizeImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    mainCtxRef.current = canvas.getContext('2d');
    if (!mainCtxRef.current) return;

    const scheduleNext = () => {
      if (rafRef.current !== null) return;
      if (!drawFrameRef.current) return;
      rafRef.current = requestAnimationFrame(drawFrameRef.current);
    };

    const drawFrame = () => {
      rafRef.current = null;

      try {
        if (document.visibilityState === 'hidden') return;
      } catch {
        // ignore
      }

      const { w, h, dpr } = sizeRef.current;
      if (!w || !h) {
        scheduleNext();
        return;
      }

      const st = stateRef.current;
      const currentSrc = st.currentSrc;
      if (!currentSrc) return;

      const cache = imageCacheRef.current;
      const entry = cache.get(currentSrc);
      if (!entry) {
        ensureImage(currentSrc);
        scheduleNext();
        return;
      }

      cache.delete(currentSrc);
      cache.set(currentSrc, entry);
      pruneImageCache([currentSrc, st.nextSrc]);

      const portalMask = portalMaskRef.current;
      const revealMask = revealMaskRef.current;
      const ctx = mainCtxRef.current;
      const pm = portalMaskCtxRef.current;
      const rm = revealMaskCtxRef.current;
      if (!portalMask || !revealMask || !ctx || !pm || !rm) {
        scheduleNext();
        return;
      }

      const img = entry.source;
      const timeNow = nowMs();
      const frameBudgetMs = 1000 / Math.max(1, targetFps);
      if (timeNow - lastFrameMsRef.current < frameBudgetMs) {
        scheduleNext();
        return;
      }
      lastFrameMsRef.current = timeNow;

      const enableBlur = cfg.enableBlur;
      const effectiveCfg: PortalConfig = enableBlur ? cfg : { ...cfg, enableBlur: false };

      const transitionActive =
        st.motion === 'close' || st.reveal < 0.999 || st.alpha < 0.999;
      const animateWobble = transitionActive || idleMotionEnabled;
      let time = frozenTimeRef.current;
      if (animateWobble) {
        time = (timeNow - startedAtRef.current) / 1000 + st.phaseShift;
        frozenTimeRef.current = time;
      }

      const pixelW = canvas.width;
      const pixelH = canvas.height;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, pixelW, pixelH);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.globalAlpha = st.alpha * opacity;
      ctx.globalCompositeOperation = 'source-over';
      ctx.imageSmoothingEnabled = true;
      drawCoverImage(ctx, img, w, h);

      const dims = getPortalHalfDims(effectiveCfg, w, h);
      const scaledDims = {
        a: dims.a * portalScaleRef.current.x,
        b: dims.b * portalScaleRef.current.y,
      };
      const layers = layersRef.current;
      const padCss = maskPadRef.current.css;

      pm.setTransform(1, 0, 0, 1, 0, 0);
      pm.clearRect(0, 0, portalMask.width, portalMask.height);
      pm.setTransform(dpr, 0, 0, dpr, 0, 0);
      pm.translate(padCss, padCss);
      drawPyramidMask(
        pm,
        effectiveCfg,
        layers,
        w * 0.5,
        h * 0.5,
        scaledDims.a,
        scaledDims.b,
        1,
        time * effectiveCfg.portalTSpeed,
        'portal',
        'open'
      );

      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(portalMask, -padCss, -padCss, w + padCss * 2, h + padCss * 2);

      rm.setTransform(1, 0, 0, 1, 0, 0);
      rm.clearRect(0, 0, revealMask.width, revealMask.height);
      rm.setTransform(dpr, 0, 0, dpr, 0, 0);
      rm.translate(padCss, padCss);
      drawPyramidMask(
        rm,
        effectiveCfg,
        layers,
        w * 0.5,
        h * 0.5,
        scaledDims.a,
        scaledDims.b,
        st.reveal,
        time * effectiveCfg.revealTSpeed,
        'reveal',
        st.motion
      );

      ctx.drawImage(revealMask, -padCss, -padCss, w + padCss * 2, h + padCss * 2);
      ctx.globalCompositeOperation = 'source-over';

      if (transitionActive || idleMotionEnabled) scheduleNext();
    };

    drawFrameRef.current = drawFrame;

    const onVisibility = () => {
      try {
        if (document.visibilityState === 'hidden') stopLoop();
        else if (stateRef.current.currentSrc) {
          const stNow = stateRef.current;
          const frozen = frozenTimeRef.current;
          startedAtRef.current = nowMs() - Math.max(0, frozen - stNow.phaseShift) * 1000;
          ensureLoop();
        }
      } catch {
        // ignore
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', stopLoop);
    window.addEventListener('pageshow', onVisibility);

    if (stateRef.current.currentSrc) ensureLoop();

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', stopLoop);
      window.removeEventListener('pageshow', onVisibility);
      drawFrameRef.current = null;
      stopLoop();
    };
  }, [
    canvasRef,
    cfg,
    ensureImage,
    ensureLoop,
    idleMotionEnabled,
    opacity,
    pruneImageCache,
    stopLoop,
    targetFps,
  ]);

  const show = useCallback(
    (imageSrc: string) => {
      if (!imageSrc) return;
      const token = ++tokenRef.current;
      const st = stateRef.current;

      ensureImage(imageSrc);
      ensureLoop();

      const isEmpty = !st.currentSrc || st.reveal <= 0.001 || st.alpha <= 0.001;
      const easeOpen = (t: number) => easeOutPow(t, 3.0);
      const easeClose = (t: number) => easeInPow(t, 3.0);

      const tween = (
        key: 'reveal' | 'alpha',
        from: number,
        to: number,
        ms: number,
        easing: (t: number) => number,
        onDone?: () => void
      ) => {
        const start = nowMs();
        const dur = Math.max(1, ms);
        const step = () => {
          if (tokenRef.current !== token) return;
          const t = clamp01((nowMs() - start) / dur);
          const e = easing(t);
          stateRef.current[key] = from + (to - from) * e;
          if (t < 1) requestAnimationFrame(step);
          else onDone?.();
        };
        requestAnimationFrame(step);
      };

      if (isEmpty) {
        st.phaseShift = Math.random() * 1000;
        startedAtRef.current = nowMs();
        frozenTimeRef.current = 0;
        st.currentSrc = imageSrc;
        st.nextSrc = '';
        st.motion = 'open';
        st.reveal = 0;
        st.alpha = 0;
        pruneImageCache([st.currentSrc]);
        tween('reveal', 0, 1, openMs, easeOpen);
        tween('alpha', 0, 1, Math.round(openMs * 0.7), easeOpen);
        return;
      }

      st.nextSrc = imageSrc;
      ensureImage(st.nextSrc);
      pruneImageCache([st.currentSrc, st.nextSrc]);
      st.motion = 'close';
      st.alpha = 1;

      tween('reveal', st.reveal, 0, closeMs, easeClose, () => {
        if (tokenRef.current !== token) return;
        if (st.nextSrc) {
          st.currentSrc = st.nextSrc;
          st.nextSrc = '';
        }
        st.phaseShift = Math.random() * 1000;
        startedAtRef.current = nowMs();
        frozenTimeRef.current = 0;
        st.motion = 'open';
        tween('reveal', 0, 1, openMs, easeOpen);
      });
    },
    [closeMs, ensureImage, ensureLoop, openMs, pruneImageCache]
  );

  const hide = useCallback(() => {
    const token = ++tokenRef.current;
    const st = stateRef.current;
    const easeClose = (t: number) => easeInPow(t, 3.0);

    const startReveal = st.reveal;
    const startAlpha = st.alpha;
    const start = nowMs();
    const dur = Math.max(1, closeMs);

    const step = () => {
      if (tokenRef.current !== token) return;
      const t = clamp01((nowMs() - start) / dur);
      const e = easeClose(t);
      st.motion = 'close';
      st.reveal = startReveal + (0 - startReveal) * e;
      st.alpha = startAlpha + (0 - startAlpha) * e;
      if (t < 1) requestAnimationFrame(step);
      else {
        st.currentSrc = '';
        st.nextSrc = '';
        pruneImageCache([]);
      }
    };

    ensureLoop();
    requestAnimationFrame(step);
  }, [closeMs, ensureLoop, pruneImageCache]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const devWindow = window as typeof window & {
      __millionairePortalHeader?: {
        getState: () => unknown;
        start: () => void;
        stop: () => void;
        clearCache: () => void;
      };
    };

    devWindow.__millionairePortalHeader = {
      getState: () => ({
        reduceMotion,
        idleMotionEnabled,
        maxDpr,
        targetFps,
        maxRasterPixels,
        currentSrc: stateRef.current.currentSrc,
        nextSrc: stateRef.current.nextSrc,
        canvas: {
          css: sizeRef.current,
          pixel: {
            w: canvasRef.current?.width ?? 0,
            h: canvasRef.current?.height ?? 0,
          },
        },
        cache: {
          images: imageCacheRef.current.size,
          pending: pendingLoadsRef.current.size,
          keys: Array.from(imageCacheRef.current.keys()),
        },
        masks: {
          padCss: maskPadRef.current.css,
          portal: {
            w: portalMaskRef.current?.width ?? 0,
            h: portalMaskRef.current?.height ?? 0,
          },
          reveal: {
            w: revealMaskRef.current?.width ?? 0,
            h: revealMaskRef.current?.height ?? 0,
          },
        },
        rafScheduled: rafRef.current !== null,
      }),
      start: () => ensureLoop(),
      stop: () => stopLoop(),
      clearCache: () => pruneImageCache([]),
    };

    return () => {
      delete devWindow.__millionairePortalHeader;
    };
  }, [
    canvasRef,
    ensureLoop,
    idleMotionEnabled,
    maxDpr,
    maxRasterPixels,
    pruneImageCache,
    reduceMotion,
    stopLoop,
    targetFps,
  ]);

  const isShowing = useCallback(() => {
    const st = stateRef.current;
    return !!st.currentSrc && st.alpha > 0.01;
  }, []);

  return useMemo(
    () => ({ show, hide, isShowing }),
    [hide, isShowing, show]
  );
}

interface PortalHeaderProps {
  config: GameConfig;
  slideshowScreen: SlideshowScreen;
  campaignId?: string;
  difficulty?: QuestionDifficulty;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  activated: boolean;
  onPanelsCeilingChange?: (ceilingPx: number) => void;
  onPortalHeightChange?: (heightPx: number) => void;
  className?: string;
}

export function PortalHeader({
  config,
  slideshowScreen,
  campaignId,
  difficulty,
  isMusicPlaying,
  onToggleMusic,
  activated,
  className = '',
  onPanelsCeilingChange,
  onPortalHeightChange,
}: PortalHeaderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const enableBlur = config.headerSlideshow?.enableBlur ?? false;
  const [portalBaseHeight, setPortalBaseHeight] = useState(0);

  const { enabled, isLoading, images, basePath, subfolder, displayDuration, transitionDuration, opacity } =
    useHeaderImages(config.headerSlideshow, {
      gameId: config.id,
      campaignId,
      screen: slideshowScreen,
      difficulty,
    });

  const orderMode: 'alphabetical' | 'random' =
    slideshowScreen === 'play'
      ? (config.headerSlideshow?.campaignImageOrder ?? 'random')
      : 'random';

  const orderedImages = useMemo(() => {
    if (orderMode !== 'alphabetical') return images;
    return [...images].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [images, orderMode]);

  const openMs = Math.max(400, Math.round(transitionDuration * 0.65));
  const closeMs = Math.max(250, Math.round(transitionDuration * 0.5));

  const portalCfg = useMemo(() => {
    return { ...DEFAULT_PORTAL_CFG, enableBlur };
  }, [enableBlur]);

  const portal = usePortalCanvas({
    canvasRef,
    containerRef,
    cfg: portalCfg,
    openMs,
    closeMs,
    opacity,
    onLayoutSize: useCallback(({ h }) => setPortalBaseHeight(h), []),
  });
  const { show, hide } = portal;

  const [currentIndex, setCurrentIndex] = useState(0);

  const fullPath = useMemo(() => {
    const filename = orderedImages[currentIndex];
    if (!filename) return '';
    if (!subfolder) return `${basePath}/${filename}`;
    return `${basePath}/${subfolder}/${filename}`;
  }, [basePath, currentIndex, orderedImages, subfolder]);

  useEffect(() => {
    if (!enabled || isLoading || orderedImages.length === 0) return;
    setCurrentIndex(
      orderMode === 'random'
        ? Math.floor(Math.random() * orderedImages.length)
        : 0
    );
  }, [enabled, isLoading, orderMode, orderedImages]);

  useEffect(() => {
    if (!activated) {
      hide();
      return;
    }
    if (!enabled) {
      hide();
      return;
    }
    if (isLoading) {
      // When returning to start screen (no campaign selected yet), never keep a stale end-screen image.
      if (slideshowScreen === 'start' && !campaignId) hide();
      return;
    }
    if (!fullPath) {
      hide();
      return;
    }
    show(fullPath);
  }, [activated, campaignId, enabled, fullPath, hide, isLoading, show, slideshowScreen]);

  useEffect(() => {
    if (!activated) return;
    if (!enabled || isLoading) return;
    if (orderedImages.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => {
        if (orderMode === 'alphabetical') return (prev + 1) % orderedImages.length;
        let next = 0;
        do {
          next = Math.floor(Math.random() * orderedImages.length);
        } while (next === prev && orderedImages.length > 1);
        return next;
      });
    }, displayDuration);

    return () => window.clearInterval(intervalId);
  }, [activated, displayDuration, enabled, isLoading, orderMode, orderedImages.length]);

  const tunerUiAvailable = usePortalTunerUi();

  const [tuner, setTuner] = useState<PortalHeaderTunerValues>(
    DEFAULT_PORTAL_HEADER_TUNER_VALUES
  );
  const translateY = Math.round(tuner.translateY);
  const scale = tuner.scale;
  const panelsCeilingPx = Math.round(tuner.panelsOverlap);
  const minHeightPx = Math.max(1, Math.round((portalBaseHeight || 162) * scale));
  const headerTopPx = useViewportAnchorTop(rootRef);
  const safeTranslateY = Math.max(translateY, -Math.round(headerTopPx));

  useEffect(() => {
    onPanelsCeilingChange?.(panelsCeilingPx);
  }, [onPanelsCeilingChange, panelsCeilingPx]);

  useEffect(() => {
    onPortalHeightChange?.(minHeightPx);
  }, [minHeightPx, onPortalHeightChange]);

  return (
    <>
      <PortalHeaderCanvasLayer
        translateY={safeTranslateY}
        scale={scale}
        active={activated}
        containerRef={containerRef}
        canvasRef={canvasRef}
      />

      <div
        className={`relative overflow-visible max-w-4xl mx-auto w-full ${className}`}
        ref={rootRef}
        style={{
          minHeight: minHeightPx,
          opacity: activated ? 1 : 0,
          transition: 'opacity 260ms ease',
          pointerEvents: 'none',
        }}
      >
        <div className="fixed top-3 right-3 z-[250] pointer-events-auto flex flex-col items-end gap-2">
          <VolumeButton
            onClick={onToggleMusic}
            title={isMusicPlaying ? config.strings.musicOn : config.strings.musicOff}
          >
            {isMusicPlaying ? '🔊' : '🔇'}
          </VolumeButton>

          {tunerUiAvailable && (
            <div className="mt-3">
              <PortalHeaderTuner
                storageKey={`engine:portal-header-tuner:${config.id}`}
                disabled={!activated}
                onChange={setTuner}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default PortalHeader;
