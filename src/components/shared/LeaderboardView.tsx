'use client';
import { useEffect, useState } from 'react';
import { fetchWinners } from './useLeaderboard';
import styles from '../overlayModal.module.css';

interface LeaderboardViewProps {
  mode: 'daily' | 'weekly' | 'alltime' | 'stats';
}

export default function LeaderboardView({ mode }: LeaderboardViewProps) {
  const [winners, setWinners] = useState<any[]>([]);

  useEffect(() => {
    if (mode !== 'stats') {
      fetchWinners(mode).then(setWinners);
    }
  }, [mode]);

  return (
    <div className={styles.contentContainer}>
      {mode === 'stats' ? (
        <p>📊 Coming soon: your personal stats</p>
      ) : (
        <ul>
          {winners.map((entry, i) => (
            <li key={entry.id}>
              <strong>{i + 1}. {entry.username}</strong> — {entry.score} pts, {entry.turns} turns, {entry.time}s
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
