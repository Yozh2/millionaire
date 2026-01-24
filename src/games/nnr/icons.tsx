import {
  baseCenteredIconClass,
  baseImgIconClass,
  getCampaignIconSizeClass,
  type CampaignIconProps,
} from '@engine/types';
import { gameIconsFile } from '@app/utils/paths';
import { strings } from './strings';

const buildCampaignIcon = (filename: string, label: string) =>
  ({ className, size }: CampaignIconProps) => (
    <img
      src={gameIconsFile('nnr', `campaigns/${filename}`)}
      alt={label}
      loading="lazy"
      draggable={false}
      className={`${baseImgIconClass} ${className ?? getCampaignIconSizeClass(size)}`}
    />
  );

export const PerceptronCampaignIcon = buildCampaignIcon(
  'perceptron.svg',
  strings.campaigns.perceptron.iconAlt ?? strings.campaigns.perceptron.name
);

export const NeuralCampaignIcon = buildCampaignIcon(
  'nn.svg',
  strings.campaigns.nn.iconAlt ?? strings.campaigns.nn.name
);

export const ResearchCampaignIcon = buildCampaignIcon(
  'research.svg',
  strings.campaigns.research.iconAlt ?? strings.campaigns.research.name
);

export const NnrCoinIcon = () => (
  <img
    src={gameIconsFile('nnr', 'coin.svg')}
    alt=""
    aria-hidden="true"
    className="inline-block w-4 h-4 mr-1 align-middle"
  />
);

export const VictoryCakeIcon = () => (
  <div className={`${baseCenteredIconClass} w-64 h-64`}>
    <svg
      viewBox="0 0 200 200"
      className="w-[220px] h-[220px]"
      aria-hidden="true"
      style={{ filter: 'drop-shadow(0 10px 22px rgba(0, 0, 0, 0.55))' }}
    >
      <ellipse cx="100" cy="162" rx="70" ry="16" fill="#0f172a" opacity="0.7" />
      <ellipse cx="100" cy="158" rx="62" ry="12" fill="#cbd5f5" opacity="0.35" />
      <rect x="46" y="90" width="108" height="60" rx="12" fill="#5b2c1a" />
      <rect x="54" y="70" width="92" height="28" rx="12" fill="#6b3420" />
      <path
        d="M46 90h108v18c-6 8-12 8-18 0c-6 8-12 8-18 0c-6 8-12 8-18 0c-6 8-12 8-18 0c-6 8-12 8-18 0V90z"
        fill="#e2a1a1"
      />
      <rect x="96" y="40" width="8" height="30" rx="3" fill="#facc15" />
      <path
        d="M100 30c8 8 6 18-2 24c2-6-2-10-4-14c2-6 4-10 6-10z"
        fill="#fb7185"
      />
      <circle cx="138" cy="82" r="6" fill="#ef4444" />
      <circle cx="132" cy="78" r="2" fill="#fca5a5" />
    </svg>
  </div>
);

export const RetreatCubeIcon = () => (
  <div className={`${baseCenteredIconClass} w-64 h-64`}>
    <svg
      viewBox="0 0 200 200"
      className="w-[220px] h-[220px]"
      aria-hidden="true"
      style={{ filter: 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.55))' }}
    >
      <rect
        x="44"
        y="44"
        width="112"
        height="112"
        rx="10"
        fill="#111827"
        stroke="#94a3b8"
        strokeWidth="4"
      />
      <rect
        x="60"
        y="60"
        width="80"
        height="80"
        rx="8"
        fill="#0f172a"
        stroke="#64748b"
        strokeWidth="3"
      />
      <circle
        cx="100"
        cy="100"
        r="28"
        fill="#111827"
        stroke="#cbd5e1"
        strokeWidth="3"
      />
      <path
        d="M90 98c0-6 8-8 10-2c2-6 10-4 10 2c0 8-10 14-10 14s-10-6-10-14z"
        fill="#fda4af"
      />
      <rect x="54" y="54" width="18" height="18" fill="#1f2937" />
      <rect x="128" y="54" width="18" height="18" fill="#1f2937" />
      <rect x="54" y="128" width="18" height="18" fill="#1f2937" />
      <rect x="128" y="128" width="18" height="18" fill="#1f2937" />
    </svg>
  </div>
);

export const DefeatIncineratorIcon = () => (
  <div className={`${baseCenteredIconClass} w-64 h-64`}>
    <svg
      viewBox="0 0 200 200"
      className="w-[220px] h-[220px]"
      aria-hidden="true"
      style={{ filter: 'drop-shadow(0 12px 26px rgba(0, 0, 0, 0.6))' }}
    >
      <rect
        x="40"
        y="36"
        width="120"
        height="128"
        rx="12"
        fill="#0b0f19"
        stroke="#ef4444"
        strokeWidth="4"
      />
      <rect
        x="56"
        y="68"
        width="88"
        height="72"
        rx="8"
        fill="#1f2937"
        stroke="#f97316"
        strokeWidth="3"
      />
      <path
        d="M100 82c14 14 16 32 0 48c-18-12-14-34 0-48z"
        fill="#f97316"
      />
      <path
        d="M100 92c8 8 8 18 0 28c-10-8-8-20 0-28z"
        fill="#fde047"
      />
      <path
        d="M56 150l88-12"
        stroke="#ef4444"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M56 150l18 12M86 146l18 12M116 142l18 12"
        stroke="#f59e0b"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  </div>
);
