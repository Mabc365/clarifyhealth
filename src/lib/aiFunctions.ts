// AI edge functions stay hosted on Lovable Cloud (they use Lovable's AI key).
// Everything else (auth, DB, storage, non-AI functions) runs on the self-hosted
// Supabase client in src/lib/supabase.ts.
//
// These functions verify the caller's JWT and monthly AI usage against the
// self-hosted project via EXTERNAL_SUPABASE_URL on the Lovable side.
import { supabase } from '@/lib/supabase';

const AI_FUNCTIONS_URL = 'https://dojcuaoydegwqrzldtmp.supabase.co/functions/v1';

const AI_FUNCTIONS = new Set([
  'ask',
  'jargon-translate',
  'symptom-explain',
  'wellness-plan',
  'tts-speak',
  'eli5-rewrite',
  'transcribe-audio',
  'analyze-visit',
]);

export type AiInvokeError = { message: string; status?: number };

/**
 * Mirrors supabase.functions.invoke()'s { data, error } shape, but always
 * targets the Lovable-hosted AI functions and attaches the user's
 * (self-hosted) access token for the gate check.
 */
export async function aiInvoke<T = any>(
  name: string,
  { body, headers }: { body?: any; headers?: Record<string, string> } = {},
): Promise<{ data: T | null; error: AiInvokeError | null }> {
  if (!AI_FUNCTIONS.has(name)) {
    return { data: null, error: { message: `${name} is not an AI function` } };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const res = await fetch(`${AI_FUNCTIONS_URL}/${name}`, {
    method: 'POST',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') ?? '';
  if (!res.ok) {
    let message = `Function error: ${res.status}`;
    try {
      const errBody = contentType.includes('application/json') ? await res.json() : await res.text();
      message =
        typeof errBody === 'string' && errBody
          ? errBody
          : errBody?.error ?? errBody?.message ?? message;
    } catch {
      // keep default message
    }
    return { data: null, error: { message, status: res.status } };
  }

  let data: T;
  if (contentType.includes('application/json')) {
    data = (await res.json()) as T;
  } else {
    data = (await res.blob()) as unknown as T;
  }
  return { data, error: null };
}
