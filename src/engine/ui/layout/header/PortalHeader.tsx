import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';

import type {
  GameConfig,
  QuestionDifficulty,
  SlideshowScreen,
  ThemeColors,
} from '../../../types';
import { VolumeButton } from '../../components/buttons';
import { useHeaderImages } from './useHeaderImages';

type Motion = 'open' | 'close';

type PortalConfig = {
  targetAspect: number; // 950/300
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
  targetAspect: 950 / 300,
  portalMargin: 0.06,
  superN: 2.7,

  portalDetail: 0.92,
  revealDetail: 1.1,
  portalTSpeed: 0.55,
  revealTSpeed: 0.78,

  layersCount: 4,
  layerScaleInner: 0.9,
  layerScaleOuter: 1.13,
  layerAlphaInner: 1.0,
  layerAlphaOuter: 0.18,

  gapOpen: 0.12,
  gapClose: 0.09,
  openDelayGamma: 1.8,
  closeDelayGamma: 0.65,

  alphaOpenInnerGamma: 1.25,
  alphaOpenOuterGamma: 0.55,
  alphaCloseInnerGamma: 1.05,
  alphaCloseOuterGamma: 2.2,

  enableBlur: true,
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

  const lump =
    0.1 * Math.sin((angle + anglePhase) * 1.0 + (time + timePhase) * 0.33 * v1) +
    0.07 * Math.sin((angle + anglePhase) * 2.0 - (time + timePhase) * 0.21 * v2) +
    0.05 * Math.sin((angle - anglePhase * 0.7) * 0.5 + (time - timePhase * 0.6) * 0.18);

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

    let blurPx = 0;
    if (cfg.enableBlur) {
      blurPx = cfg.featherBasePx + (layers.length - 1 - layerIndex) * cfg.blurStepPx;
    }

    ctx.filter = cfg.enableBlur ? `blur(${blurPx * cfg.featherMult}px)` : 'none';
    ctx.globalAlpha = layer.alpha * alphaFactor * 0.55;
    drawSuperBlobPath(ctx, cfg, a * 1.03, b * 1.03, t + 0.22, profile, {
      steps,
      detail,
      seed: seed + 101,
    });
    ctx.fill();

    const coreBlur = Math.max(0.4, blurPx * cfg.coreMult);
    ctx.filter = cfg.enableBlur ? `blur(${coreBlur}px)` : 'none';
    ctx.globalAlpha = layer.alpha * alphaFactor;
    drawSuperBlobPath(ctx, cfg, a, b, t, profile, { steps, detail, seed });
    ctx.fill();
  }

  ctx.filter = 'none';
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

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;

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

function usePortalCanvas({
  canvasRef,
  containerRef,
  cfg,
  openMs,
  closeMs,
  opacity,
}: {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  cfg: PortalConfig;
  openMs: number;
  closeMs: number;
  opacity: number;
}): PortalCanvasHandle {
  const tokenRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  const stateRef = useRef<PortalAnimState>({
    motion: 'open',
    reveal: 0,
    alpha: 0,
    phaseShift: 0,
    currentSrc: '',
    nextSrc: '',
  });

  const imageCacheRef = useRef(new Map<string, HTMLImageElement>());
  const pendingLoadsRef = useRef(new Map<string, Promise<void>>());
  const layersRef = useRef<LayerDef[]>(makeLayers(cfg));
  const portalMaskRef = useRef<HTMLCanvasElement | null>(null);
  const revealMaskRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    layersRef.current = makeLayers(cfg);
  }, [cfg]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      sizeRef.current = { w, h, dpr };

      const canvas = canvasRef.current;
      if (!canvas) return;

      const pixelW = Math.max(1, Math.floor(w * dpr));
      const pixelH = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== pixelW) canvas.width = pixelW;
      if (canvas.height !== pixelH) canvas.height = pixelH;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      if (!portalMaskRef.current) portalMaskRef.current = ensureOffscreen(pixelW, pixelH);
      if (!revealMaskRef.current) revealMaskRef.current = ensureOffscreen(pixelW, pixelH);

      if (portalMaskRef.current.width !== pixelW) portalMaskRef.current.width = pixelW;
      if (portalMaskRef.current.height !== pixelH) portalMaskRef.current.height = pixelH;
      if (revealMaskRef.current.width !== pixelW) revealMaskRef.current.width = pixelW;
      if (revealMaskRef.current.height !== pixelH) revealMaskRef.current.height = pixelH;
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [canvasRef, containerRef]);

  const ensureImage = useCallback((src: string) => {
    if (!src) return;
    if (imageCacheRef.current.has(src)) return;
    if (pendingLoadsRef.current.has(src)) return;

    const p = loadImage(src)
      .then((img) => {
        imageCacheRef.current.set(src, img);
      })
      .catch(() => {})
      .finally(() => {
        pendingLoadsRef.current.delete(src);
      });

    pendingLoadsRef.current.set(src, p);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const startedAt = nowMs();

    const drawFrame = () => {
      if (!running) return;

      const { w, h, dpr } = sizeRef.current;
      if (!w || !h) {
        raf = requestAnimationFrame(drawFrame);
        return;
      }

      const st = stateRef.current;
      const currentSrc = st.currentSrc;
      if (!currentSrc) {
        raf = requestAnimationFrame(drawFrame);
        return;
      }

      const img = imageCacheRef.current.get(currentSrc);
      if (!img) {
        ensureImage(currentSrc);
        raf = requestAnimationFrame(drawFrame);
        return;
      }

      const pixelW = canvas.width;
      const pixelH = canvas.height;

      const portalMask = portalMaskRef.current;
      const revealMask = revealMaskRef.current;
      if (!portalMask || !revealMask) {
        raf = requestAnimationFrame(drawFrame);
        return;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, pixelW, pixelH);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.globalAlpha = st.alpha * opacity;
      ctx.globalCompositeOperation = 'source-over';
      ctx.imageSmoothingEnabled = true;
      drawCoverImage(ctx, img, w, h);

      const dims = getPortalHalfDims(cfg, w, h);
      const layers = layersRef.current;
      const time = (nowMs() - startedAt) / 1000 + st.phaseShift;

      const pm = portalMask.getContext('2d')!;
      pm.setTransform(1, 0, 0, 1, 0, 0);
      pm.clearRect(0, 0, pixelW, pixelH);
      pm.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawPyramidMask(
        pm,
        cfg,
        layers,
        w * 0.5,
        h * 0.5,
        dims.a,
        dims.b,
        1,
        time * cfg.portalTSpeed,
        'portal',
        'open'
      );

      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(portalMask, 0, 0, w, h);

      const rm = revealMask.getContext('2d')!;
      rm.setTransform(1, 0, 0, 1, 0, 0);
      rm.clearRect(0, 0, pixelW, pixelH);
      rm.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawPyramidMask(
        rm,
        cfg,
        layers,
        w * 0.5,
        h * 0.5,
        dims.a,
        dims.b,
        st.reveal,
        time * cfg.revealTSpeed,
        'reveal',
        st.motion
      );

      ctx.drawImage(revealMask, 0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(drawFrame);
    };

    raf = requestAnimationFrame(drawFrame);
    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [canvasRef, cfg, ensureImage, opacity]);

  const show = useCallback(
    (imageSrc: string) => {
      if (!imageSrc) return;
      const token = ++tokenRef.current;
      const st = stateRef.current;

      ensureImage(imageSrc);

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
        st.currentSrc = imageSrc;
        st.nextSrc = '';
        st.motion = 'open';
        st.reveal = 0;
        st.alpha = 0;
        tween('reveal', 0, 1, openMs, easeOpen);
        tween('alpha', 0, 1, Math.round(openMs * 0.7), easeOpen);
        return;
      }

      st.nextSrc = imageSrc;
      ensureImage(st.nextSrc);
      st.motion = 'close';
      st.alpha = 1;

      tween('reveal', st.reveal, 0, closeMs, easeClose, () => {
        if (tokenRef.current !== token) return;
        if (st.nextSrc) {
          st.currentSrc = st.nextSrc;
          st.nextSrc = '';
        }
        st.phaseShift = Math.random() * 1000;
        st.motion = 'open';
        tween('reveal', 0, 1, openMs, easeOpen);
      });
    },
    [closeMs, ensureImage, openMs]
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
      }
    };

    requestAnimationFrame(step);
  }, [closeMs]);

  const isShowing = useCallback(() => {
    const st = stateRef.current;
    return !!st.currentSrc && st.alpha > 0.01;
  }, []);

  return { show, hide, isShowing };
}

interface PortalHeaderProps {
  config: GameConfig;
  theme: ThemeColors;
  slideshowScreen: SlideshowScreen;
  campaignId?: string;
  difficulty?: QuestionDifficulty;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  activated: boolean;
  className?: string;
}

export function PortalHeader({
  config,
  theme,
  slideshowScreen,
  campaignId,
  difficulty,
  isMusicPlaying,
  onToggleMusic,
  activated,
  className = '',
}: PortalHeaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { enabled, isLoading, images, basePath, subfolder, displayDuration, transitionDuration, opacity } =
    useHeaderImages(config.headerSlideshow, {
      gameId: config.id,
      campaignId,
      screen: slideshowScreen,
      difficulty,
    });

  const openMs = Math.max(400, Math.round(transitionDuration * 0.65));
  const closeMs = Math.max(250, Math.round(transitionDuration * 0.5));

  const portal = usePortalCanvas({
    canvasRef,
    containerRef,
    cfg: DEFAULT_PORTAL_CFG,
    openMs,
    closeMs,
    opacity,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const lastIndexRef = useRef(-1);

  const pickRandomIndex = useCallback(() => {
    if (images.length <= 1) return 0;
    let next = 0;
    do {
      next = Math.floor(Math.random() * images.length);
    } while (next === lastIndexRef.current && images.length > 1);
    lastIndexRef.current = next;
    return next;
  }, [images.length]);

  const fullPath = useMemo(() => {
    const filename = images[currentIndex];
    if (!filename) return '';
    if (!subfolder) return `${basePath}/${filename}`;
    return `${basePath}/${subfolder}/${filename}`;
  }, [basePath, currentIndex, images, subfolder]);

  useEffect(() => {
    if (!enabled || isLoading || images.length === 0) return;
    const initial = pickRandomIndex();
    setCurrentIndex(initial);
  }, [enabled, images, isLoading, pickRandomIndex]);

  useEffect(() => {
    if (!activated) {
      portal.hide();
      return;
    }
    if (!enabled || isLoading || !fullPath) return;
    portal.show(fullPath);
  }, [activated, enabled, fullPath, isLoading, portal]);

  useEffect(() => {
    if (!activated) return;
    if (!enabled || isLoading) return;
    if (images.length <= 1) return;

    const intervalId = window.setInterval(() => {
      const next = pickRandomIndex();
      setCurrentIndex(next);
    }, displayDuration);

    return () => window.clearInterval(intervalId);
  }, [activated, displayDuration, enabled, images.length, isLoading, pickRandomIndex]);

  const isLightTheme = !!theme.isLight;
  const titleTextClass = theme.textTitle ?? theme.textPrimary;

  const defaultTitleShadow = isLightTheme
    ? `0 4px 18px rgba(15, 23, 42, 0.20), 0 0 26px ${theme.glowColor}55`
    : `0 4px 18px rgba(0,0,0,0.8), 0 0 32px rgba(0,0,0,0.7), 0 0 30px ${theme.glowColor}`;

  const titleShadow = theme.headerTextShadow ?? defaultTitleShadow;

  const defaultBackdrop = isLightTheme
    ? 'radial-gradient(ellipse at center, rgba(255,255,255,0.85) 20%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0) 78%)'
    : 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 25%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0) 75%)';

  const backdrop = theme.headerTextBackdrop ?? defaultBackdrop;

  return (
    <div
      className={`mb-4 relative ${className}`}
      style={{
        minHeight: 160,
        opacity: activated ? 1 : 0,
        transition: 'opacity 260ms ease',
        pointerEvents: activated ? 'auto' : 'none',
      }}
    >
      <div
        ref={containerRef}
        className="relative w-full"
        style={{
          aspectRatio: '950 / 300',
          width: 'min(1120px, calc(100% + 96px))',
          background: 'transparent',
          overflow: 'visible',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            filter:
              'drop-shadow(0 22px 44px rgba(0,0,0,0.55)) drop-shadow(0 0 22px rgba(0,0,0,0.35))',
          }}
        />

        <div className="absolute inset-0 p-4 flex flex-col justify-center">
          <VolumeButton
            onClick={onToggleMusic}
            title={isMusicPlaying ? config.strings.musicOn : config.strings.musicOff}
          >
            {isMusicPlaying ? '🔊' : '🔇'}
          </VolumeButton>

          <div className="relative max-w-5xl mx-auto text-center flex items-center justify-center min-h-[180px]">
            <div
              className="pointer-events-none absolute inset-x-6 top-2 h-32"
              style={{
                background: backdrop,
                filter: 'blur(18px)',
                opacity: isLightTheme ? 0.9 : 0.95,
              }}
              aria-hidden="true"
            />
            <div className="relative z-10 space-y-1">
              <h1
                className={`text-2xl md:text-3xl font-bold tracking-wider transition-colors duration-500 ${titleTextClass}`}
                style={{
                  textShadow: titleShadow,
                }}
              >
                {config.title}
              </h1>
              <h2
                className={`text-lg tracking-wide transition-colors duration-500 ${titleTextClass}`}
                style={{
                  lineHeight: '1.5',
                  fontStyle: 'italic',
                  textShadow: titleShadow,
                }}
              >
                {config.subtitle}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortalHeader;
