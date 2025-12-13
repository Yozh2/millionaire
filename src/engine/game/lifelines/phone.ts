export interface PhoneSuggestion {
  isConfident: boolean;
  suggestedOriginalIndex: number;
}

export interface PhoneInput {
  correctOriginalIndex: number;
  rng?: () => number;
}

export const getPhoneSuggestion = ({
  correctOriginalIndex,
  rng = Math.random,
}: PhoneInput): PhoneSuggestion => {
  const isConfident = rng() > 0.2;
  if (isConfident) {
    return { isConfident: true, suggestedOriginalIndex: correctOriginalIndex };
  }

  const wrongOriginalIndices = [0, 1, 2, 3].filter((i) => i !== correctOriginalIndex);
  const suggestedOriginalIndex =
    wrongOriginalIndices[Math.floor(rng() * wrongOriginalIndices.length)];

  return { isConfident: false, suggestedOriginalIndex };
};

