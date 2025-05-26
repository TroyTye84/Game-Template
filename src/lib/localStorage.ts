// ✅ Get an integer from localStorage
export const getStoredInt = (key: string, defaultValue = 0): number => {
    if (typeof window === 'undefined') return defaultValue;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : defaultValue;
  };
  
  // ✅ Set an integer in localStorage
  export const setStoredInt = (key: string, value: number) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, String(value));
  };
  
  // ✅ Increment an integer value in localStorage
  export const incrementStoredInt = (key: string, increment = 1) => {
    const current = getStoredInt(key);
    setStoredInt(key, current + increment);
  };
  
  // ✅ Get a string array from localStorage
  export const getStoredArray = (key: string): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error(`❌ Failed to parse array for key "${key}"`, err);
      return [];
    }
  };
  
  // ✅ Set a string array in localStorage
  export const setStoredArray = (key: string, value: string[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  };
