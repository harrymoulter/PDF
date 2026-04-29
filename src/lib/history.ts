import { supabase } from './supabase';

export async function trackAction(
  userId: string | undefined, 
  actionType: string, 
  fileName: string, 
  fileSize: string | number, 
  status: 'uploaded' | 'processed' | 'locked' | 'completed' | 'failed'
) {
  try {
    const { error } = await supabase
      .from('user_history')
      .insert([
        {
          user_id: userId || null,
          action_type: actionType,
          file_name: fileName,
          file_size: fileSize.toString(),
          result_status: status,
        }
      ]);

    if (error) {
      console.error('Error tracking action:', error.message);
    }
  } catch (err) {
    console.error('Unexpected error tracking action:', err);
  }
}

export async function trackAuthEvent(
  userId: string,
  eventType: 'login' | 'signup'
) {
  try {
    const { error } = await supabase
      .from('user_history')
      .insert([
        {
          user_id: userId,
          action_type: 'auth',
          file_name: eventType,
          file_size: '0',
          result_status: 'completed',
        }
      ]);

    if (error) {
      console.error('Error tracking auth event:', error.message);
    }
  } catch (err) {
    console.error('Unexpected error tracking auth event:', err);
  }
}
