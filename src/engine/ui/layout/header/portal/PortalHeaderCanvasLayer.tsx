import type { RefObject } from 'react';

const MIN_PORTAL_HEIGHT_PX = 160;
const MIN_PORTAL_WIDTH_PX = Math.ceil((MIN_PORTAL_HEIGHT_PX * 960) / 310);
const NARROW_PORTAL_TARGET_WIDTH_PX = 720;
const NARROW_PORTAL_MAX_EXTRA_PX = 240;

export type PortalHeaderCanvasLayerProps = {
  translateY: number;
  scale: number;
  active: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  zIndex?: number;
};

export function PortalHeaderCanvasLayer({
  translateY,
  scale,
  active,
  containerRef,
  canvasRef,
  zIndex = 10,
}: PortalHeaderCanvasLayerProps) {
  const portalWidthCss = `min(1120px, max(${MIN_PORTAL_WIDTH_PX}px, calc(100vw + clamp(0px, ${NARROW_PORTAL_TARGET_WIDTH_PX}px - 100vw, ${NARROW_PORTAL_MAX_EXTRA_PX}px))))`;

  return (
    <div
      className="absolute inset-x-0 top-0 flex justify-center overflow-visible pointer-events-none"
      style={{
        zIndex,
        opacity: active ? 1 : 0,
        transition: 'opacity 260ms ease',
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: portalWidthCss,
          aspectRatio: '960 / 310',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          background: 'transparent',
          overflow: 'visible',
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}

export default PortalHeaderCanvasLayer;
