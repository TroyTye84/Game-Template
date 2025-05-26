import React, { useState, useEffect } from 'react';
import styles from './wordleWinOverlay.module.css';
import { supabase } from '@/lib/supabase'; // Adjust the import if needed

interface WordleWinOverlayProps {
  word: string;
  definition: string;
  partOfSpeech: string;
  totalPoints: number;
  turns: number;
  timeElapsed: number;
  difficulty?: string;
  onClose: () => void;
}

export default function WordleWinOverlay({
  word,
  definition,
  partOfSpeech,
  totalPoints,
  turns,
  timeElapsed,
  difficulty = 'medium',
  onClose,
}: WordleWinOverlayProps) {
  const [name, setName] = useState('');
  const [notify, setNotify] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleSaveScore() {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setSaving(true);
    setError('');

    const { error } = await supabase.from('scores').insert({
      username: name.trim(),
      score: totalPoints,
      word,
      difficulty,
      time: timeElapsed,
      turns,
    });

    if (error) {
      console.error('❌ Supabase insert error:', error.message);
      setError('Failed to save score.');
    } else {
      setSaved(true);
    }

    setSaving(false);
  }

  return (
    <div className={styles.winContainer}>
      <div className={styles.header}>
  <div className={styles.spacer}></div>
  <h2>Congratulations!</h2>
  <button className={styles.closeButton} onClick={onClose}>×</button>
</div>

      <div className={styles.word}>{word.toUpperCase()}</div>
      <div className={styles.definition}>
        <em>{partOfSpeech}</em> — {definition}
      </div>

      <div className={styles.statsRow}>
        <div>
          <div className={styles.label}>Points</div>
          <div className={styles.value}>{totalPoints}</div>
        </div>
        <div>
          <div className={styles.label}>Turns</div>
          <div className={styles.value}>{turns}</div>
        </div>
        <div>
          <div className={styles.label}>Time</div>
          <div className={styles.value}>{timeElapsed}</div>
        </div>
      </div>

      <div className={styles.nextWordTimer}>
        Next word in:
        <div className={styles.timer}>{timeRemaining}</div>
      </div>

      <label className={styles.notifyCheckbox}>
        <input
          type="checkbox"
          checked={notify}
          onChange={() => setNotify(!notify)}
        />
        Notify me when the next word is available
      </label>

      <input
        className={styles.nameInput}
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {error && <div className={styles.error}>{error}</div>}
      {saved ? (
        <div className={styles.success}>🎉 Score saved!</div>
      ) : (
        <button
          className={styles.saveButton}
          onClick={handleSaveScore}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Score'}
        </button>
      )}

      <button className={styles.shareButton}>Have a friend try</button>
    </div>
  );
}

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const diffMs = midnight.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`;
}
