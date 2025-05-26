'use client';

import { useEffect, useState } from 'react';

type GameTimerProps = {
  game?: string;
  variant?: 'minimal' | 'default';
  paused?: boolean;
  autoStart?: boolean;
};

export default function GameTimer({
  game = 'default',
  variant = 'default',
  paused = false,
  autoStart = true,
}: GameTimerProps) {
  const startKey = `${game}_startTime`;
  const finalKey = `${game}_finalTime`;
  const startedKey = `${game}_started`;

  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);

  // ⏳ On mount, check if game already ended
  useEffect(() => {
    const storedFinal = localStorage.getItem(finalKey);
    if (storedFinal) {
      setSeconds(parseInt(storedFinal, 10));
      return;
    }

    // Game not over — check if it has started
    const startedFlag = autoStart || localStorage.getItem(startedKey) === 'true';
    setStarted(startedFlag);

    // Poll for manual start if needed
    if (!autoStart && !startedFlag) {
      const poll = setInterval(() => {
        if (localStorage.getItem(startedKey) === 'true') {
          setStarted(true);
          clearInterval(poll);
        }
      }, 300);
      return () => clearInterval(poll);
    }
  }, [game, autoStart]);

  // 🕒 Run timer if started and not paused
  useEffect(() => {
    if (!started || paused || localStorage.getItem(finalKey)) return;

    const storedStart = localStorage.getItem(startKey);
    const startTime = storedStart ? parseInt(storedStart, 10) : Date.now();
    if (!storedStart) localStorage.setItem(startKey, String(startTime));

    const updateTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setSeconds(elapsed);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [started, paused, game]);

  return (
    <span>
      {variant === 'minimal' ? `${seconds}s` : `⏱️ Time: ${seconds} seconds`}
    </span>
  );
}
