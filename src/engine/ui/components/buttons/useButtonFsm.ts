import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEventHandler } from 'react';
import type { ButtonFsmState } from './types';

function hitTest(el: HTMLElement, clientX: number, clientY: number): boolean {
  // Some WebKit builds may report 0/0 for pointer coordinates on release; treat as inside.
  if (clientX === 0 && clientY === 0) return true;

  // Prefer DOM hit-testing over bounding boxes to avoid WebKit quirks with transformed elements.
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

export interface UseButtonFsmOptions {
  disabled?: boolean;
  initial?: ButtonFsmState;
  enablePointerCapture?: boolean;
  easeMs?: number;
  activateMs?: number;
}

export interface UseButtonFsmResult {
  state: ButtonFsmState;
  isOver: boolean;
  eventHandlers: {
    onPointerEnter: PointerEventHandler<HTMLElement>;
    onPointerLeave: PointerEventHandler<HTMLElement>;
    onPointerDown: PointerEventHandler<HTMLElement>;
    onPointerMove: PointerEventHandler<HTMLElement>;
    onPointerUp: PointerEventHandler<HTMLElement>;
    onPointerCancel: PointerEventHandler<HTMLElement>;
    onLostPointerCapture: PointerEventHandler<HTMLElement>;
  };
  suppressNextClickRef: React.MutableRefObject<boolean>;
}

export function useButtonFsm({
  disabled = false,
  initial = 'Idle',
  enablePointerCapture = true,
  easeMs = 120,
  activateMs = 140,
}: UseButtonFsmOptions = {}): UseButtonFsmResult {
  const [state, setState] = useState<ButtonFsmState>(initial);
  const [isOver, setIsOver] = useState<boolean>(true);
  const isOverRef = useRef<boolean>(true);
  const pointerIdRef = useRef<number | null>(null);
  const pointerTypeRef = useRef<string | null>(null);
  const easeTimerRef = useRef<number | null>(null);
  const activateTimerRef = useRef<number | null>(null);
  const suppressNextClickRef = useRef<boolean>(false);

  useEffect(() => {
    isOverRef.current = isOver;
  }, [isOver]);

  useEffect(() => {
    if (state !== 'Appear') return;
    const id = window.setTimeout(() => setState('Idle'), 0);
    return () => window.clearTimeout(id);
  }, [state]);

  useEffect(() => {
    return () => {
      if (easeTimerRef.current) window.clearTimeout(easeTimerRef.current);
      if (activateTimerRef.current) window.clearTimeout(activateTimerRef.current);
    };
  }, []);

  const eventHandlers = useMemo(() => {
    const clearTimers = () => {
      if (easeTimerRef.current) window.clearTimeout(easeTimerRef.current);
      if (activateTimerRef.current) window.clearTimeout(activateTimerRef.current);
      easeTimerRef.current = null;
      activateTimerRef.current = null;
    };

    const scheduleEaseDone = () => {
      clearTimers();
      easeTimerRef.current = window.setTimeout(() => {
        setState((prev) => {
          if (prev !== 'Ease') return prev;
          return isOverRef.current ? 'Hover' : 'Idle';
        });
      }, easeMs);
    };

    const scheduleActivateDone = () => {
      clearTimers();
      activateTimerRef.current = window.setTimeout(() => {
        setState((prev) => {
          if (prev !== 'Activate') return prev;
          return isOverRef.current ? 'Hover' : 'Idle';
        });
      }, activateMs);
    };

    const onPointerEnter: PointerEventHandler<HTMLElement> = () => {
      if (disabled) return;
      if (pointerIdRef.current != null) return;
      setIsOver(true);
      setState((prev) => {
        if (prev === 'Idle') return 'Hover';
        return prev;
      });
    };

    const onPointerLeave: PointerEventHandler<HTMLElement> = () => {
      if (disabled) return;
      if (pointerIdRef.current != null) return;
      setIsOver(false);
      setState((prev) => {
        if (prev === 'Hover') return 'Idle';
        return prev;
      });
    };

    const onPointerDown: PointerEventHandler<HTMLElement> = (e) => {
      if (disabled) return;
      // Safari may report `button !== 0` for touch pointers.
      if (e.button !== 0 && e.pointerType !== 'touch') return;

      clearTimers();
      pointerIdRef.current = e.pointerId;
      pointerTypeRef.current = e.pointerType;
      setIsOver(true);
      setState('Press');

      if (enablePointerCapture) {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
    };

    const onPointerMove: PointerEventHandler<HTMLElement> = (e) => {
      if (disabled) return;
      if (state !== 'Press') return;
      setIsOver(hitTest(e.currentTarget, e.clientX, e.clientY));
    };

    const onPointerUp: PointerEventHandler<HTMLElement> = (e) => {
      if (disabled) return;
      if (pointerIdRef.current !== e.pointerId) return;

      // Mark capture as finished *before* releasing it, so `lostpointercapture`
      // triggered by our own `releasePointerCapture` doesn't get treated as cancel.
      pointerIdRef.current = null;

      if (enablePointerCapture) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }

      const pointerType = pointerTypeRef.current ?? e.pointerType;
      const isTouch = pointerType === 'touch';
      const over = isTouch
        ? isOverRef.current
        : enablePointerCapture
          ? isOverRef.current
          : hitTest(e.currentTarget, e.clientX, e.clientY);

      setIsOver(over);
      // If we don't use pointer capture, the browser's native click handling for mouse/pen
      // is already reliable. Suppressing click based on hitTest can break in Safari where
      // pointer coordinates may be unreliable for some pointer events.
      suppressNextClickRef.current =
        isTouch ? !over : enablePointerCapture ? !over : false;

      if (over) {
        setState('Activate');
        scheduleActivateDone();
      } else {
        setState('Ease');
        scheduleEaseDone();
      }
    };

    const onPointerCancel: PointerEventHandler<HTMLElement> = (e) => {
      if (disabled) return;
      if (pointerIdRef.current !== e.pointerId) return;
      suppressNextClickRef.current = true;
      pointerIdRef.current = null;
      setIsOver(false);
      setState('Ease');
      scheduleEaseDone();
    };

    const onLostPointerCapture: PointerEventHandler<HTMLElement> = () => {
      if (disabled) return;
      // Ignore `lostpointercapture` that happens after a normal release.
      if (pointerIdRef.current == null) return;
      suppressNextClickRef.current = true;
      pointerIdRef.current = null;
      setIsOver(false);
      setState((prev) => (prev === 'Press' ? 'Ease' : prev));
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
  }, [activateMs, disabled, easeMs, enablePointerCapture, state]);

  return {
    state,
    isOver,
    eventHandlers,
    suppressNextClickRef,
  };
}
