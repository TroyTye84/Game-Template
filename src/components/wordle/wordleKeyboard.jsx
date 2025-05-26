'use client';
import React, { useEffect } from 'react';
import styles from './wordleKeyboard.module.css';

const WordleKeyboard = ({ onKeyPress, letterStates = {}, disabled = false }) => {
  const topRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled) return;
      const key = e.key.toLowerCase();
      if (/^[a-z]$/.test(key)) {
        onKeyPress(key);
      } else if (key === 'enter') {
        onKeyPress('Enter');
      } else if (key === 'backspace') {
        onKeyPress('Backspace');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress, disabled]);

  const getKeyClass = (key) => {
    let base = styles.keyButton;
    const state = letterStates[key.toLowerCase()];
    if (state && styles[state]) {
      base += ` ${styles[state]}`;
    }
    if (key === 'Backspace') base += ` ${styles.deleteKey}`;
    return base;
  };

  const getDisplay = (key) => (key === 'Backspace' ? 'DELETE' : key);

  return (
    <div className={styles.keyboardContainer}>
      {topRows.map((row, i) => (
        <div key={i} className={styles.keyboardRow}>
          {row.map((key) => (
            <button
              key={key}
              className={getKeyClass(key)}
              onClick={() => !disabled && onKeyPress(key)}
              aria-label={key}
              disabled={disabled}
            >
              {getDisplay(key)}
            </button>
          ))}
        </div>
      ))}

      {/* Enter key as full-width button */}
      <div className={styles.enterRow}>
  <button
    className={styles.submitButton}
    onClick={() => !disabled && onKeyPress('Enter')}
    aria-label="Enter"
    disabled={disabled}
  >
    Submit
  </button>
</div>


    </div>
  );
};

export default WordleKeyboard;
