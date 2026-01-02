import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEventHandler, RefObject } from 'react';

export type GameCardFsmState =
  | 'Appear'
  | 'Idle'
  | 'Hover'
  | 'Press'
  | 'Ease';

const APPEAR_MS = 240;
const EASE_MS = 140;

const HOVER_Y = -14; // px
const TILT_MAX = 9; // deg
const GLARE_SHIFT = 28; // px

const SPRING_K = 190;
const SPRING_C = 34;

function hitTest(el: HTMLElement, clientX: number, clientY: number): boolean {
  if (clientX === 0 && clientY === 0) return true;

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

type MotionState = {
  y: number;
  v: number;
  targetY: number;
  wantedY: number;
  tiltX: number;
  tiltY: number;
  tiltXTarget: number;
  tiltYTarget: number;
  lastPointer: { x: number; y: number } | null;
  lastT: number;
  rafId: number | null;
};

const createMotionState = (): MotionState => ({
  y: 0,
  v: 0,
  targetY: 0,
  wantedY: 0,
  tiltX: 0,
  tiltY: 0,
  tiltXTarget: 0,
  tiltYTarget: 0,
  lastPointer: null,
  lastT: 0,
  rafId: null,
});

const updateSpring = (motion: MotionState, dt: number) => {
  const tauTarget = 0.09;
  const alphaTarget = 1 - Math.exp(-dt / tauTarget);
  motion.targetY = lerp(motion.targetY, motion.wantedY, alphaTarget);

  const a = -SPRING_K * (motion.y - motion.targetY) - SPRING_C * motion.v;
  motion.v += a * dt;
  motion.y += motion.v * dt;
};

const updateTiltTargets = (
  motion: MotionState,
  el: HTMLButtonElement,
  enableTilt: boolean
) => {
  if (enableTilt && motion.lastPointer) {
    const rect = el.getBoundingClientRect();
    const px = motion.lastPointer.x - rect.left;
    const py = motion.lastPointer.y - rect.top;
    const nx = (px / rect.width) * 2 - 1;
    const ny = (py / rect.height) * 2 - 1;

    const sx = Math.sign(nx) * Math.pow(Math.abs(nx), 0.85);
    const sy = Math.sign(ny) * Math.pow(Math.abs(ny), 0.85);

    motion.tiltXTarget = clamp(-sy * TILT_MAX, -TILT_MAX, TILT_MAX);
    motion.tiltYTarget = clamp(sx * TILT_MAX, -TILT_MAX, TILT_MAX);
  } else {
    motion.tiltXTarget = 0;
    motion.tiltYTarget = 0;
  }
};

const updateTilt = (motion: MotionState, dt: number) => {
  const tauTilt = 0.08;
  const alphaTilt = 1 - Math.exp(-dt / tauTilt);
  motion.tiltX = lerp(motion.tiltX, motion.tiltXTarget, alphaTilt);
  motion.tiltY = lerp(motion.tiltY, motion.tiltYTarget, alphaTilt);
};

const isMotionSettled = (motion: MotionState) => {
  const still = Math.abs(motion.y) < 0.05 && Math.abs(motion.v) < 0.25;
  const tiltStill =
    Math.abs(motion.tiltX) < 0.05 && Math.abs(motion.tiltY) < 0.05;
  return still && tiltStill;
};

const resetMotion = (motion: MotionState) => {
  motion.y = 0;
  motion.v = 0;
  motion.targetY = 0;
  motion.wantedY = 0;
  motion.tiltX = 0;
  motion.tiltY = 0;
  motion.tiltXTarget = 0;
  motion.tiltYTarget = 0;
};

const shouldStopMotion = (
  motion: MotionState,
  isOver: boolean,
  state: GameCardFsmState
) => !isOver && state !== 'Press' && isMotionSettled(motion);

export interface UseGameCardFsmParams {
  ref: RefObject<HTMLButtonElement | null>;
  interactive: boolean;
}

export interface UseGameCardFsmResult {
  state: GameCardFsmState;
  eventHandlers: {
    onPointerEnter: PointerEventHandler<HTMLButtonElement>;
    onPointerLeave: PointerEventHandler<HTMLButtonElement>;
    onPointerDown: PointerEventHandler<HTMLButtonElement>;
    onPointerMove: PointerEventHandler<HTMLButtonElement>;
    onPointerUp: PointerEventHandler<HTMLButtonElement>;
    onPointerCancel: PointerEventHandler<HTMLButtonElement>;
    onLostPointerCapture: PointerEventHandler<HTMLButtonElement>;
  };
}

export function useGameCardFsm({
  ref,
  interactive,
}: UseGameCardFsmParams): UseGameCardFsmResult {
  const [state, setState] = useState<GameCardFsmState>('Appear');
  const [isOver, setIsOver] = useState<boolean>(false);
  const stateRef = useRef<GameCardFsmState>('Appear');
  const isOverRef = useRef<boolean>(false);
  const pointerIdRef = useRef<number | null>(null);
  const easeTimerRef = useRef<number | null>(null);
  const appearTimerRef = useRef<number | null>(null);

  const motionRef = useRef<MotionState>(createMotionState());

  const clearTimers = () => {
    if (easeTimerRef.current) window.clearTimeout(easeTimerRef.current);
    if (appearTimerRef.current) window.clearTimeout(appearTimerRef.current);
    easeTimerRef.current = null;
    appearTimerRef.current = null;
  };

  const setFsmState = useCallback((next: GameCardFsmState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const setIsOverState = useCallback((next: boolean) => {
    isOverRef.current = next;
    setIsOver(next);
  }, []);

  const applyVars = useCallback((el: HTMLButtonElement) => {
    const m = motionRef.current;
    el.style.setProperty('--game-mainY', `${m.y.toFixed(3)}px`);
    el.style.setProperty('--game-rx', `${m.tiltX.toFixed(3)}deg`);
    el.style.setProperty('--game-ry', `${m.tiltY.toFixed(3)}deg`);

    const tx = clamp(m.tiltX / TILT_MAX, 0, 1);
    const ty = clamp(-m.tiltY / TILT_MAX, 0, 1);
    const glare = Math.pow(tx * ty, 0.85);
    el.style.setProperty('--game-glare', `${glare.toFixed(3)}`);
    el.style.setProperty(
      '--game-glareX',
      `${((m.tiltY / TILT_MAX) * GLARE_SHIFT).toFixed(3)}px`
    );
    el.style.setProperty(
      '--game-glareY',
      `${((-m.tiltX / TILT_MAX) * GLARE_SHIFT).toFixed(3)}px`
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

      updateSpring(m, dt);
      updateTiltTargets(m, el, isOverRef.current);
      updateTilt(m, dt);

      applyVars(el);

      if (shouldStopMotion(m, isOverRef.current, stateRef.current)) {
        resetMotion(m);
        applyVars(el);
        m.rafId = null;
        return;
      }

      m.rafId = window.requestAnimationFrame(tick);
    };

    m.rafId = window.requestAnimationFrame(tick);
  }, [applyVars, ref]);

  const scheduleEaseDone = useCallback((next: GameCardFsmState) => {
    if (easeTimerRef.current) window.clearTimeout(easeTimerRef.current);
    easeTimerRef.current = window.setTimeout(() => {
      easeTimerRef.current = null;
      setFsmState(next);
    }, EASE_MS);
  }, [setFsmState]);

  useEffect(() => {
    clearTimers();
    appearTimerRef.current = window.setTimeout(() => {
      appearTimerRef.current = null;
      setFsmState('Idle');
    }, APPEAR_MS);

    return () => clearTimers();
  }, [setFsmState]);

  useEffect(
    () => () => {
      clearTimers();
      const m = motionRef.current;
      if (m.rafId != null) window.cancelAnimationFrame(m.rafId);
      m.rafId = null;
    },
    []
  );

  const eventHandlers = useMemo(() => {
    const onPointerEnter: PointerEventHandler<HTMLButtonElement> = (e) => {
      if (!interactive) return;
      setIsOverState(true);
      motionRef.current.lastPointer = { x: e.clientX, y: e.clientY };
      motionRef.current.wantedY = HOVER_Y;
      setFsmState('Hover');
      startLoop();
    };

    const onPointerLeave: PointerEventHandler<HTMLButtonElement> = () => {
      if (!interactive) return;
      if (stateRef.current === 'Press') return;
      setIsOverState(false);
      motionRef.current.wantedY = 0;
      setFsmState('Idle');
      startLoop();
    };

    const onPointerDown: PointerEventHandler<HTMLButtonElement> = (e) => {
      if (!interactive) return;
      pointerIdRef.current = e.pointerId;
      setIsOverState(true);
      motionRef.current.lastPointer = { x: e.clientX, y: e.clientY };
      motionRef.current.wantedY = HOVER_Y;
      setFsmState('Press');
      startLoop();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    const onPointerMove: PointerEventHandler<HTMLButtonElement> = (e) => {
      if (!interactive) return;
      motionRef.current.lastPointer = { x: e.clientX, y: e.clientY };
      startLoop();
      if (stateRef.current === 'Press') {
        const over = hitTest(e.currentTarget, e.clientX, e.clientY);
        setIsOverState(over);
      }
    };

    const onPointerUp: PointerEventHandler<HTMLButtonElement> = (e) => {
      if (!interactive) return;
      if (pointerIdRef.current !== e.pointerId) return;
      pointerIdRef.current = null;

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      const over = hitTest(e.currentTarget, e.clientX, e.clientY);
      setIsOverState(over);
      motionRef.current.wantedY = over ? HOVER_Y : 0;
      setFsmState('Ease');
      scheduleEaseDone(over ? 'Hover' : 'Idle');
      startLoop();
    };

    const onPointerCancel: PointerEventHandler<HTMLButtonElement> = (e) => {
      if (!interactive) return;
      if (pointerIdRef.current !== e.pointerId) return;
      pointerIdRef.current = null;
      setIsOverState(false);
      motionRef.current.wantedY = 0;
      setFsmState('Ease');
      scheduleEaseDone('Idle');
      startLoop();
    };

    const onLostPointerCapture: PointerEventHandler<HTMLButtonElement> = () => {
      if (!interactive) return;
      if (pointerIdRef.current == null) return;
      pointerIdRef.current = null;
      setIsOverState(false);
      motionRef.current.wantedY = 0;
      setFsmState('Ease');
      scheduleEaseDone('Idle');
      startLoop();
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
  }, [
    interactive,
    scheduleEaseDone,
    setFsmState,
    setIsOverState,
    startLoop,
  ]);

  return { state, eventHandlers };
}
