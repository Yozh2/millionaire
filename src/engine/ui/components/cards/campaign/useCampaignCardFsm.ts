import { useEffect, useMemo, useRef, useState } from 'react';
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
const LAND_MS = 380;

function hitTest(el: HTMLElement, clientX: number, clientY: number): boolean {
  const rect = el.getBoundingClientRect();
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

function readTransform(el: HTMLElement): { translateY: number; scale: number } {
  const t = window.getComputedStyle(el).transform;
  if (!t || t === 'none') return { translateY: 0, scale: 1 };

  const values = t
    .replace(/^matrix3d\(|^matrix\(|\)$/g, '')
    .split(',')
    .map((v) => Number.parseFloat(v.trim()))
    .filter((n) => Number.isFinite(n));

  if (t.startsWith('matrix3d(') && values.length >= 16) {
    const translateY = values[13] ?? 0;
    const scaleX = values[0] ?? 1;
    const scaleY = values[5] ?? 1;
    return { translateY, scale: (scaleX + scaleY) / 2 };
  }

  if (t.startsWith('matrix(') && values.length >= 6) {
    const translateY = values[5] ?? 0;
    const scaleX = values[0] ?? 1;
    const scaleY = values[3] ?? 1;
    return { translateY, scale: (scaleX + scaleY) / 2 };
  }

  return { translateY: 0, scale: 1 };
}

function setFromVars(el: HTMLElement) {
  const { translateY, scale } = readTransform(el);
  el.style.setProperty('--campaign-card-from-y', `${translateY}px`);
  el.style.setProperty('--campaign-card-from-scale', `${scale}`);
}

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
  const prevSelectedRef = useRef<boolean>(selected);
  const pointerIdRef = useRef<number | null>(null);
  const suppressNextClickRef = useRef<boolean>(false);
  const easeTimerRef = useRef<number | null>(null);
  const appearTimerRef = useRef<number | null>(null);
  const landTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (easeTimerRef.current) window.clearTimeout(easeTimerRef.current);
    if (appearTimerRef.current) window.clearTimeout(appearTimerRef.current);
    if (landTimerRef.current) window.clearTimeout(landTimerRef.current);
    easeTimerRef.current = null;
    appearTimerRef.current = null;
    landTimerRef.current = null;
  };

  useEffect(() => {
    clearTimers();
    appearTimerRef.current = window.setTimeout(() => {
      if (selected) {
        const el = ref.current;
        if (el) setFromVars(el);
        setState('Activate');
      } else {
        setState('Idle');
      }
    }, APPEAR_MS);
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const prevSelected = prevSelectedRef.current;
    if (prevSelected === selected) return;
    prevSelectedRef.current = selected;

    const el = ref.current;
    if (!el) return;

    if (selected) {
      setFromVars(el);
      setState('Activate');
      return;
    }

    // selected -> false: land from current height smoothly
    setFromVars(el);
    setState('Deactivate');
    clearTimers();
    landTimerRef.current = window.setTimeout(() => {
      setState('Idle');
    }, LAND_MS);
  }, [ref, selected]);

  const eventHandlers = useMemo(() => {
    const scheduleEaseDone = () => {
      if (easeTimerRef.current) window.clearTimeout(easeTimerRef.current);
      easeTimerRef.current = window.setTimeout(() => {
        setState(() => (isOver ? 'Hover' : 'Idle'));
      }, EASE_MS);
    };

    const onPointerEnter: PointerEventHandler<HTMLButtonElement> = () => {
      if (selected) return;
      setIsOver(true);
      setState((prev) => {
        if (prev === 'Idle') return 'Hover';
        return prev;
      });
    };

    const onPointerLeave: PointerEventHandler<HTMLButtonElement> = () => {
      if (selected) return;
      setIsOver(false);
      setState((prev) => {
        if (prev === 'Hover') return 'Idle';
        return prev;
      });
    };

    const onPointerDown: PointerEventHandler<HTMLButtonElement> = (e) => {
      if (selected) return;
      if (state === 'Deactivate' || state === 'Disappear') return;
      if (e.button !== 0) return;

      pointerIdRef.current = e.pointerId;
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
      if (selected) return;
      if (state !== 'Press') return;
      setIsOver(hitTest(e.currentTarget, e.clientX, e.clientY));
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
      suppressNextClickRef.current = true;

      if (over) {
        const el = ref.current;
        if (el) setFromVars(el);
        setState('Activate');
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
  }, [isOver, onSelect, ref, selected, state]);

  return { state, eventHandlers, suppressNextClickRef };
}
