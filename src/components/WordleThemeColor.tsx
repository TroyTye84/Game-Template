// components/WordleThemeColor.tsx
'use client';

import { useEffect } from "react";

export default function WordleThemeColor() {
  useEffect(() => {
    // Set Wordle's green color as theme color
    const wordleThemeColor = "#f4f4f4";
    
    // Update meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', wordleThemeColor);
    }
    
    // Restore original theme color when component unmounts
    return () => {
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', "#1d1d1f");
      }
    };
  }, []);
  
  return null; // This component doesn't render anything
}