import type { CampaignStringsEntry } from '@engine/types';
import { describe, expect, it } from 'vitest';
import { createCampaignsFromGlobs } from './createCampaignsFromGlobs';

describe('createCampaignsFromGlobs', () => {
  it('builds campaigns in order and matches folder ids case-insensitively', () => {
    const HeroIcon = () => null;

    const campaignIDs = ['darkurge', 'hero'] as const;
    const campaignStrings = {
      darkurge: { name: 'DARK URGE', label: 'DU' },
      hero: { name: 'HERO', label: 'Good' },
    } satisfies Record<(typeof campaignIDs)[number], CampaignStringsEntry>;

    const campaigns = createCampaignsFromGlobs({
      gameId: 'bg3',
      campaignIDs,
      campaignStrings,
      iconsById: { hero: HeroIcon },
      themeModules: {
        './campaigns/darkUrge/theme.ts': { theme: { primary: 'a' } },
        './campaigns/HERO/theme.ts': { theme: { primary: 'b' } },
      },
      questionModules: {
        './campaigns/darkUrge/questions.ts': { questions: { easy: [] } },
        './campaigns/HERO/questions.ts': { questions: { easy: [] } },
      },
    });

    expect(campaigns.map((c) => c.id)).toEqual(['darkurge', 'hero']);
    expect(campaigns[0]?.name).toBe('DARK URGE');
    expect(campaigns[1]?.icon).toBe(HeroIcon);
  });

  it('uses strings order when campaignIDs are omitted', () => {
    const campaignStrings = {
      b: { name: 'B', label: 'B' },
      a: { name: 'A', label: 'A' },
    } as const satisfies Record<string, CampaignStringsEntry>;

    const campaigns = createCampaignsFromGlobs({
      gameId: 'order',
      campaignStrings,
      themeModules: {
        './campaigns/a/theme.ts': { theme: { primary: 'a' } },
        './campaigns/b/theme.ts': { theme: { primary: 'b' } },
      },
      questionModules: {
        './campaigns/a/questions.ts': { questions: { easy: [] } },
        './campaigns/b/questions.ts': { questions: { easy: [] } },
      },
    });

    expect(campaigns.map((c) => c.id)).toEqual(['b', 'a']);
  });

  it('throws on invalid module shape', () => {
    const campaignIDs = ['x'] as const;
    const campaignStrings = {
      x: { name: 'X', label: 'X' },
    } satisfies Record<(typeof campaignIDs)[number], CampaignStringsEntry>;

    expect(() =>
      createCampaignsFromGlobs({
        gameId: 'x',
        campaignIDs,
        campaignStrings,
        themeModules: {
          './campaigns/x/theme.ts': {},
        },
        questionModules: {
          './campaigns/x/questions.ts': { questions: { easy: [] } },
        },
      })
    ).toThrow(/Invalid module shape/);
  });
});
