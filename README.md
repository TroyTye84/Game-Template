# Game-Template

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

---

## 🚀 Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
Then open http://localhost:3000 in your browser.

You can start editing the page by modifying app/page.tsx. The page auto-updates as you edit the file.

This project uses next/font to automatically optimize and load Geist, a modern font family by Vercel.

🏆 Leaderboard Feature
This app includes a dynamic leaderboard that displays top player scores across:

daily: scores from today

weekly: scores from the last 7 days

alltime: highest scores ever

stats: (coming soon) user-specific statistics

📄 LeaderboardView.tsx
This React component renders the leaderboard view dynamically based on the mode passed:

tsx
Copy
Edit
<LeaderboardView mode="daily" />
Key features:
Fetches top scores using fetchWinners() from useLeaderboard.ts

Uses useEffect to trigger fetching on mode change

Displays rank, username, score, turns, and time

📡 useLeaderboard.ts
This module handles fetching leaderboard data from Supabase.

ts
Copy
Edit
supabase
  .from('scores')
  .select('*')
  .gte('created_at', fromDate) // filters if needed
  .order('score', { ascending: false })
  .limit(10);
daily: filters from start of today

weekly: filters from last 7 days

alltime: no filter

Returns an array of winner objects or empty array on error.

🔢 Turns Counter
📄 TurnsCounter.tsx
A live component that displays and updates the number of turns taken for a specific game (like Wordle, Sudoku, etc.).

✅ Example:
tsx
Copy
Edit
<TurnsCounter game="wordle" />
🔍 Features:
Retrieves current turn count from localStorage using a key like wordle_turns

Updates every 500ms using setInterval

Cleans up the interval on unmount

📦 Non-JSX Usage (e.g. HTML injection or framework adapters)
If you can’t use JSX, you can still use the component in React-compatible frameworks like so:

ts
Copy
Edit
import { createElement } from 'react';
import TurnsCounter from '@/components/TurnsCounter';

const node = createElement(TurnsCounter, { game: 'wordle' });
// Then render `node` into a container using your render engine
Make sure you also have logic in your app setting the value in localStorage using your own turn logic:

ts
Copy
Edit
localStorage.setItem('wordle_turns', '3');
Or via your utility:

ts
Copy
Edit
setStoredInt('wordle_turns', 3);