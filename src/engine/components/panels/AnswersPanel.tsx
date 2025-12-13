import type { MouseEvent, MutableRefObject } from 'react';
import type { ThemeColors } from '../../types';

interface AnswersPanelProps {
  answers: string[];
  correctAnswerIndex: number;
  shuffledAnswers: number[];
  eliminatedAnswers: number[];
  selectedAnswer: number | null;
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
  theme,
  answerIndexRefs,
  onAnswerClick,
}: AnswersPanelProps) {
  const getAnswerStyle = (displayIndex: number): string => {
    const base =
      'relative px-4 py-3 text-left transition-all duration-300 ' +
      'cursor-pointer text-sm border-4 ';

    if (eliminatedAnswers.includes(displayIndex)) {
      return (
        base +
        'opacity-30 cursor-not-allowed bg-stone-950 text-stone-700 border-stone-900'
      );
    }

    const originalIndex = shuffledAnswers[displayIndex];

    if (selectedAnswer !== null) {
      if (originalIndex === correctAnswerIndex) {
        return (
          base +
          'bg-gradient-to-br from-emerald-800 to-emerald-950 ' +
          'text-emerald-200 border-emerald-500 shadow-xl animate-pulse'
        );
      }

      if (displayIndex === selectedAnswer && originalIndex !== correctAnswerIndex) {
        return (
          base +
          'bg-gradient-to-br from-red-900 to-red-950 ' +
          'text-red-300 border-red-600 shadow-lg'
        );
      }
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
        <button
          key={displayIndex}
          onClick={(e) => onAnswerClick(displayIndex, e)}
          disabled={selectedAnswer !== null || eliminatedAnswers.includes(displayIndex)}
          className={`shine-button answer-btn ${getAnswerStyle(displayIndex)}`}
          style={{ borderStyle: 'ridge' }}
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
        </button>
      ))}
    </div>
  );
}

export default AnswersPanel;

