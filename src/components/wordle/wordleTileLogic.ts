export type EvaluatedLetter = {
  letter: string;
  status: 'correct' | 'present' | 'absent';
};

/**
 * Compare guess to target word and return array of tile evaluations.
 * Each object includes a letter and its evaluation status.
 *
 * @param guess - The guessed word
 * @param answer - The correct answer
 * @returns Array of EvaluatedLetter objects
 */
export function evaluateGuess(guess: string, answer: string): EvaluatedLetter[] {
  const result: EvaluatedLetter[] = [];
  const answerLetters = answer.split('');
  const guessLetters = guess.split('');
  const letterUsage = Array(answer.length).fill(false);

  // First pass: correct letters
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      result[i] = { letter: guessLetters[i], status: 'correct' };
      letterUsage[i] = true;
    }
  }

  // Second pass: present or absent
  for (let i = 0; i < guessLetters.length; i++) {
    if (!result[i]) {
      const index = answerLetters.findIndex(
        (char, j) => char === guessLetters[i] && !letterUsage[j]
      );
      if (index !== -1) {
        result[i] = { letter: guessLetters[i], status: 'present' };
        letterUsage[index] = true;
      } else {
        result[i] = { letter: guessLetters[i], status: 'absent' };
      }
    }
  }

  return result;
}
