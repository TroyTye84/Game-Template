'use client';

import React, { useEffect, useState } from 'react';
import styles from './wordlegameboard.module.css';
import { evaluateGuess } from './wordleTileLogic';

type WordleGameBoardProps = {
    guesses: string[];
    currentGuess: string;
    wordLength: number;
    maxTurns?: number;
    targetWord: string; // 👈 Add this
  };

  export default function WordleGameBoard({
    guesses,
    currentGuess,
    wordLength = 5,
    maxTurns = 6,
    targetWord, // ✅ add this line
  }: WordleGameBoardProps) {
  const [animatingIndex, setAnimatingIndex] = useState(-1);
  const emptyRows = Array.from({ length: maxTurns - guesses.length - 1 }, () => '');
  const rows = [...guesses, currentGuess, ...emptyRows].slice(0, maxTurns);
  
  // Track changes to currentGuess to trigger animation
  useEffect(() => {
    if (currentGuess.length > 0) {
      // Animate the last entered character
      setAnimatingIndex(currentGuess.length - 1);
      
      // Clear animation after it completes
      const timer = setTimeout(() => {
        setAnimatingIndex(-1);
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [currentGuess]);

  return (
    <div className={styles.board}>
      {rows.map((word, rowIndex) => {
        const isFinal = rowIndex < guesses.length;
        const evaluated = isFinal ? evaluateGuess(word, targetWord) : [];

        const isCurrentRow = rowIndex === guesses.length;

        return (
          <div className={styles.row} key={rowIndex}>
            {Array.from({ length: wordLength }).map((_, colIndex) => {
              const char = word[colIndex] || '';
              const status = evaluated[colIndex]?.status || ''; // "correct", "present", "absent"
              
              // Determine if this tile should be animated
              const shouldAnimate = isCurrentRow && colIndex === animatingIndex;
              
              const cellClass = `${styles.tile} 
                ${status ? styles[`cell-${status}`] : ''} 
                ${shouldAnimate ? styles.tileActive : ''}`;

              return (
                <div className={cellClass} key={colIndex}>
                  {char.toUpperCase()}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}