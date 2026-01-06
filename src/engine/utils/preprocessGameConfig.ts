import type { GameConfig, CampaignIconProps } from '@engine/types';
import { baseImgIconClass, getCampaignIconSizeClass } from '@engine/types';
import { applyNoBreakMarkupDeep } from './noBreakMarkup';
import { gameIconsFile } from '@app/utils/paths';
import { jsx } from 'react/jsx-runtime';

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

const createDefaultCampaignIcon =
  (gameId: string, campaignId: string, alt: string) =>
  ({ className, size }: CampaignIconProps) =>
    jsx('img', {
      src: gameIconsFile(gameId, `${campaignId}.webp`),
      alt,
      draggable: false,
      loading: 'lazy',
      className: `${baseImgIconClass} ${className ?? getCampaignIconSizeClass(size)}`,
      onError: (e: unknown) => setImgEmojiFallback(e, '🎯'),
    });

const createDefaultEndIcon =
  (gameId: string, filename: string, alt: string, emojiFallback: string) => () =>
    jsx('img', {
      src: gameIconsFile(gameId, filename),
      alt,
      draggable: false,
      loading: 'lazy',
      className: 'w-full h-full object-contain',
      onError: (e: unknown) => setImgEmojiFallback(e, emojiFallback),
    });

const createDefaultCoinIcon = (gameId: string) => () =>
  jsx('img', {
    src: gameIconsFile(gameId, 'coin.webp'),
    alt: 'Coin',
    draggable: false,
    loading: 'lazy',
    className: 'w-5 h-5 inline mr-1 object-contain align-[-2px]',
    onError: (e: unknown) => setImgEmojiFallback(e, '🪙'),
  });

/**
 * Engine-level config preprocessing.
 *
 * Currently:
 * - applies `{no-break markup}` to `config.strings` and `config.systemStrings`.
 */
export function preprocessGameConfig(rawConfig: GameConfig): GameConfig {
  const gameId = rawConfig.id;

  return {
    ...rawConfig,
    strings: applyNoBreakMarkupDeep(rawConfig.strings),
    systemStrings: rawConfig.systemStrings
      ? applyNoBreakMarkupDeep(rawConfig.systemStrings)
      : undefined,
    campaigns: rawConfig.campaigns.map((campaign) => ({
      ...campaign,
      icon:
        campaign.icon ??
        createDefaultCampaignIcon(gameId, campaign.id, campaign.name),
      musicTrack: campaign.musicTrack ?? `${campaign.id}.ogg`,
      selectSound: campaign.selectSound ?? `select-${campaign.id}.ogg`,
    })),
    icons: {
      ...rawConfig.icons,
      coin: rawConfig.icons?.coin ?? createDefaultCoinIcon(gameId),
    },
    endIcons: {
      ...rawConfig.endIcons,
      victory:
        rawConfig.endIcons?.victory ??
        createDefaultEndIcon(gameId, 'victory.webp', 'Victory', '🏆'),
      defeat:
        rawConfig.endIcons?.defeat ??
        createDefaultEndIcon(gameId, 'defeat.webp', 'Defeat', '❌'),
      retreat:
        rawConfig.endIcons?.retreat ??
        createDefaultEndIcon(gameId, 'retreat.webp', 'Retreat', '💰'),
    },
  };
}
