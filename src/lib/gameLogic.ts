import { getStoredInt, setStoredInt } from './localStorage';

type GameState = {
  startTime: number | null;
  turns: number;
  points: number;
};

const state: GameState = {
  startTime: null,
  turns: 0,
  points: 0,
};

export const startGame = () => {
  state.startTime = Date.now();
  state.turns = 0;
  state.points = 0;

  // ✅ Reset current game points in localStorage
  setStoredInt('wordle_currentPoints', 0);
  console.log('🕹️ Game started, points reset to 0');
};

export const addTurn = () => {
  state.turns++;
};

export const addPoints = (amount: number) => {
  state.points += amount;

  const key = 'wordle_currentPoints';
  const prev = getStoredInt(key, 0);
  const newTotal = prev + amount;
  setStoredInt(key, newTotal);

  console.log(`➕ Added ${amount} points. Current total this round: ${newTotal}`);
};

export const getElapsedTime = () => {
  if (!state.startTime) return 0;
  return Math.floor((Date.now() - state.startTime) / 1000);
};

export const getGameStats = () => ({
  ...state,
  timeElapsed: getElapsedTime(),
});

export const resetGame = () => {
  state.startTime = null;
  state.turns = 0;
  state.points = 0;
  console.log('🔄 Game state reset');
};
export const getStoredBool = (key: string, defaultValue = false): boolean => {
    if (typeof window === 'undefined') return defaultValue;
    const stored = localStorage.getItem(key);
    return stored ? stored === 'true' : defaultValue;
  };
  
  export const setStoredBool = (key: string, value: boolean) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, String(value));
  };
  