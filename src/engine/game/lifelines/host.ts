export interface HostSuggestionInput {
  correctDisplayIndex: number;
  eliminatedDisplayIndices?: readonly number[];
  rng?: () => number;
  confidentChance?: number;
}

export interface HostSuggestion {
  suggestedDisplayIndex: number;
  confidence: 'confident' | 'uncertain';
}

export const getHostSuggestion = ({
  correctDisplayIndex,
  eliminatedDisplayIndices = [],
  rng = Math.random,
  confidentChance = 0.78,
}: HostSuggestionInput): HostSuggestion => {
  const available = [0, 1, 2, 3].filter(
    (i) => !eliminatedDisplayIndices.includes(i)
  );

  const wrongChoices = available.filter((i) => i !== correctDisplayIndex);

  const isConfident = rng() < confidentChance;
  const suggestedDisplayIndex =
    isConfident || wrongChoices.length === 0
      ? correctDisplayIndex
      : wrongChoices[Math.floor(rng() * wrongChoices.length)]!;

  return {
    suggestedDisplayIndex,
    confidence: isConfident ? 'confident' : 'uncertain',
  };
};

