import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEventHandler, RefObject } from 'react';

export type CampaignCardFsmState =
  | 'Appear'
  | 'Idle'
  | 'Hover'
  | 'Press'
  | 'Ease'
  | 'Activate'
  | 'Deactivate'
  | 'Disappear';

const APPEAR_MS = 240;
const EASE_MS = 140;

const HOVER_Y = -16; // px
const BOB_RANGE = 7; // px
const BOB_PERIOD = 3.0; // s
const TILT_MAX = 9; // deg
const GLARE_SHIFT = 28; // px

// Damped spring: a = -k(x-target) - c*v
const SPRING_K = 190;
const SPRING_C = 34;

function hitTest(el: HTMLElement, clientX: number, clientY: number): boolean {
  // WebKit can sometimes report invalid coords for pointerup; treat as inside.
  if (clientX === 0 && clientY === 0) return true;

  // Prefer DOM hit-testing over bounding boxes to avoid WebKit quirks with 3D transforms.
  try {
    const stack = document.elementsFromPoint?.(clientX, clientY);
    if (stack && stack.length > 0) {
      return stack.some((node) => el.contains(node));
    }
    const top = document.elementFromPoint?.(clientX, clientY);
    if (top) return el.contains(top);
  } catch {
    // ignore and fall back to bounding rect
  }

  const rect = el.getBoundingClientRect();
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface UseCampaignCardFsmParams {
  ref: RefObject<HTMLButtonElement | null>;
  selected: boolean;
  onSelect: () => void;
}

export interface UseCampaignCardFsmResult {
  state: CampaignCardFsmState;
  eventHandlers: {
    onPointerEnter: PointerEventHandler<HTMLButtonElement>;
    onPointerLeave: PointerEventHandler<HTMLButtonElement>;
    onPointerDown: PointerEventHandler<HTMLButtonElement>;
    onPointerMove: PointerEventHandler<HTMLButtonElement>;
    onPointerUp: PointerEventHandler<HTMLButtonElement>;
    onPointerCancel: PointerEventHandler<HTMLButtonElement>;
    onLostPointerCapture: PointerEventHandler<HTMLButtonElement>;
  };
  suppressNextClickRef: React.MutableRefObject<boolean>;
}

export function useCampaignCardFsm({
  ref,
  selected,
  onSelect,
}: UseCampaignCardFsmParams): UseCampaignCardFsmResult {
  const [state, setState] = useState<CampaignCardFsmState>('Appear');
  const [isOver, setIsOver] = useState<boolean>(false);
  const initialSelectedRef = useRef<boolean>(selected);
  const prevSelectedRef = useRef<boolean>(selected);
  const stateRef = useRef<CampaignCardFsmState>('Appear');
  const isOverRef = useRef<boolean>(false);
  const pointerIdRef = useRef<number | null>(null);
  const pointerTypeRef = useRef<string | null>(null);
  const suppressNextClickRef = useRef<boolean>(false);
  const easeTimerRef = useRef<number | null>(null);
  const appearTimerRef = useRef<number | null>(null);

  const motionRef = useRef<{
    isActive: boolean;
    y: number;
    v: number;
    targetY: number;
    wantedY: number;
    bobPhase: number;
    bobAmp: number;
    bobAmpTarget: number;
    tiltX: number;
    tiltY: number;
    tiltXTarget: number;
    tiltYTarget: number;
    lastPointer: { x: number; y: number } | null;
    lastT: number;
    rafId: number | null;
  }>({
    isActive: selected,
    y: 0,
    v: 0,
    targetY: 0,
    wantedY: selected ? HOVER_Y : 0,
    bobPhase: 0,
    bobAmp: 0,
    bobAmpTarget: selected ? BOB_RANGE : 0,
    tiltX: 0,
    tiltY: 0,
    tiltXTarget: 0,
    tiltYTarget: 0,
    lastPointer: null,
    lastT: 0,
    rafId: null,
  });

  const clearTimers = () => {
    if (easeTimerRef.current) window.clearTimeout(easeTimerRef.current);
    if (appearTimerRef.current) window.clearTimeout(appearTimerRef.current);
    easeTimerRef.current = null;
    appearTimerRef.current = null;
  };

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    isOverRef.current = isOver;
  }, [isOver]);

  const applyVars = useCallback((el: HTMLButtonElement) => {
    const m = motionRef.current;
    el.style.setProperty('--campaign-mainY', `${m.y.toFixed(3)}px`);
    el.style.setProperty(
      '--campaign-bobY',
      `${(-Math.sin(m.bobPhase) * m.bobAmp).toFixed(3)}px`,
    );
    el.style.setProperty('--campaign-rx', `${m.tiltX.toFixed(3)}deg`);
    el.style.setProperty('--campaign-ry', `${m.tiltY.toFixed(3)}deg`);

    const tx = clamp(m.tiltX / TILT_MAX, 0, 1); // up
    const ty = clamp(-m.tiltY / TILT_MAX, 0, 1); // left
    const glare = Math.pow(tx * ty, 0.85);
    el.style.setProperty('--campaign-glare', `${glare.toFixed(3)}`);
    el.style.setProperty(
      '--campaign-glareX',
      `${((m.tiltY / TILT_MAX) * GLARE_SHIFT).toFixed(3)}px`,
    );
    el.style.setProperty(
      '--campaign-glareY',
      `${((-m.tiltX / TILT_MAX) * GLARE_SHIFT).toFixed(3)}px`,
    );
  }, []);

  const startLoop = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const m = motionRef.current;
    if (m.rafId != null) return;

    m.lastT = performance.now();

    const tick = (t: number) => {
      const dt = clamp((t - m.lastT) / 1000, 0, 0.02);
      m.lastT = t;

      // Smoothly feed the spring target to avoid harsh starts.
      const tauTarget = 0.09;
      const alphaTarget = 1 - Math.exp(-dt / tauTarget);
      m.targetY = lerp(m.targetY, m.wantedY, alphaTarget);

      // Spring towards targetY.
      const a = -SPRING_K * (m.y - m.targetY) - SPRING_C * m.v;
      m.v += a * dt;
      m.y += m.v * dt;

      // Smooth bob amplitude.
      const tauBob = 0.32;
      const alphaBob = 1 - Math.exp(-dt / tauBob);
      m.bobAmp = lerp(m.bobAmp, m.bobAmpTarget, alphaBob);

      // Bob phase.
      const omega = (Math.PI * 2) / BOB_PERIOD;
      m.bobPhase += omega * dt;

      // Tilt target from last pointer position.
      const enableTilt = (m.isActive || isOverRef.current) && m.lastPointer != null;
      if (enableTilt && m.lastPointer) {
        const rect = el.getBoundingClientRect();
        const px = m.lastPointer.x - rect.left;
        const py = m.lastPointer.y - rect.top;
        const nx = (px / rect.width) * 2 - 1;
        const ny = (py / rect.height) * 2 - 1;

        const sx = Math.sign(nx) * Math.pow(Math.abs(nx), 0.85);
        const sy = Math.sign(ny) * Math.pow(Math.abs(ny), 0.85);

        m.tiltXTarget = clamp(-sy * TILT_MAX, -TILT_MAX, TILT_MAX);
        m.tiltYTarget = clamp(sx * TILT_MAX, -TILT_MAX, TILT_MAX);
      } else {
        m.tiltXTarget = 0;
        m.tiltYTarget = 0;
      }

      // Tilt smoothing.
      const tauTilt = 0.08;
      const alphaTilt = 1 - Math.exp(-dt / tauTilt);
      m.tiltX = lerp(m.tiltX, m.tiltXTarget, alphaTilt);
      m.tiltY = lerp(m.tiltY, m.tiltYTarget, alphaTilt);

      applyVars(el);

      // When landing, automatically transition to Idle once motion is settled.
      if (!m.isActive && stateRef.current === 'Deactivate') {
        const still =
          Math.abs(m.y) < 0.06 && Math.abs(m.v) < 0.25 && m.bobAmp < 0.08;
        const tiltStill = Math.abs(m.tiltX) < 0.05 && Math.abs(m.tiltY) < 0.05;
        if (still && tiltStill) {
          const next = isOverRef.current && !m.isActive ? 'Hover' : 'Idle';
          stateRef.current = next;
          setState(next);
        }
      }

      // Stop loop when everything is still and not active.
      if (!m.isActive && !isOverRef.current) {
        const still =
          Math.abs(m.y) < 0.05 && Math.abs(m.v) < 0.25 && m.bobAmp < 0.05;
        const tiltStill = Math.abs(m.tiltX) < 0.05 && Math.abs(m.tiltY) < 0.05;
        if (still && tiltStill) {
          m.y = 0;
          m.v = 0;
          m.targetY = 0;
          m.wantedY = 0;
          m.bobAmp = 0;
          m.bobAmpTarget = 0;
          m.tiltX = 0;
          m.tiltY = 0;
          m.tiltXTarget = 0;
          m.tiltYTarget = 0;
          applyVars(el);
          m.rafId = null;
          return;
        }
      }

      m.rafId = window.requestAnimationFrame(tick);
    };

    m.rafId = window.requestAnimationFrame(tick);
  }, [applyVars, ref]);

  useEffect(() => {
    clearTimers();
    appearTimerRef.current = window.setTimeout(() => {
      setState(initialSelectedRef.current ? 'Activate' : 'Idle');
    }, APPEAR_MS);
    return () => clearTimers();
  }, []);

  useEffect(() => {
    const motion = motionRef.current;
    return () => {
      clearTimers();
      if (motion.rafId != null) {
        window.cancelAnimationFrame(motion.rafId);
        motion.rafId = null;
      }
    };
  }, []);

  useEffect(() => {
    const m = motionRef.current;
    if (state === 'Activate') {
      m.isActive = true;
      m.wantedY = HOVER_Y;
      m.bobAmpTarget = BOB_RANGE;
      startLoop();
    }
    if (state === 'Deactivate') {
      m.isActive = false;
      m.wantedY = 0;
      m.bobAmpTarget = 0;
      startLoop();
    }
  }, [startLoop, state]);

  useEffect(() => {
    if (state !== 'Deactivate') return;

    if (easeTimerRef.current) window.clearTimeout(easeTimerRef.current);
    easeTimerRef.current = window.setTimeout(() => {
      setState((prev) => {
        if (prev !== 'Deactivate') return prev;
        return isOverRef.current ? 'Hover' : 'Idle';
      });
    }, Math.max(120, Math.round(EASE_MS * 1.25)));

    return () => {
      if (easeTimerRef.current) window.clearTimeout(easeTimerRef.current);
      easeTimerRef.current = null;
    };
  }, [state]);

  useEffect(() => {
    const prevSelected = prevSelectedRef.current;
    if (prevSelected === selected) return;
    prevSelectedRef.current = selected;

    const m = motionRef.current;
    m.isActive = selected;

    if (selected) {
      setState('Activate');
      m.wantedY = HOVER_Y;
      m.bobAmpTarget = BOB_RANGE;
      startLoop();
      return;
    }

    // selected -> false: land smoothly from current height
    setState('Deactivate');
    clearTimers();
    m.wantedY = 0;
    m.bobAmpTarget = 0;
    startLoop();
  }, [selected, startLoop]);

  const eventHandlers = useMemo(() => {
    const scheduleEaseDone = () => {
      if (easeTimerRef.current) window.clearTimeout(easeTimerRef.current);
      easeTimerRef.current = window.setTimeout(() => {
        setState(() => (isOver ? 'Hover' : 'Idle'));
      }, EASE_MS);
    };

    const onPointerEnter: PointerEventHandler<HTMLButtonElement> = (e) => {
      setIsOver(true);
      motionRef.current.lastPointer = { x: e.clientX, y: e.clientY };
      startLoop();
      setState((prev) => {
        if (!selected && prev === 'Idle') return 'Hover';
        return prev;
      });
    };

    const onPointerLeave: PointerEventHandler<HTMLButtonElement> = () => {
      setIsOver(false);
      motionRef.current.lastPointer = null;
      startLoop();
      setState((prev) => {
        if (!selected && prev === 'Hover') return 'Idle';
        return prev;
      });
    };

    const onPointerDown: PointerEventHandler<HTMLButtonElement> = (e) => {
      if (selected) return;
      if (state === 'Deactivate' || state === 'Disappear') return;
      // Safari may report `button !== 0` for touch pointers.
      if (e.button !== 0 && e.pointerType !== 'touch') return;

      pointerIdRef.current = e.pointerId;
      pointerTypeRef.current = e.pointerType;
      suppressNextClickRef.current = false;
      setIsOver(true);
      setState('Press');

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    const onPointerMove: PointerEventHandler<HTMLButtonElement> = (e) => {
      motionRef.current.lastPointer = { x: e.clientX, y: e.clientY };
      startLoop();
      if (selected) return;
      if (state === 'Press') {
        setIsOver(hitTest(e.currentTarget, e.clientX, e.clientY));
      }
    };

    const onPointerUp: PointerEventHandler<HTMLButtonElement> = (e) => {
      if (selected) return;
      if (pointerIdRef.current !== e.pointerId) return;

      // mark finished before releasing capture (avoid treating lostpointercapture as cancel)
      pointerIdRef.current = null;

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      const over = hitTest(e.currentTarget, e.clientX, e.clientY);
      setIsOver(over);
      // If we handled selection on pointerup, suppress the synthetic click to avoid double-trigger.
      // If we didn't select, allow click to be the fallback (Safari touch can be unreliable).
      suppressNextClickRef.current = over;

      if (over) {
        setState('Activate');
        motionRef.current.isActive = true;
        motionRef.current.wantedY = HOVER_Y;
        motionRef.current.bobAmpTarget = BOB_RANGE;
        startLoop();
        onSelect();
        return;
      }

      setState('Ease');
      scheduleEaseDone();
    };

    const onPointerCancel: PointerEventHandler<HTMLButtonElement> = (e) => {
      if (selected) return;
      if (pointerIdRef.current !== e.pointerId) return;
      pointerIdRef.current = null;
      setIsOver(false);
      suppressNextClickRef.current = true;
      setState('Ease');
      scheduleEaseDone();
    };

    const onLostPointerCapture: PointerEventHandler<HTMLButtonElement> = () => {
      if (selected) return;
      if (pointerIdRef.current == null) return;
      pointerIdRef.current = null;
      setIsOver(false);
      suppressNextClickRef.current = true;
      setState('Ease');
      scheduleEaseDone();
    };

    return {
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
    };
  }, [isOver, onSelect, selected, startLoop, state]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    applyVars(el);
  }, [applyVars, ref]);

  return { state, eventHandlers, suppressNextClickRef };
}
