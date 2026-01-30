import type {
  Campaign,
  CampaignIconProps,
  CampaignStringsEntry,
  QuestionPool,
  ThemeColors,
} from '@engine/types';
import type { ComponentType } from 'react';

export interface CreateCampaignsFromGlobsParams<CampaignId extends string> {
  /** Used only for error messages */
  gameId: string;
  /** Ordered list of campaign ids */
  campaignIDs?: readonly CampaignId[];
  /** Usually `strings.campaigns` */
  campaignStrings: Record<CampaignId, CampaignStringsEntry>;
  /** `import.meta.glob('./campaigns/<id>/theme.ts', { eager: true })` */
  themeModules: Record<string, unknown>;
  /** `import.meta.glob('./campaigns/<id>/questions.ts', { eager: true })` */
  questionModules: Record<string, unknown>;
  /** Optional per-campaign icon overrides */
  iconsById?: Partial<Record<CampaignId, ComponentType<CampaignIconProps>>>;
}

const extractCampaignIdFromPath = (path: string): string | null => {
  const match = path.match(/^\.\/campaigns\/([^/]+)\//);
  if (!match) return null;
  return match[1]?.toLowerCase() ?? null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const buildExportMap = <T>(
  modules: Record<string, unknown>,
  exportKey: string,
  gameId: string
): Map<string, T> => {
  const map = new Map<string, T>();
  for (const [path, mod] of Object.entries(modules)) {
    const campaignId = extractCampaignIdFromPath(path);
    if (!campaignId) continue;
    if (!isRecord(mod) || !(exportKey in mod)) {
      throw new Error(
        `[${gameId}] Invalid module shape for "${path}". Expected export "${exportKey}".`
      );
    }
    map.set(campaignId, (mod as any)[exportKey] as T);
  }
  return map;
};

export function createCampaignsFromGlobs<CampaignId extends string>({
  gameId,
  campaignIDs,
  campaignStrings,
  themeModules,
  questionModules,
  iconsById,
}: CreateCampaignsFromGlobsParams<CampaignId>): Campaign[] {
  const ids =
    (campaignIDs?.length ? campaignIDs : Object.keys(campaignStrings)) as CampaignId[];
  const themesById = buildExportMap<ThemeColors>(themeModules, 'theme', gameId);
  const questionsById = buildExportMap<QuestionPool>(
    questionModules,
    'questions',
    gameId
  );

  return ids.map((id) => {
    const meta = campaignStrings[id];
    const theme = themesById.get(id);
    const questions = questionsById.get(id);

    if (!meta) {
      throw new Error(`[${gameId}] Missing strings.campaigns entry for "${id}".`);
    }
    if (!theme) {
      throw new Error(`[${gameId}] Missing theme module for campaign "${id}".`);
    }
    if (!questions) {
      throw new Error(`[${gameId}] Missing questions module for campaign "${id}".`);
    }

    const icon = iconsById?.[id];
    return {
      id,
      name: meta.name,
      label: meta.label,
      ...(icon ? { icon } : {}),
      theme,
      questions,
    };
  });
}
