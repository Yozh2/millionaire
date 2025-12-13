import type { CSSProperties, MouseEventHandler } from 'react';
import React, { forwardRef, useCallback } from 'react';
import { useButtonFsm } from './useButtonFsm';
import type { ButtonFsmState } from './types';

export interface BaseButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  fsmInitial?: ButtonFsmState;
  enablePointerCapture?: boolean;
  easeMs?: number;
  activateMs?: number;
  buttonType?: 'button' | 'submit' | 'reset';
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
        className={className}
        style={mergedStyle}
        onClick={handleClick}
        onPointerEnter={(e) => {
          fsm.eventHandlers.onPointerEnter(e);
          onPointerEnter?.(e);
        }}
        onPointerLeave={(e) => {
          fsm.eventHandlers.onPointerLeave(e);
          onPointerLeave?.(e);
        }}
        onPointerDown={(e) => {
          fsm.eventHandlers.onPointerDown(e);
          onPointerDown?.(e);
        }}
        onPointerMove={(e) => {
          fsm.eventHandlers.onPointerMove(e);
          onPointerMove?.(e);
        }}
        onPointerUp={(e) => {
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

