import type { CSSProperties, MouseEventHandler } from 'react';
import React, { forwardRef, useCallback, useState } from 'react';
import { useButtonFsm } from './useButtonFsm';
import type { ButtonFsmState } from './types';

export interface BaseButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  fsmInitial?: ButtonFsmState;
  enablePointerCapture?: boolean;
  easeMs?: number;
  activateMs?: number;
  buttonType?: 'button' | 'submit' | 'reset';
  glareRestart?: 'none' | 'enter' | 'pointer';
}

export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  (
    {
      disabled = false,
      className,
      style,
      onClick,
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
      fsmInitial = 'Idle',
      enablePointerCapture = true,
      easeMs,
      activateMs,
      buttonType = 'button',
      glareRestart = 'none',
      ...rest
    },
    ref,
  ) => {
    const fsm = useButtonFsm({
      disabled,
      initial: fsmInitial,
      enablePointerCapture,
      easeMs,
      activateMs,
    });

    const [glarePhase, setGlarePhase] = useState<'a' | 'b'>('a');
    const bumpGlarePhase = useCallback(() => {
      setGlarePhase((p) => (p === 'a' ? 'b' : 'a'));
    }, []);

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
      (e) => {
        if (fsm.suppressNextClickRef.current) {
          fsm.suppressNextClickRef.current = false;
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onClick?.(e);
      },
      [fsm.suppressNextClickRef, onClick],
    );

    const mergedStyle: CSSProperties = style ?? {};

    return (
      <button
        ref={ref}
        type={buttonType}
        disabled={disabled}
        data-btn-state={fsm.state}
        data-btn-over={fsm.isOver ? 'true' : 'false'}
        data-glare-phase={glarePhase}
        className={className}
        style={mergedStyle}
        onClick={handleClick}
        onPointerEnter={(e) => {
          if (!disabled && glareRestart !== 'none') bumpGlarePhase();
          fsm.eventHandlers.onPointerEnter(e);
          onPointerEnter?.(e);
        }}
        onPointerLeave={(e) => {
          fsm.eventHandlers.onPointerLeave(e);
          onPointerLeave?.(e);
        }}
        onPointerDown={(e) => {
          // Mirror primary-button guard from the FSM to avoid "random" restarts.
          if (
            !disabled &&
            glareRestart === 'pointer' &&
            (e.button === 0 || e.pointerType === 'touch')
          ) {
            bumpGlarePhase();
          }
          fsm.eventHandlers.onPointerDown(e);
          onPointerDown?.(e);
        }}
        onPointerMove={(e) => {
          fsm.eventHandlers.onPointerMove(e);
          onPointerMove?.(e);
        }}
        onPointerUp={(e) => {
          if (
            !disabled &&
            glareRestart === 'pointer' &&
            (e.button === 0 || e.pointerType === 'touch')
          ) {
            bumpGlarePhase();
          }
          fsm.eventHandlers.onPointerUp(e);
          onPointerUp?.(e);
        }}
        onPointerCancel={(e) => {
          fsm.eventHandlers.onPointerCancel(e);
          onPointerCancel?.(e);
        }}
        onLostPointerCapture={(e) => {
          fsm.eventHandlers.onLostPointerCapture(e);
          onLostPointerCapture?.(e);
        }}
        {...rest}
      />
    );
  },
);

BaseButton.displayName = 'BaseButton';
