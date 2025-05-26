'use client';

import { useEffect, useState } from 'react';
import { getStoredInt } from '@/lib/localStorage';

type TurnsCounterProps = {
  game: string; // required (e.g., 'wordle', 'sudoku')
};

export default function TurnsCounter({ game }: TurnsCounterProps) {
  const storageKey = `${game}_turns`; // e.g., 'wordle_turns'
  const [turns, setTurns] = useState(0);

  useEffect(() => {
    const updateTurns = () => {
      const value = getStoredInt(storageKey);
      setTurns(value);
    };

    updateTurns(); // Load immediately
    const interval = setInterval(updateTurns, 500);

    return () => clearInterval(interval);
  }, [storageKey]);

  return (
    <p className="text-gray-600 mb-2">🔄 Turns: {turns}</p>
  );
}
