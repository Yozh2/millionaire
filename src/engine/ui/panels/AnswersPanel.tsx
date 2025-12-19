import type { MouseEvent, MutableRefObject } from 'react';
import type { ThemeColors } from '@engine/types';
import { AnswerButton } from '../components/buttons';

interface AnswersPanelProps {
  answers: string[];
  correctAnswerIndex: number;
  shuffledAnswers: number[];
  eliminatedAnswers: number[];
  selectedAnswer: number | null;
  preventCorrectRevealOnWrongSelection?: boolean;
  theme: ThemeColors;
  answerIndexRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  onAnswerClick: (displayIndex: number, e: MouseEvent<HTMLButtonElement>) => void;
}

export function AnswersPanel({
  answers,
  correctAnswerIndex,
  shuffledAnswers,
  eliminatedAnswers,
  selectedAnswer,
  preventCorrectRevealOnWrongSelection = false,
  theme,
  answerIndexRefs,
  onAnswerClick,
}: AnswersPanelProps) {
  const getAnswerStyle = (displayIndex: number): string => {
    const base =
      'relative px-4 py-3 text-left transition-all duration-300 ' +
      'cursor-pointer text-sm border-4 ';

    const isSelected = selectedAnswer !== null && displayIndex === selectedAnswer;
    const selectedClass = isSelected ? ' answer-btn--selected' : '';

    if (eliminatedAnswers.includes(displayIndex)) {
      return (
        base +
        'opacity-30 cursor-not-allowed bg-stone-950 text-stone-700 border-stone-900'
      );
    }

    const originalIndex = shuffledAnswers[displayIndex];

    if (selectedAnswer !== null) {
      const selectedOriginalIndex = shuffledAnswers[selectedAnswer];
      const selectionIsCorrect = selectedOriginalIndex === correctAnswerIndex;

      const shouldRevealCorrect =
        selectionIsCorrect || !preventCorrectRevealOnWrongSelection;

      if (originalIndex === correctAnswerIndex && shouldRevealCorrect) {
        return (
          base +
          'bg-gradient-to-br from-emerald-800 to-emerald-950 ' +
          'text-emerald-200 border-emerald-500 shadow-xl animate-pulse' +
          selectedClass
        );
      }

      if (displayIndex === selectedAnswer && originalIndex !== correctAnswerIndex) {
        return (
          base +
          'bg-gradient-to-br from-red-900 to-red-950 ' +
          'text-red-300 border-red-600 shadow-lg animate-pulse' +
          selectedClass
        );
      }

      // After selection, all other answers should look like "50:50 eliminated" ones.
      return (
        base + 'opacity-30 cursor-not-allowed bg-stone-950 text-stone-700 border-stone-900'
      );
    }

    return (
      base +
      `bg-gradient-to-b ${theme.bgAnswer} ` +
      `${theme.textSecondary} ${theme.border} ` +
      `${theme.borderHover} ${theme.bgAnswerHover} ` +
      `${theme.textAccent} hover:shadow-lg ${theme.shadowAnswer}`
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {shuffledAnswers.map((originalIndex, displayIndex) => (
        <AnswerButton
          key={displayIndex}
          onClick={(e) => onAnswerClick(displayIndex, e)}
          disabled={selectedAnswer !== null || eliminatedAnswers.includes(displayIndex)}
          className={getAnswerStyle(displayIndex)}
        >
          <span
            ref={(el) => {
              answerIndexRefs.current[displayIndex] = el;
            }}
            className={`${theme.textPrimary} mr-2 font-bold`}
          >
            [{['A', 'B', 'C', 'D'][displayIndex]}]
          </span>
          {answers[originalIndex]}
        </AnswerButton>
      ))}
    </div>
  );
}

export default AnswersPanel;
