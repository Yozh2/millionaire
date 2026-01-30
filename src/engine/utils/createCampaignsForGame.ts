import type {
  Campaign,
  CampaignIconProps,
  CampaignStringsEntry,
} from '@engine/types';
import type { ComponentType } from 'react';
import { createCampaignsFromGlobs } from './createCampaignsFromGlobs';

const GAME_CAMPAIGN_PATH =
  /(?:^|\/)games\/([^/]+)\/campaigns\/([^/]+)\/(theme|questions)\.ts$/;

const normalizeModulesForGame = (
  modules: Record<string, unknown>,
  gameId: string
): Record<string, unknown> => {
  const normalized: Record<string, unknown> = {};

  for (const [path, mod] of Object.entries(modules)) {
    const match = path.match(GAME_CAMPAIGN_PATH);
    if (!match) continue;
    const [, matchGameId, campaignId, fileKind] = match;
    if (matchGameId !== gameId) continue;
    normalized[`./campaigns/${campaignId}/${fileKind}.ts`] = mod;
  }

  return normalized;
};

export function createCampaignsForGame<CampaignId extends string>({
  gameId,
  campaignStrings,
  iconsById,
}: {
  gameId: string;
  campaignStrings: Record<CampaignId, CampaignStringsEntry>;
  iconsById?: Partial<Record<CampaignId, ComponentType<CampaignIconProps>>>;
}): Campaign[] {
  const themeModules = import.meta.glob('/src/games/*/campaigns/*/theme.ts', {
    eager: true,
  });
  const questionModules = import.meta.glob('/src/games/*/campaigns/*/questions.ts', {
    eager: true,
  });

  return createCampaignsFromGlobs({
    gameId,
    campaignStrings,
    iconsById,
    themeModules: normalizeModulesForGame(themeModules, gameId),
    questionModules: normalizeModulesForGame(questionModules, gameId),
  });
}
