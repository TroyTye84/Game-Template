'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'alltime' | 'mystats'>('daily');
  const [currentGame, setCurrentGame] = useState<'template' | 'wordle' | 'memory'>('template');
  
  // Labels for time filter cycle button
  const timeFilterLabels = {
    daily: 'Daily',
    weekly: 'Weekly',
    alltime: 'All-time',
    mystats: 'My Stats'
  };
  
  // Game display data
  const games = {
    template: { name: 'Template Game', icon: '🧩', path: '/template' },
    wordle: { name: 'Wordle', icon: '🔤', path: '/wordle' },
    memory: { name: 'Memory Match', icon: '🧠', path: '/memory' }
  };
  
  // Cycle to next time filter
  const cycleTimeFilter = () => {
    if (timeFilter === 'daily') setTimeFilter('weekly');
    else if (timeFilter === 'weekly') setTimeFilter('alltime');
    else if (timeFilter === 'alltime') setTimeFilter('mystats');
    else setTimeFilter('daily');
  };
  
  // Cycle to next game
  const cycleGame = () => {
    if (currentGame === 'template') setCurrentGame('wordle');
    else if (currentGame === 'wordle') setCurrentGame('memory');
    else setCurrentGame('template');
  };

  useEffect(() => {
    // Fetch data based on current time filter and game selection
    const fetchLeaderboardData = async () => {
      let query = supabase
        .from(`${currentGame}_scores`)
        .select('*')
        .order('score', { ascending: false });
      
      // Apply filtering based on selected time period
      if (timeFilter === 'daily') {
        // For daily, get scores from the last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        query = query.gte('created_at', yesterday.toISOString());
      } else if (timeFilter === 'weekly') {
        // For weekly, get scores from the last 7 days
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        query = query.gte('created_at', lastWeek.toISOString());
      } else if (timeFilter === 'mystats') {
        // For my stats, filter by current user ID
        query = query.eq('player_id', 'current-user-id'); // Replace with actual user ID
      }
      // For all-time, no additional filter needed
      
      const { data, error } = await query;
      if (error) console.error('❌ Supabase error:', error);
      else setData(data ?? []);
    };

    fetchLeaderboardData();
  }, [timeFilter, currentGame]);

  return (
    <div className="flex flex-col h-[100vh] font-[family-name:var(--font-geist-sans)]">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 px-4 pt-4 pb-3 border-b shadow-sm">
        <h2 className="text-sm font-semibold text-center text-gray-600 mb-3">🏆 Leaderboard</h2>
        
        <div className="flex items-center justify-between">
          <button 
            onClick={cycleGame}
            className="flex items-center"
          >
            <span className="text-xl mr-2">{games[currentGame].icon}</span>
            <h1 className="text-xl font-bold">{games[currentGame].name}</h1>
          </button>
          
          <button 
            onClick={cycleTimeFilter}
            className="px-4 py-1 text-sm font-medium rounded-full bg-blue-600 text-white"
          >
            {timeFilterLabels[timeFilter]}
          </button>
        </div>
      </div>
      
      {/* Main Content Container with Padding for Fixed Elements */}
      <main className="flex flex-col h-full">
        {/* Invisible Spacer for Header */}
        <div className="h-24"></div>
        
        {/* Scrollable Leaderboard */}
        <div className="flex-grow overflow-y-auto px-4 pb-36">
          <ul className="text-sm w-full max-w-md mx-auto">
            {data.length > 0 ? (
              data.map((item, i) => (
                <li key={i} className="flex justify-between border-b py-2">
                  <span>{item.player_name}{timeFilter === 'mystats' ? ' (You)' : ''}</span>
                  <span>{item.score}</span>
                </li>
              ))
            ) : (
              <li className="text-center py-4 text-gray-500">
                {timeFilter === 'mystats' 
                  ? 'No personal scores found for this game' 
                  : 'No scores found for this time period'}
              </li>
            )}
          </ul>
        </div>
      </main>
      
      {/* Fixed Bottom Navigation - Three Squares Horizontal */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t pt-2 pb-4 px-4 z-10">
        <div className="grid grid-cols-3 gap-4 w-full max-w-md mx-auto">
          <Link
            href={games.template.path}
            className={`flex flex-col items-center justify-center aspect-square bg-white border ${
              currentGame === 'template' ? 'border-blue-500 shadow-blue-100 shadow-md' : 'border-gray-200 shadow'
            } rounded-xl hover:shadow-md transition`}
          >
            <span className="text-3xl mb-1">{games.template.icon}</span>
            <span className="text-xs font-semibold">{games.template.name}</span>
          </Link>

          <Link
            href={games.wordle.path}
            className={`flex flex-col items-center justify-center aspect-square bg-white border ${
              currentGame === 'wordle' ? 'border-blue-500 shadow-blue-100 shadow-md' : 'border-gray-200 shadow'
            } rounded-xl hover:shadow-md transition`}
          >
            <span className="text-3xl mb-1">{games.wordle.icon}</span>
            <span className="text-xs font-semibold">{games.wordle.name}</span>
          </Link>

          <Link
            href={games.memory.path}
            className={`flex flex-col items-center justify-center aspect-square bg-white border ${
              currentGame === 'memory' ? 'border-blue-500 shadow-blue-100 shadow-md' : 'border-gray-200 shadow'
            } rounded-xl hover:shadow-md transition`}
          >
            <span className="text-3xl mb-1">{games.memory.icon}</span>
            <span className="text-xs font-semibold">{games.memory.name}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}