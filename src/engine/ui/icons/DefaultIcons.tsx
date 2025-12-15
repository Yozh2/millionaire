/**
 * Default emoji-based icons for game UI.
 *
 * These are used as fallbacks when game config doesn't provide custom icons.
 */

// Game Screen Icons
export const DefaultCoinIcon = () => <span className="mr-1">🪙</span>;
export const DefaultPhoneHintIcon = () => (
  <span className="inline-block">📞</span>
);
export const DefaultAudienceHintIcon = () => (
  <span className="inline-block">📊</span>
);

// Sound Consent / Audio UI
export const DefaultHeadphonesIcon = () => (
  <div className="w-16 h-16 mx-auto flex items-center justify-center text-5xl">
    🎧
  </div>
);

// End Screen Icons
export const DefaultTrophyIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl">
    🏆
  </div>
);

export const DefaultFailIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl">
    ❌
  </div>
);

export const DefaultMoneyIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl">
    💰
  </div>
);
