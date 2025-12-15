import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Portal Header (Canvas)
 *
 * Goal
 * - A self-contained "header" object that can reveal different scenes (A/B today;
 *   later can be real images) through a living, smoky blob portal.
 * - The scene itself is never warped. All motion lives in the mask boundary and
 *   its soft alpha falloff (the "portal edge").
 *
 * Visual model (what you see)
 * - Think "hole in the wall" rather than a hard rectangle:
 *   - Core region is more opaque.
 *   - Outer edge fades to transparent via a gaussian-ish blur.
 * - The boundary is a wobbling superellipse (between ellipse and rounded-rect)
 *   with multi-frequency noise-like motion.
 * - The portal is built from a 3–7 layer "pyramid":
 *   - Layer 0 (inner) is the most opaque and smallest.
 *   - Higher layers are progressively larger and more transparent.
 *   - Each layer has its own phase offset, so edges don't perfectly overlap.
 *
 * Interaction / API
 * - Default: invisible (renders nothing).
 * - Imperative handle: {@link PortalHeaderHandle}
 *   - show("A"|"B"): ALWAYS performs close → (switch at tightest point) → open.
 *       - That means every button press produces a brand new blob contour.
 *       - Switching A→B happens only at reveal==0 (no fade-to-black).
 *   - hide(): closes to the center and then hides the canvas.
 *
 * Animation state
 * - stateRef contains:
 *   - reveal: 0..1 (how open the portal is)
 *   - alpha: 0..1 (canvas/global visibility, used only for hide/show)
 *   - motion: "open" | "close" (affects cascade direction)
 *   - current/next: active and pending scene ids
 *   - phaseShift: randomized per show() press; changes the wobble start phase
 *
 * Rendering pipeline (per RAF tick)
 * 1) Build scene (offscreen) — drawSceneA/drawSceneB are placeholders.
 * 2) Draw the current scene to the visible canvas.
 * 3) Multiply by the constant PORTAL mask (destination-in):
 *    - portal mask is always fully "open" (masterProgress = 1).
 *    - provides the stable portal silhouette.
 * 4) Multiply by the animated REVEAL mask (destination-in):
 *    - reveal mask uses masterProgress = state.reveal.
 *    - provides open/close and cascade behavior.
 *
 * Mask implementation details
 * - drawPyramidMask() draws N layers; each layer is drawn twice:
 *   - Feather pass: stronger blur, lower alpha (soft falloff).
 *   - Core pass: weaker blur, higher alpha (keeps the interior readable).
 * - Each layer's size factor p is computed by layerFactor():
 *   - OPEN: outer layers start earlier (transparent → opaque cascade)
 *   - CLOSE: inner layers collapse earlier (opaque → transparent cascade)
 * - Alpha follows the SAME p as size, but shaped via layerAlphaFactor() using
 *   per-layer gamma (power). This preserves "alpha follows size" while allowing
 *   faster/slower fade for different layers.
 *
 * Where to tweak things fast (most impactful)
 * - DEFAULT_CFG:
 *   - openMs / closeMs: transition lengths
 *   - easeOpenPower / easeClosePower: easing steepness
 *   - layersCount: number of pyramid layers
 *   - featherBasePx / blurStepPx / featherMult / coreMult: softness profile
 *   - revealDetail: wobble intensity
 *   - superN: portal shape (2=ellipse, higher=squarer)
 *   - layerPhaseOffset / layerPhaseJitter: how de-synced layers feel
 *
 * Performance notes
 * - This approach is CPU-bound (canvas + blur filters). For 1280×480 it should
 *   be fine, but increasing layersCount and blur can be expensive.
 * - Config is stored in cfgRef so sliders update live without restarting RAF.
 */

// -------------------------------------------------------------
// Configuration (DEFAULTS)
// -------------------------------------------------------------

type PortalConfig = {
  // Canvas size (logical CSS px; DPR handled separately)
  width: number;
  height: number;

  // Transition durations (ms)
  openMs: number;
  closeMs: number;

  // Easing shape: we implement ease-in/out as (t^p)
  // - higher => more "snappy" near the end (stronger ease)
  easeOpenPower: number;
  easeClosePower: number;

  // Portal geometry
  targetAspect: number; // 950/300
  portalMargin: number; // safe padding inside canvas
  superN: number; // 2=ellipse, higher=more rectangular

  // Wobble timing & intensity
  portalDetail: number;
  revealDetail: number;
  portalTSpeed: number;
  revealTSpeed: number;

  // Layer pyramid
  layersCount: number;
  layerScaleInner: number;
  layerScaleOuter: number;
  layerAlphaInner: number;
  layerAlphaOuter: number;

  // Cascade delays
  gapOpen: number;
  gapClose: number;
  openDelayGamma: number;
  closeDelayGamma: number;

  // Alpha curve (alpha follows size factor p; we only reshape p with gamma)
  alphaOpenInnerGamma: number;
  alphaOpenOuterGamma: number;
  alphaCloseInnerGamma: number;
  alphaCloseOuterGamma: number;

  // Blur/feather
  enableBlur: boolean;
  featherBasePx: number;
  blurStepPx: number;
  featherMult: number; // feather blur multiplier
  coreMult: number; // core blur multiplier

  // Per-layer phase
  layerPhaseOffset: number;
  layerPhaseJitter: number;
};

const DEFAULT_CFG: PortalConfig = {
  width: 1280,
  height: 480,

  openMs: 900,
  closeMs: 650,

  easeOpenPower: 3.0,
  easeClosePower: 3.0,

  targetAspect: 950 / 300,
  portalMargin: 0.06,
  superN: 2.7,

  portalDetail: 0.92,
  revealDetail: 1.1,
  portalTSpeed: 0.55,
  revealTSpeed: 0.78,

  layersCount: 4,
  layerScaleInner: 0.90,
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

// -------------------------------------------------------------
// Math helpers
// -------------------------------------------------------------

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function powAbs(x: number, p: number) {
  return Math.pow(Math.abs(x), p);
}

function sgn(x: number) {
  return x < 0 ? -1 : 1;
}

function nowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function hash01(n: number) {
  // Deterministic pseudo-random in [0,1)
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

// -------------------------------------------------------------
// Easing (parameterized)
// -------------------------------------------------------------

function easeInPow(t: number, p: number) {
  // strong ease-in for larger p
  return Math.pow(clamp01(t), Math.max(1e-3, p));
}

function easeOutPow(t: number, p: number) {
  // strong ease-out for larger p
  const x = 1 - clamp01(t);
  return 1 - Math.pow(x, Math.max(1e-3, p));
}

// Tween a single numeric key in a ref object.
// We use a token so multiple animations don't fight each other.
function tweenValue<T extends Record<string, any>>(
  stateRef: React.MutableRefObject<T>,
  key: keyof T,
  from: number,
  to: number,
  ms: number,
  tokenRef: React.MutableRefObject<number>,
  token: number,
  easingFn: (t: number) => number,
  onDone?: () => void
) {
  const start = nowMs();
  const dur = Math.max(1, ms);

  function step() {
    if (tokenRef.current !== token) return;
    const t = clamp01((nowMs() - start) / dur);
    const e = easingFn(t);
    (stateRef.current as any)[key] = from + (to - from) * e;
    if (t < 1) requestAnimationFrame(step);
    else onDone?.();
  }

  requestAnimationFrame(step);
}

// -------------------------------------------------------------
// Canvas helpers
// -------------------------------------------------------------

function ensureOffscreen(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// -------------------------------------------------------------
// Procedural scenes (offscreen placeholders)
// -------------------------------------------------------------

// Note: these are ONLY to demo the portal effect without external images.

function drawSceneA(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#06121c");
  g.addColorStop(0.45, "#0b3a56");
  g.addColorStop(1, "#1b6f9a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 6; i++) {
    const cx = w * (0.55 + 0.08 * i);
    const cy = h * (0.15 + 0.03 * i);
    const r = h * (0.72 - 0.06 * i);
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    rg.addColorStop(0, "rgba(126,243,255,0.42)");
    rg.addColorStop(0.35, "rgba(43,183,255,0.16)");
    rg.addColorStop(1, "rgba(0,16,24,0)");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = "source-over";
  for (let p = 0; p < 9; p++) {
    const x = w * (0.08 + p * 0.095);
    const y = h * (0.08 + (p % 2) * 0.02);
    const pw = w * (0.08 + (p % 3) * 0.01);
    const ph = h * (0.82 - (p % 3) * 0.06);
    ctx.fillStyle = `rgba(255,255,255,${0.02 + (p % 4) * 0.016})`;
    roundRect(ctx, x, y, pw, ph, 18);
    ctx.fill();
  }

  ctx.globalCompositeOperation = "screen";
  const eg = ctx.createLinearGradient(w * 0.34, 0, w * 0.72, 0);
  eg.addColorStop(0, "rgba(255,204,102,0)");
  eg.addColorStop(0.35, "rgba(255,123,47,0.28)");
  eg.addColorStop(0.65, "rgba(255,47,116,0.28)");
  eg.addColorStop(1, "rgba(138,43,226,0)");
  ctx.fillStyle = eg;
  roundRect(ctx, w * 0.34, h * 0.6, w * 0.38, h * 0.08, h * 0.04);
  ctx.fill();

  ctx.globalCompositeOperation = "source-over";
}

function drawSceneB(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, "#04060f");
  g.addColorStop(0.55, "#102a4a");
  g.addColorStop(1, "#0d0c1c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "screen";
  const c1x = w * 0.72;
  const c1y = h * 0.22;
  const r1 = h * 0.72;
  const rg1 = ctx.createRadialGradient(c1x, c1y, 0, c1x, c1y, r1);
  rg1.addColorStop(0, "rgba(183,166,255,0.34)");
  rg1.addColorStop(0.35, "rgba(79,210,255,0.13)");
  rg1.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rg1;
  ctx.beginPath();
  ctx.arc(c1x, c1y, r1, 0, Math.PI * 2);
  ctx.fill();

  const c2x = w * 0.52;
  const c2y = h * 0.72;
  const r2 = h * 0.62;
  const rg2 = ctx.createRadialGradient(c2x, c2y, 0, c2x, c2y, r2);
  rg2.addColorStop(0, "rgba(255,91,214,0.16)");
  rg2.addColorStop(0.4, "rgba(255,106,45,0.11)");
  rg2.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rg2;
  ctx.beginPath();
  ctx.arc(c2x, c2y, r2, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.moveTo(w * 0.06, h * 0.98);
  ctx.bezierCurveTo(w * 0.22, h * 0.78, w * 0.33, h * 0.94, w * 0.46, h * 0.6);
  ctx.bezierCurveTo(w * 0.58, h * 0.34, w * 0.7, h * 0.5, w * 0.9, h * 0.2);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
}

// -------------------------------------------------------------
// Portal geometry & wobble
// -------------------------------------------------------------

function getPortalHalfDims(cfg: PortalConfig) {
  // Half sizes "a" (x radius) and "b" (y radius) that fit inside the canvas.
  const maxH = cfg.height * 0.5 * (1 - cfg.portalMargin * 2);
  const maxW = cfg.width * 0.5 * (1 - cfg.portalMargin * 2);

  const b = maxH;
  const a = Math.min(maxW, b * cfg.targetAspect);
  const b2 = Math.min(b, a / cfg.targetAspect);

  return { a, b: b2 };
}

function superellipsePoint(u: number, a: number, b: number, n: number) {
  // Parametric superellipse point.
  // n=2 -> ellipse, n>2 -> squarer.
  const c = Math.cos(u);
  const s = Math.sin(u);
  const p = 2 / n;
  return {
    x: a * sgn(c) * powAbs(c, p),
    y: b * sgn(s) * powAbs(s, p),
  };
}

function wobbleScale(u: number, t: number, detail: number, profile: "portal" | "reveal", seed: number) {
  // Only affects the mask boundary.
  // We inject layer seed so each opacity layer looks like its own cloud.
  const k = profile === "reveal" ? 0.85 : 1.0;

  const s1 = (hash01(seed + 1.3) - 0.5) * 2;
  const s2 = (hash01(seed + 2.7) - 0.5) * 2;
  const s3 = (hash01(seed + 5.1) - 0.5) * 2;

  const pu = s1 * 1.8; // angle phase
  const pt = s2 * 1.6; // time phase

  // Slightly different time speeds per layer (kept subtle)
  const v1 = 1.0 + 0.10 * s3;
  const v2 = 1.0 + 0.07 * s1;

  // Big features
  const lump =
    0.10 * Math.sin((u + pu) * 1.0 + (t + pt) * 0.33 * v1) +
    0.07 * Math.sin((u + pu) * 2.0 - (t + pt) * 0.21 * v2) +
    0.05 * Math.sin((u - pu * 0.7) * 0.5 + (t - pt * 0.6) * 0.18);

  // Fine edge motion
  const fine =
    0.082 * Math.sin(2 * (u + pu) + (t + pt) * 1.05 * v1) +
    0.061 * Math.sin(3 * (u - pu * 0.6) - (t + pt) * 0.78 * v2) +
    0.044 * Math.sin(5 * (u + pu * 0.4) + (t - pt) * 0.46) +
    0.030 * Math.sin(9 * (u - pu) - (t - pt) * 0.31) +
    0.022 * Math.sin(13 * (u + pu * 0.2) + (t + pt) * 0.27);

  return 1 + k * detail * (fine + lump);
}

function drawSuperBlobPath(
  ctx: CanvasRenderingContext2D,
  cfg: PortalConfig,
  a: number,
  b: number,
  t: number,
  profile: "portal" | "reveal",
  opts: { steps: number; detail: number; seed: number }
) {
  // Build a closed path around a "wobbling superellipse".
  const steps = opts.steps;
  const detail = opts.detail;
  const seed = opts.seed;

  // Tiny blobs should be calmer.
  const size = Math.min(a, b);
  const sizeScale = clamp01(size / 220);
  const detailEff = detail * (0.12 + 0.88 * sizeScale);

  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const u = (i / steps) * Math.PI * 2;
    const p = superellipsePoint(u, a, b, cfg.superN);
    const ws = wobbleScale(u, t, detailEff, profile, seed);
    const x = p.x * ws;
    const y = p.y * ws;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// -------------------------------------------------------------
// Cascade: per-layer size factor
// -------------------------------------------------------------

function layerFactor(cfg: PortalConfig, reveal: number, layerIndex: number, layersCount: number, motion: "open" | "close") {
  // We map the global reveal progress to each layer's local progress, creating
  // a cascade (some layers start earlier/later).
  //
  // Indices: 0=inner (most opaque), last=outer (most transparent).
  const n1 = Math.max(1, layersCount - 1);

  if (motion === "close") {
    const totalDelayC = n1 * cfg.gapClose;
    const denomC = Math.max(0.001, 1 - totalDelayC);

    // close timeline runs 0->1 while reveal runs 1->0
    const closeT = 1 - clamp01(reveal);

    const rC = layerIndex / n1; // 0..1 from inner
    const delayC = Math.pow(rC, cfg.closeDelayGamma) * totalDelayC;

    const shrink = clamp01((closeT - delayC) / denomC);
    return 1 - shrink;
  }

  // open
  const totalDelayO = n1 * cfg.gapOpen;
  const denomO = Math.max(0.001, 1 - totalDelayO);

  const openT = clamp01(reveal);

  // 0..1 from outer (outer starts earliest)
  const rO = (layersCount - 1 - layerIndex) / n1;
  const delayO = Math.pow(rO, cfg.openDelayGamma) * totalDelayO;

  return clamp01((openT - delayO) / denomO);
}

// Alpha follows size factor p, but we can shape the curve (power/gamma) per layer.
function layerAlphaFactor(cfg: PortalConfig, p: number, layerIndex: number, layersCount: number, motion: "open" | "close") {
  const pp = clamp01(p);
  const h = layersCount <= 1 ? 0 : layerIndex / (layersCount - 1); // 0=inner, 1=outer

  if (motion === "open") {
    const g = lerp(cfg.alphaOpenInnerGamma, cfg.alphaOpenOuterGamma, h);
    return Math.pow(pp, g);
  }

  const g = lerp(cfg.alphaCloseInnerGamma, cfg.alphaCloseOuterGamma, h);
  return Math.pow(pp, g);
}

// -------------------------------------------------------------
// Layer pyramid definition
// -------------------------------------------------------------

type LayerDef = { s: number; a: number };

function makeLayers(cfg: PortalConfig): LayerDef[] {
  // We generate a smooth ramp from inner -> outer.
  // Scale controls relative size of the layer.
  // Alpha controls the base opacity of the layer.
  const n = Math.max(1, Math.round(cfg.layersCount));
  const out: LayerDef[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1);
    out.push({
      s: lerp(cfg.layerScaleInner, cfg.layerScaleOuter, t),
      a: lerp(cfg.layerAlphaInner, cfg.layerAlphaOuter, t),
    });
  }
  return out;
}

// -------------------------------------------------------------
// Draw the animated two-pass pyramid mask
// -------------------------------------------------------------

function drawPyramidMask(
  ctx: CanvasRenderingContext2D,
  cfg: PortalConfig,
  layers: LayerDef[],
  cx: number,
  cy: number,
  baseA: number,
  baseB: number,
  masterProgress: number,
  t: number,
  profile: "portal" | "reveal",
  motion: "open" | "close"
) {
  // masterProgress: 0..1 global reveal.
  const detail = profile === "reveal" ? cfg.revealDetail : cfg.portalDetail;
  const steps = profile === "reveal" ? 220 : 250;

  // We draw at the center of the portal.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = "rgba(255,255,255,1)";

  for (let i = 0; i < layers.length; i++) {
    const L = layers[i];

    // p drives BOTH the layer size AND (via gamma) the layer alpha.
    const p = layerFactor(cfg, masterProgress, i, layers.length, motion);
    const aFactor = layerAlphaFactor(cfg, p, i, layers.length, motion);

    // Always keep a tiny blob dot (never fully disappears as a rectangle)
    const minA = 6;
    const minB = 6;

    const a = Math.max(minA, baseA * L.s * p);
    const b = Math.max(minB, baseB * L.s * p);

    // De-sync layers: constant phase + small deterministic jitter
    const seed = (profile === "reveal" ? 1000 : 2000) + i * 17.0;
    const tt = t + i * cfg.layerPhaseOffset + (hash01(seed + 9.9) - 0.5) * cfg.layerPhaseJitter;

    // Blur model:
    // - Every layer is soft (gaussian-ish) using two passes.
    // - Lower layers are puffier by having bigger blur.
    let blurPx = 0;
    if (cfg.enableBlur) {
      blurPx = cfg.featherBasePx + (layers.length - 1 - i) * cfg.blurStepPx;
    }

    // ---- PASS 1: Feather (broader, lower alpha)
    ctx.filter = cfg.enableBlur ? `blur(${blurPx * cfg.featherMult}px)` : "none";
    ctx.globalAlpha = L.a * aFactor * 0.55;
    drawSuperBlobPath(ctx, cfg, a * 1.03, b * 1.03, tt + 0.22, profile, {
      steps,
      detail,
      seed: seed + 101,
    });
    ctx.fill();

    // ---- PASS 2: Core (sharper, higher alpha)
    const coreBlur = Math.max(0.4, blurPx * cfg.coreMult);
    ctx.filter = cfg.enableBlur ? `blur(${coreBlur}px)` : "none";
    ctx.globalAlpha = L.a * aFactor;
    drawSuperBlobPath(ctx, cfg, a, b, tt, profile, {
      steps,
      detail,
      seed,
    });
    ctx.fill();
  }

  ctx.filter = "none";
  ctx.restore();
  ctx.globalAlpha = 1;
}

// -------------------------------------------------------------
// PortalHeaderCanvas component
// -------------------------------------------------------------

type PortalHeaderHandle = {
  show: (sceneId: "A" | "B") => void;
  hide: () => void;
  isShowing: () => boolean;
  getCurrent: () => "A" | "B" | null;
};

type PortalHeaderProps = {
  className?: string;
  config: PortalConfig;
};

const PortalHeaderCanvas = forwardRef<PortalHeaderHandle, PortalHeaderProps>(function PortalHeaderCanvas(
  props,
  ref
) {
  const className = props.className || "";

  // IMPORTANT: we keep config in a ref so the RAF loop always sees latest values
  // without restarting the effect on every slider change.
  const cfgRef = useRef<PortalConfig>(props.config);
  useEffect(() => {
    cfgRef.current = props.config;
  }, [props.config]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tokenRef = useRef(0);

  // Offscreen buffers
  const compRef = useRef<HTMLCanvasElement | null>(null);
  const portalMaskRef = useRef<HTMLCanvasElement | null>(null);
  const revealMaskRef = useRef<HTMLCanvasElement | null>(null);

  // Layer defs cache
  const layersRef = useRef<LayerDef[]>(makeLayers(props.config));
  useEffect(() => {
    layersRef.current = makeLayers(props.config);
  }, [props.config.layersCount, props.config.layerScaleInner, props.config.layerScaleOuter, props.config.layerAlphaInner, props.config.layerAlphaOuter]);

  // Animation state stored in ref (so RAF reads it without re-render)
  const stateRef = useRef({
    motion: "open" as "open" | "close",
    reveal: 0,
    alpha: 0,
    current: null as "A" | "B" | null,
    next: null as "A" | "B" | null,

    // Per-appearance phase offset (seconds).
    // We randomize this each time the portal starts opening, so A and B don't
    // reuse the same "cloud contour" phase.
    phaseShift: 0,
  });

  // Visibility is a React state purely to fade canvas in/out in DOM
  const [visible, setVisible] = useState(false);

  // Procedural scenes (A/B)
  const scenes = useMemo(() => ({ A: null as HTMLCanvasElement | null, B: null as HTMLCanvasElement | null }), []);

  function ensureBuffers() {
    const cfg = cfgRef.current;
    const w = cfg.width;
    const h = cfg.height;

    if (!compRef.current) compRef.current = ensureOffscreen(w, h);
    if (!portalMaskRef.current) portalMaskRef.current = ensureOffscreen(w, h);
    if (!revealMaskRef.current) revealMaskRef.current = ensureOffscreen(w, h);

    if (compRef.current.width !== w || compRef.current.height !== h) {
      compRef.current.width = w;
      compRef.current.height = h;
    }
    if (portalMaskRef.current.width !== w || portalMaskRef.current.height !== h) {
      portalMaskRef.current.width = w;
      portalMaskRef.current.height = h;
    }
    if (revealMaskRef.current.width !== w || revealMaskRef.current.height !== h) {
      revealMaskRef.current.width = w;
      revealMaskRef.current.height = h;
    }
  }

  function buildScenesIfNeeded() {
    const cfg = cfgRef.current;
    const w = cfg.width;
    const h = cfg.height;

    if (scenes.A && scenes.B) return;

    const a = ensureOffscreen(w, h);
    const b = ensureOffscreen(w, h);
    const actx = a.getContext("2d");
    const bctx = b.getContext("2d");

    if (actx) drawSceneA(actx, w, h);
    if (bctx) drawSceneB(bctx, w, h);

    scenes.A = a;
    scenes.B = b;
  }

  function show(sceneId: "A" | "B") {
    buildScenesIfNeeded();
    ensureBuffers();

    const cfg = cfgRef.current;
    const token = ++tokenRef.current;
    const st = stateRef.current;

    const isEmpty = !st.current || st.reveal <= 0.001 || st.alpha <= 0.001;
    setVisible(true);

    // Helper easings with current powers
    const easeOpen = (t: number) => easeOutPow(t, cfg.easeOpenPower);
    const easeClose = (t: number) => easeInPow(t, cfg.easeClosePower);

    // 1) First show
    if (isEmpty) {
      // New appearance => new phase seed (new blob)
      st.phaseShift = Math.random() * 1000;
      st.current = sceneId;
      st.next = null;
      st.motion = "open";
      st.reveal = 0;
      st.alpha = 0;

      tweenValue(stateRef, "reveal", 0, 1, cfg.openMs, tokenRef, token, easeOpen);
      tweenValue(stateRef, "alpha", 0, 1, Math.round(cfg.openMs * 0.7), tokenRef, token, easeOpen);
      return;
    }

    // 2) Already showing: we ALWAYS do close→open.
    // This guarantees that *every button press* produces a "new blob" (new phase).
    // If the requested scene differs, we switch at the tightest point (reveal=0).

    st.next = sceneId;
    st.motion = "close";

    // No fade-to-black: keep alpha 1 while we close.
    st.alpha = 1;

    tweenValue(stateRef, "reveal", st.reveal, 0, cfg.closeMs, tokenRef, token, easeClose, () => {
      if (tokenRef.current !== token) return;

      // Switch ONLY at tightest point (reveal == 0)
      if (st.next && st.current !== st.next) {
        st.current = st.next;
      }
      // New appearance after ANY press => new phase seed (new blob)
      st.phaseShift = Math.random() * 1000;
      st.next = null;

      st.motion = "open";
      tweenValue(stateRef, "reveal", 0, 1, cfg.openMs, tokenRef, token, easeOpen);
      tweenValue(stateRef, "alpha", st.alpha, 1, Math.round(cfg.openMs * 0.35), tokenRef, token, easeOpen);
    });
  }

  function hide() {
    ensureBuffers();

    const cfg = cfgRef.current;
    const token = ++tokenRef.current;
    const st = stateRef.current;
    if (!st.current) return;

    const easeClose = (t: number) => easeInPow(t, cfg.easeClosePower);

    st.motion = "close";

    tweenValue(stateRef, "alpha", st.alpha, 0, Math.round(cfg.closeMs * 0.8), tokenRef, token, easeClose);
    tweenValue(stateRef, "reveal", st.reveal, 0, cfg.closeMs, tokenRef, token, easeClose, () => {
      if (tokenRef.current !== token) return;
      st.current = null;
      st.next = null;
      st.alpha = 0;
      setVisible(false);
    });
  }

  useImperativeHandle(ref, () => ({
    show,
    hide,
    isShowing: () => !!stateRef.current.current && visible,
    getCurrent: () => stateRef.current.current,
  }));

  // DPR setup: update canvas resolution when cfg size changes
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const cfg = cfgRef.current;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    c.width = Math.floor(cfg.width * dpr);
    c.height = Math.floor(cfg.height * dpr);
    c.style.width = cfg.width + "px";
    c.style.height = cfg.height + "px";

    const ctx = c.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ensureBuffers();
    buildScenesIfNeeded();
  }, [props.config.width, props.config.height]);

  // Render loop: draw current scene through (portal * reveal) masks.
  useEffect(() => {
    let raf = 0;
    let running = true;

    function frame() {
      if (!running) return;
      raf = requestAnimationFrame(frame);

      const cfg = cfgRef.current;
      const w = cfg.width;
      const h = cfg.height;

      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;

      buildScenesIfNeeded();
      ensureBuffers();

      const st = stateRef.current;
      // Base time in seconds. We add a per-appearance phase shift so each new
      // show() starts the wobble at a different contour.
      const t = nowMs() / 1000 + st.phaseShift;

      ctx.clearRect(0, 0, w, h);
      if (!st.current || st.reveal <= 0.001 || st.alpha <= 0.001) return;

      // 1) Draw source scene into comp buffer
      const comp = compRef.current!;
      const cctx = comp.getContext("2d")!;
      cctx.clearRect(0, 0, w, h);

      const cur = scenes[st.current];
      if (!cur) return;
      cctx.globalAlpha = 1;
      cctx.drawImage(cur, 0, 0);

      // 2) Draw content into main canvas
      ctx.save();
      ctx.globalAlpha = st.alpha;
      ctx.drawImage(comp, 0, 0);

      // 3) Apply constant portal mask (destination-in)
      const portalMask = portalMaskRef.current!;
      const pm = portalMask.getContext("2d")!;
      pm.clearRect(0, 0, w, h);

      const dims = getPortalHalfDims(cfg);
      const layers = layersRef.current;

      drawPyramidMask(
        pm,
        cfg,
        layers,
        w * 0.5,
        h * 0.5,
        dims.a,
        dims.b,
        1,
        t * cfg.portalTSpeed,
        "portal",
        "open"
      );

      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(portalMask, 0, 0);

      // 4) Apply animated reveal mask (multiplies the portal)
      const revealMask = revealMaskRef.current!;
      const rm = revealMask.getContext("2d")!;
      rm.clearRect(0, 0, w, h);

      drawPyramidMask(
        rm,
        cfg,
        layers,
        w * 0.5,
        h * 0.5,
        dims.a,
        dims.b,
        st.reveal,
        t * cfg.revealTSpeed,
        "reveal",
        st.motion
      );

      ctx.drawImage(revealMask, 0, 0);

      ctx.restore();
      ctx.globalCompositeOperation = "source-over";
    }

    raf = requestAnimationFrame(frame);
    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scenes]);

  const cfg = props.config;

  return (
    <div className={"relative w-full max-w-[" + cfg.width + "px] " + className}>
      <div className="relative w-full" style={{ aspectRatio: `${cfg.width} / ${cfg.height}` }}>
        <canvas
          ref={canvasRef}
          className={"absolute inset-0 h-full w-full " + (visible ? "opacity-100" : "opacity-0")}
          style={{ transition: "opacity 220ms ease" }}
        />
      </div>
    </div>
  );
});

// -------------------------------------------------------------
// Tiny self-tests (non-visual)
// -------------------------------------------------------------

function runSelfTests() {
  function assert(cond: any, msg: string) {
    if (!cond) throw new Error("PortalHeaderCanvas test failed: " + msg);
  }

  const cfg = DEFAULT_CFG;

  // Portal dims should be positive
  const dims = getPortalHalfDims(cfg);
  assert(dims.a > 0 && dims.b > 0, "portal dims positive");
  assert(dims.a / dims.b <= cfg.targetAspect + 1e-6, "portal aspect capped");

  // Seeds should decorrelate wobble
  const w0 = wobbleScale(0.77, 1.23, 0.6, "reveal", 1001);
  const w1 = wobbleScale(0.77, 1.23, 0.6, "reveal", 1018);
  assert(Math.abs(w0 - w1) > 1e-4, "wobble decorrelation via seed");

  // Different time phase should produce different wobble values.
  const wt0 = wobbleScale(0.77, 1.23, 0.6, "reveal", 1001);
  const wt1 = wobbleScale(0.77, 1.23 + 0.77, 0.6, "reveal", 1001);
  assert(Math.abs(wt0 - wt1) > 1e-6, "wobble depends on time phase");

  // Alpha follows p: for same p, outer should ramp faster on open, lose faster on close
  const pTest = 0.5;
  const aOpenInner = layerAlphaFactor(cfg, pTest, 0, 4, "open");
  const aOpenOuter = layerAlphaFactor(cfg, pTest, 3, 4, "open");
  assert(aOpenOuter > aOpenInner, "alpha open: outer > inner");

  const aCloseInner = layerAlphaFactor(cfg, pTest, 0, 4, "close");
  const aCloseOuter = layerAlphaFactor(cfg, pTest, 3, 4, "close");
  assert(aCloseOuter < aCloseInner, "alpha close: outer < inner");
}

// -------------------------------------------------------------
// UI controls (sliders)
// -------------------------------------------------------------

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
};

function SliderRow(props: SliderProps) {
  const fmt = props.format || ((v: number) => v.toFixed(2));
  return (
    <div className="grid grid-cols-[160px_1fr_90px] items-center gap-3">
      <div className="text-xs text-neutral-300">{props.label}</div>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer accent-neutral-200"
      />
      <div className="text-right text-xs tabular-nums text-neutral-200">{fmt(props.value)}</div>
    </div>
  );
}

// -------------------------------------------------------------
// Demo page
// -------------------------------------------------------------

export default function HeaderCanvas() {
  const headerRef = useRef<PortalHeaderHandle | null>(null);

  // Config in React state (drives sliders)
  const [cfg, setCfg] = useState<PortalConfig>(DEFAULT_CFG);

  // Run tests once
  useEffect(() => {
    if (typeof window !== "undefined") {
      const w = window as any;
      if (!w.__PORTAL_HEADER_TESTS_RAN__) {
        w.__PORTAL_HEADER_TESTS_RAN__ = true;
        runSelfTests();
        // eslint-disable-next-line no-console
        console.log("PortalHeaderCanvas: self-tests passed");
      }
    }
  }, []);

  // Helpers for updating config
  function upd<K extends keyof PortalConfig>(key: K, value: PortalConfig[K]) {
    setCfg((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 p-6 text-neutral-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        {/* Controls */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="mb-3 text-sm font-semibold text-neutral-100">Панель настроек</div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-3">
              <SliderRow
                label="OPEN ms"
                value={cfg.openMs}
                min={200}
                max={1800}
                step={10}
                format={(v) => `${Math.round(v)}ms`}
                onChange={(v) => upd("openMs", v)}
              />
              <SliderRow
                label="CLOSE ms"
                value={cfg.closeMs}
                min={150}
                max={1600}
                step={10}
                format={(v) => `${Math.round(v)}ms`}
                onChange={(v) => upd("closeMs", v)}
              />
              <SliderRow
                label="Ease OPEN power"
                value={cfg.easeOpenPower}
                min={1}
                max={6}
                step={0.1}
                onChange={(v) => upd("easeOpenPower", v)}
              />
              <SliderRow
                label="Ease CLOSE power"
                value={cfg.easeClosePower}
                min={1}
                max={6}
                step={0.1}
                onChange={(v) => upd("easeClosePower", v)}
              />
              <SliderRow
                label="Layers count"
                value={cfg.layersCount}
                min={2}
                max={7}
                step={1}
                format={(v) => `${Math.round(v)}`}
                onChange={(v) => upd("layersCount", Math.round(v))}
              />
              <SliderRow
                label="Superellipse N"
                value={cfg.superN}
                min={2}
                max={6}
                step={0.1}
                onChange={(v) => upd("superN", v)}
              />
            </div>

            <div className="grid gap-3">
              <SliderRow
                label="Blur base px"
                value={cfg.featherBasePx}
                min={0}
                max={8}
                step={0.1}
                format={(v) => `${v.toFixed(1)}px`}
                onChange={(v) => upd("featherBasePx", v)}
              />
              <SliderRow
                label="Blur step px"
                value={cfg.blurStepPx}
                min={0}
                max={6}
                step={0.1}
                format={(v) => `${v.toFixed(1)}px`}
                onChange={(v) => upd("blurStepPx", v)}
              />
              <SliderRow
                label="Feather blur mult"
                value={cfg.featherMult}
                min={1}
                max={3}
                step={0.05}
                onChange={(v) => upd("featherMult", v)}
              />
              <SliderRow
                label="Core blur mult"
                value={cfg.coreMult}
                min={0.1}
                max={1.5}
                step={0.05}
                onChange={(v) => upd("coreMult", v)}
              />
              <SliderRow
                label="Wobble detail"
                value={cfg.revealDetail}
                min={0}
                max={1.2}
                step={0.02}
                onChange={(v) => upd("revealDetail", v)}
              />
              <SliderRow
                label="Phase offset"
                value={cfg.layerPhaseOffset}
                min={0}
                max={2}
                step={0.05}
                onChange={(v) => upd("layerPhaseOffset", v)}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-xl bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700 active:scale-[0.99]"
            onClick={() => headerRef.current?.show("A")}
          >
            Показать A
          </button>
          <button
            className="rounded-xl bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700 active:scale-[0.99]"
            onClick={() => headerRef.current?.show("B")}
          >
            Показать B
          </button>
          <button
            className="rounded-xl bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700 active:scale-[0.99]"
            onClick={() => headerRef.current?.hide()}
          >
            Спрятать
          </button>
          <button
            className="rounded-xl bg-neutral-900/60 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800 active:scale-[0.99]"
            onClick={() => setCfg(DEFAULT_CFG)}
          >
            Сброс
          </button>
        </div>

        {/* Portal */}
        <PortalHeaderCanvas
          ref={headerRef}
          config={cfg}
          className="drop-shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
        />

        {/* Notes */}
        <div className="text-sm text-neutral-300">
          <div className="font-semibold text-neutral-200">Текущая модель эффекта</div>
          <div className="mt-1">
            Переключение A→B происходит строго при reveal=0 (полное стягивание).<br />
            Альфа слоёв следует за размером (через степень/gamma), без независимой анимации.<br />
            Пирамидка: открытие — прозрачный→непрозрачный, закрытие — непрозрачный→прозрачный.<br />
            {`CFG: layers=${cfg.layersCount}, openMs=${cfg.openMs}, closeMs=${cfg.closeMs}, easeOpenP=${cfg.easeOpenPower.toFixed(1)}, easeCloseP=${cfg.easeClosePower.toFixed(1)}, blurBase=${cfg.featherBasePx.toFixed(1)}, blurStep=${cfg.blurStepPx.toFixed(1)}`}
          </div>
        </div>
      </div>
    </div>
  );
}
