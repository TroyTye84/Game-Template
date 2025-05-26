import { supabase } from '@/lib/supabase';

export async function fetchWinners(tab: 'daily' | 'weekly' | 'alltime') {
  const now = new Date();
  let fromDate: string | null = null;

  if (tab === 'daily') {
    now.setHours(0, 0, 0, 0);
    fromDate = now.toISOString();
  } else if (tab === 'weekly') {
    now.setDate(now.getDate() - 7);
    fromDate = now.toISOString();
  }

  let query = supabase.from('scores').select('*').order('score', { ascending: false }).limit(10);
  if (fromDate) query = query.gte('created_at', fromDate);

  const { data, error } = await query;
  if (error) {
    console.error(`❌ Error fetching ${tab} winners:`, error);
    return [];
  }

  return data || [];
}
