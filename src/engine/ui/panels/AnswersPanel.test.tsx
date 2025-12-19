import { render, screen } from '@testing-library/react';
import type { ThemeColors } from '@engine/types';
import { AnswersPanel } from './AnswersPanel';

describe('AnswersPanel', () => {
  const theme = {
    textPrimary: 'text-white',
    textSecondary: 'text-stone-200',
    textAccent: 'text-amber-300',
    bgAnswer: 'from-stone-800 via-stone-900 to-stone-950',
    bgAnswerHover: 'hover:from-stone-700 hover:via-stone-800 hover:to-stone-900',
    border: 'border-stone-600',
    borderHover: 'hover:border-stone-500',
    shadowAnswer: 'shadow',
  } as unknown as ThemeColors;

  const renderPanel = (opts: {
    selectedAnswer: number | null;
    preventCorrectRevealOnWrongSelection?: boolean;
  }) => {
    render(
      <AnswersPanel
        answers={['A0', 'A1', 'A2', 'A3']}
        correctAnswerIndex={1}
        shuffledAnswers={[0, 1, 2, 3]}
        eliminatedAnswers={[]}
        selectedAnswer={opts.selectedAnswer}
        preventCorrectRevealOnWrongSelection={opts.preventCorrectRevealOnWrongSelection}
        theme={theme}
        answerIndexRefs={{ current: [] }}
        onAnswerClick={() => {}}
      />
    );
  };

  it('does not reveal correct answer on first wrong selection when Double Dip is active', () => {
    renderPanel({ selectedAnswer: 0, preventCorrectRevealOnWrongSelection: true });
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]?.className).toContain('from-red-900');
    expect(buttons[1]?.className).not.toContain('from-emerald-800');
    expect(buttons[1]?.className).toContain('opacity-30');
  });

  it('reveals correct answer when wrong selection and Double Dip is not active', () => {
    renderPanel({ selectedAnswer: 0, preventCorrectRevealOnWrongSelection: false });
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]?.className).toContain('from-red-900');
    expect(buttons[1]?.className).toContain('from-emerald-800');
    expect(buttons[2]?.className).toContain('opacity-30');
    expect(buttons[3]?.className).toContain('opacity-30');
  });

  it('still highlights correct selection even when Double Dip is active', () => {
    renderPanel({ selectedAnswer: 1, preventCorrectRevealOnWrongSelection: true });
    const buttons = screen.getAllByRole('button');
    expect(buttons[1]?.className).toContain('from-emerald-800');
    expect(buttons[0]?.className).toContain('opacity-30');
    expect(buttons[2]?.className).toContain('opacity-30');
    expect(buttons[3]?.className).toContain('opacity-30');
  });
});
