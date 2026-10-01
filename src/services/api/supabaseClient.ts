import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dibavhrxmgxowukalzrd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GcoDSstzJD_kuG5GEVCifw__AXdGjPj';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Invokes a Supabase Edge Function with local fallback support.
 * First tries cloud Supabase Edge Functions; if unreachable or times out,
 * falls back to the local development Edge Function endpoint.
 */
export async function invokeEdgeFunction<T = any>(
  functionName: string,
  body: any
): Promise<T> {
  const timeoutMs = 8000;

  // 1. Try local runner first (or cloud Supabase)
  try {
    const localRes = await fetch(`/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (localRes.ok) {
      const data = await localRes.json();
      return data;
    }
  } catch {
    // If local runner not available, proceed to Supabase Cloud
  }

  // 2. Try Supabase Cloud Edge Function with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
    });

    clearTimeout(timeoutId);

    if (error) {
      throw error;
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`Supabase Cloud function ${functionName} invocation error/timeout:`, err.message);
    throw err;
  }
}
