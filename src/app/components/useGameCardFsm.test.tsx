import { renderHook, act } from '@testing-library/react';
import { useGameCardFsm } from './useGameCardFsm';

describe('useGameCardFsm', () => {
  it('starts in Appear and transitions to Idle', () => {
    vi.useFakeTimers();

    const ref = { current: document.createElement('button') };
    const { result } = renderHook(() =>
      useGameCardFsm({ ref, interactive: true })
    );

    expect(result.current.state).toBe('Appear');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.state).toBe('Idle');
    vi.useRealTimers();
  });

  it('exposes pointer event handlers', () => {
    const ref = { current: document.createElement('button') };
    const { result } = renderHook(() =>
      useGameCardFsm({ ref, interactive: true })
    );

    expect(typeof result.current.eventHandlers.onPointerEnter).toBe('function');
    expect(typeof result.current.eventHandlers.onPointerLeave).toBe('function');
    expect(typeof result.current.eventHandlers.onPointerDown).toBe('function');
    expect(typeof result.current.eventHandlers.onPointerMove).toBe('function');
    expect(typeof result.current.eventHandlers.onPointerUp).toBe('function');
    expect(typeof result.current.eventHandlers.onPointerCancel).toBe('function');
    expect(typeof result.current.eventHandlers.onLostPointerCapture).toBe(
      'function'
    );
  });
});
