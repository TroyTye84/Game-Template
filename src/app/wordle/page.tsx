'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  startGame,
  addTurn,
  addPoints,
  getGameStats,
  getStoredBool,
  setStoredBool,
} from '@/lib/gameLogic';
import {
  getStoredInt,
  setStoredInt,
  incrementStoredInt,
  getStoredArray,
  setStoredArray,
} from '@/lib/localStorage';
import GameTimer from '@/components/GameTimer';
import TurnsCounter from '@/components/TurnsCounter';
import WordleKeyboard from '@/components/wordle/wordleKeyboard';
import styles from '@/components/wordle/wordleGame.module.css';
import WordleGameBoard from '@/components/wordle/wordlegameboard';
import { evaluateGuess } from '@/components/wordle/wordleTileLogic';
import { VALID_WORDS } from '@/lib/validWords';
import Popup from '@/components/Popup';
import WordleThemeColor from '@/components/WordleThemeColor';
import OverlayModal from '@/components/OverlayModal';
import WordleOverlayContent from '@/components/wordle/WordleOverlayContent';
import WordleWinOverlay from '../../components/wordle/WordleWinOverlay';
import React from 'react';

function buildLetterStates(guesses: string[], targetWord: string) {
  const states: Record<string, string> = {};
  guesses.forEach((guess) => {
    const result = evaluateGuess(guess, targetWord);
    result.forEach(({ letter, status }) => {
      const existing = states[letter];
      if (
        status === 'correct' ||
        (status === 'present' && existing !== 'correct') ||
        (status === 'absent' && !existing)
      ) {
        states[letter] = status;
      }
    });
  });
  return states;
}

export default function WordleGame() {
  const [dailyWord, setDailyWord] = useState<string | null>(null);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [popup, setPopup] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayContent, setOverlayContent] = useState<React.ReactNode>(null);
  const [definition, setDefinition] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('');
  useEffect(() => {
    fetch('https://osmoadvent.com/get-word.php')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.word) {
            setDailyWord(data.word.toLowerCase());
            setDefinition(data.definition || '');
            setPartOfSpeech(data.partOfSpeech || '');
          } else {
          console.error('❌ Failed to get word:', data.error);
        }
      })
      .catch((err) => {
        console.error('❌ Error fetching word:', err);
      });
  }, []);

  useEffect(() => {
    startGame();
    setStreak(getStoredInt('wordle_streak'));
    setGuesses(getStoredArray('wordle_guesses'));
  }, []);

  useEffect(() => {
    const alreadyOver = getStoredBool('wordle_gameOver');
    setGameOver(alreadyOver);

    if (!alreadyOver) {
      startGame();
      setStoredBool('wordle_gameOver', false);
    }

    setStreak(getStoredInt('wordle_streak'));
    setGuesses(getStoredArray('wordle_guesses'));
  }, []);

  useEffect(() => {
    setStoredArray('wordle_guesses', guesses);
  }, [guesses]);

  if (!dailyWord) return <div>Loading today's word...</div>;

  const WORD_LENGTH = dailyWord.length;

  const handleGuess = () => {
    if (!guess || gameOver) return;
  
    const normalized = guess.toLowerCase();
  
    // Check if the guess matches the target word length
    if (normalized.length !== WORD_LENGTH) {
      setPopup(`Word must be ${WORD_LENGTH} letters long`);
      return; // Don't clear the guess so they can add more letters
    }
  
    if (!VALID_WORDS.has(normalized)) {
      setPopup(`<strong>${guess.toUpperCase()}</strong><br />is not in the word list.`);
      setGuess('');
      return;
    }
  
    const updatedGuesses = [...guesses, guess];
    setGuesses(updatedGuesses);
    incrementStoredInt('wordle_turns');
    addTurn();
  
    if (normalized === dailyWord) {
      setGameOver(true);
      setStoredBool('wordle_gameOver', true);
  
      const now = Date.now();
      const start = Number(localStorage.getItem('wordle_startTime') || now);
      const elapsed = Math.floor((now - start) / 1000);
      localStorage.setItem('wordle_finalTime', String(elapsed));
  
      const stats = getGameStats();
      const timePoints = Math.max(100 - elapsed, 10);
      const turnPoints = Math.max(70 - (stats.turns - 1) * 15, 10);
      const totalPoints = timePoints + turnPoints;
  
      addPoints(totalPoints);
  
      setOverlayContent(
        <WordleWinOverlay
          word={dailyWord}
          definition={definition}
          partOfSpeech={partOfSpeech}
          totalPoints={totalPoints}
          turns={stats.turns}
          timeElapsed={elapsed}
          onClose={() => setShowOverlay(false)}
        />
      );
      setShowOverlay(true);
  
      supabase.from('template_scores').insert({
        game: 'wordle',
        player_id: 'anon',
        player_name: 'Guest',
        score: totalPoints,
      });
  
      const prevTotal = getStoredInt('wordle_totalPoints');
      setStoredInt('wordle_totalPoints', prevTotal + totalPoints);
  
      const prevStreak = getStoredInt('wordle_streak');
      setStoredInt('wordle_streak', prevStreak + 1);
      setStreak(prevStreak + 1);
    } else {
      setStoredInt('wordle_streak', 0);
      setStreak(0);
    }
  
    setGuess('');
  };
 
const handleKeyPress = (key: string) => {
    if (!localStorage.getItem('wordle_started')) {
      localStorage.setItem('wordle_started', 'true');
      localStorage.setItem('wordle_startTime', String(Date.now()));
    }
  
    if (key === 'Enter') {
      // Only allow submission if the word is the correct length
      if (guess.length === WORD_LENGTH) {
        handleGuess();
      } else {
        setPopup(`Word must be ${WORD_LENGTH} letters long`);
      }
    } else if (key === 'Backspace') {
      setMessage('');
      setGuess((prev) => prev.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(key) && guess.length < WORD_LENGTH) {
      setMessage('');
      setGuess((prev) => prev + key.toLowerCase());
    }
  };

  const letterStates = buildLetterStates(guesses, dailyWord);

  return (
    <>
      <WordleThemeColor /> {/* ✅ Theme color component added */}
    <div className={styles.pageContainer}>
    <>
    {showOverlay && (
  <OverlayModal onClose={() => setShowOverlay(false)}>
    {overlayContent}
  </OverlayModal>
)}
  </>
      {/* Header - Fixed at top */}
      <div className={styles.header}>
        <div className={styles.left}>
        <GameTimer game="wordle" variant="minimal" paused={gameOver} autoStart={false} />
        </div>
        <div id="wordle-logo-container" className={styles.logoContainer}>
          <svg 
            id="wordle-logo"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 220.8 50"
            enableBackground="new 0 0 220.8 50"
            xmlSpace="preserve"
          >
            <style type="text/css">
              {`.logo-fill { fill: #4a4f54; }`}
            </style>
            <path className="logo-fill" d="M79.2,13.1c-9.3,0-16.9,7.9-16.9,17.8c0,9.8,7.6,17.8,16.9,17.8c9.3,0,16.9-7.9,16.9-17.8
            C96.1,21,88.6,13.1,79.2,13.1z M79.2,40c-4.8,0-8.7-4.1-8.7-9.2c0-5,3.9-9.2,8.7-9.2c4.8,0,8.7,4.1,8.7,9.2C87.9,35.9,84,40,79.2,40
            z"/>
            <path className="logo-fill" d="M158.5,28.7v3.8c0.1-0.6,0.1-1.2,0.1-1.9S158.5,29.4,158.5,28.7z"/>
            <path className="logo-fill" d="M150.4,1.4v14c-2.5-1.6-5.5-2.5-8.7-2.5c-9.3,0-16.9,7.9-16.9,17.8c0,9.8,7.6,17.8,16.9,17.8
              c3.2,0,6.2-0.9,8.7-2.5v2.5h8.1V1.4H150.4z M141.6,39.8c-4.8,0-8.7-4.1-8.7-9.2s3.9-9.2,8.7-9.2c4.8,0,8.7,4.1,8.7,9.2
              S146.5,39.8,141.6,39.8z"/>
            <rect x="165.2" y="1.4" className="logo-fill" width="8.1" height="46.9"/>
            <path className="logo-fill" d="M203.7,34.4c-1.4,3.2-4.4,5.3-7.9,5.3c-0.7,0-1.4-0.1-2-0.3l15.8-19l0,0l0.1-0.1c-3.1-4.6-8.1-7.6-13.8-7.6
              c-9.3,0-16.9,7.9-16.9,17.8c0,9.8,7.6,17.8,16.9,17.8c5.8,0,11-3.1,14-7.8L203.7,34.4z M187,30.6c0-5,3.9-9.2,8.7-9.2
              c0.8,0,1.5,0.1,2.2,0.3l-10.3,12.4C187.3,33.1,187,31.9,187,30.6z"/>
            <path className="logo-fill" d="M123.2,14.9v8.6h-8.6c-5.9,0-5.6,6-5.6,6v18.9h-8.5V29.5c0-15.4,14.1-14.6,14.1-14.6H123.2z"/>
            <rect x="100.5" y="29.5" className="logo-fill" width="0" height="18.9"/>
            <rect x="109" y="29.5" className="logo-fill" width="0" height="18.9"/>
            <path className="logo-fill" d="M70.5,2.6L44.1,48.3v0.1L36,48.2l0.5-29L21.1,45.9c-0.9,1.6-2.6,2.6-4.4,2.6h-5.1V1.6h8.1v30.7L34.3,6.8
              c1.6-2.7,4.5-4.4,7.6-4.3l3,0.1l-0.5,29L61.2,2.5L70.5,2.6z"/>
          </svg>
        </div>
        <div className={styles.right}>
        <div
  id="points-section"
  className={styles.right}
  onClick={() => {
    setOverlayContent(<WordleOverlayContent onClose={() => setShowOverlay(false)} />);
    setShowOverlay(true);
  }}  style={{ cursor: 'pointer' }}
>            <div id="points-icon-container">
              <svg
                id="points-icon"
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                viewBox="0 0 512 512"
              >
                <defs>
                  <style>
                    {`.st0 { fill: #f4f4f4; } .st1 { fill: #4a4f53; }`}
                  </style>
                </defs>
                <path className="st1" d="M255.1,27.6c-126.3,0-228.7,102.4-228.7,228.8s102.4,228.8,228.7,228.8,228.8-102.4,228.8-228.8S381.5,27.6,255.1,27.6ZM256,140.8c39.3,0,71.2,31.9,71.2,71.2s-31.9,71.2-71.2,71.2-71.2-31.9-71.2-71.2,31.9-71.2,71.2-71.2ZM259.9,440.3c-.7,0-1.4,0-2.1,0-.6,0-1.2,0-1.8,0-54,0-102.5-23.3-136.2-60.3,2.1-38.9,34.3-69.8,73.7-69.8h125.2c39.1,0,71,30.4,73.6,68.8,0,.3,0,.5,0,.8-32.8,36.2-79.9,59.3-132.4,60.4Z"/>
                <path className="st1" d="M184.8,212c0-39.3,31.9-71.2,71.2-71.2s71.2,31.9,71.2,71.2-31.9,71.2-71.2,71.2-71.2-31.9-71.2-71.2Z"/>
                <path className="st1" d="M392.3,379.9c-32.8,36.2-79.9,59.3-132.4,60.4-.7,0-1.4,0-2.1,0-.6,0-1.2,0-1.8,0-54,0-102.5-23.3-136.2-60.3,2.1-38.9,34.3-69.8,73.7-69.8h125.2c39.1,0,71,30.4,73.6,68.8,0,.3,0,.5,0,.8Z"/>
                <path className="st0" d="M327.2,212c0,39.3-31.9,71.2-71.2,71.2s-71.2-31.9-71.2-71.2,31.9-71.2,71.2-71.2,71.2,31.9,71.2,71.2Z"/>
                <path className="st0" d="M392.3,379.9c-32.8,36.2-79.9,59.3-132.4,60.4-.7,0-1.4,0-2.1,0-.6,0-1.2,0-1.8,0-54,0-102.5-23.3-136.2-60.3,2.1-38.9,34.3-69.8,73.7-69.8h125.2c39.1,0,71,30.4,73.6,68.8,0,.3,0,.5,0,.8Z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content area - for vertical centering */}
      <div className={styles.mainContent}>
          <div className={styles.boardWrapper}>
            <WordleGameBoard
              guesses={guesses}
              currentGuess={guess}
              wordLength={WORD_LENGTH}
              targetWord={dailyWord}
            />
          </div>
        </div>
      
      {/* Keyboard - Fixed at bottom */}
      <div className={styles.keyboardWrapper}>
      <WordleKeyboard onKeyPress={handleKeyPress} letterStates={letterStates} disabled={gameOver} />
      </div>
      
      {/* Hidden container for other UI elements */}
      
  
      {popup && <Popup message={popup} onClose={() => setPopup('')} />}
    </div>
    </>
  );
}