/**
 * BG3-specific non-asset icons.
 *
 * End screen icons and coin icon are resolved by the engine via
 * `/public/games/bg3/icons/{treasure,money,lost,coin}.webp` conventions.
 */

import { gameIconsFile } from '@app/utils/paths';

const createEmojiSvgDataUrl = (emoji: string): string => {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
    `<text y='.9em' font-size='90'>${emoji}</text>` +
    '</svg>';
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const setImgEmojiFallback = (e: unknown, emoji: string): void => {
  const target = (e as any)?.currentTarget as HTMLImageElement | undefined;
  if (!target) return;
  if (target.dataset?.emojiFallbackApplied === 'true') return;
  target.dataset.emojiFallbackApplied = 'true';
  target.src = createEmojiSvgDataUrl(emoji);
};

export const lifelinePhoneIcon = () => <span className="inline-block">📜</span>;
export const lifelineAudienceIcon = () => <span className="inline-block">🍺</span>;

export const Bg3DefeatIcon = () => (
  <div className="bg3-defeat-icon">
    <img
      src={gameIconsFile('bg3', 'defeat.webp')}
      alt="Defeat"
      draggable={false}
      loading="lazy"
      className="bg3-defeat-icon__img"
      onError={(e) => setImgEmojiFallback(e, '❌')}
    />
  </div>
);
