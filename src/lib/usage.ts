import { supabase } from './supabase';

export const DAILY_LIMIT = 5;

export async function checkDailyUsage(userId: string): Promise<{ count: number; allowed: boolean }> {
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);

  try {
    const { count, error } = await supabase
      .from('user_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', yesterday.toISOString());

    if (error) throw error;

    const currentCount = count || 0;
    return {
      count: currentCount,
      allowed: currentCount < DAILY_LIMIT
    };
  } catch (err) {
    console.error('Error checking usage:', err);
    // On error, let them pass but log it
    return { count: 0, allowed: true };
  }
}

export async function logOperation(userId: string, actionType: string, fileName: string, fileSize: number | string, status: 'success' | 'failed') {
  try {
    const { error } = await supabase.from('user_history').insert([{
      user_id: userId,
      action_type: actionType,
      file_name: fileName,
      file_size: fileSize,
      result_status: status
    }]);

    if (error) throw error;
  } catch (err) {
    console.error('Error logging operation:', err);
  }
}
