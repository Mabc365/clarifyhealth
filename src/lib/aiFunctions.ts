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

// Staging opt-in: VITE_AI_BACKEND=vercel routes to same-origin /api/ai/{name}.
// Default (unset) keeps every call on Lovable. transcribe-audio is limited by
// Vercel's 4.5 MB body cap, so it only moves when listed in
// VITE_AI_VERCEL_EXTRA (comma-separated).
const VERCEL_DEFAULT = new Set(['ask', 'jargon-translate', 'symptom-explain', 'wellness-plan', 'tts-speak', 'eli5-rewrite', 'analyze-visit']);
const VERCEL_EXTRA = new Set(
  String(import.meta.env.VITE_AI_VERCEL_EXTRA ?? '').split(',').map((s) => s.trim()).filter(Boolean),
);

function endpointFor(name: string): { url: string; vercel: boolean } {
  if (import.meta.env.VITE_AI_BACKEND === 'vercel' && (VERCEL_DEFAULT.has(name) || VERCEL_EXTRA.has(name))) {
    return { url: `/api/ai/${encodeURIComponent(name)}`, vercel: true };
  }
  return { url: `${AI_FUNCTIONS_URL}/${name}`, vercel: false };
}

export type AiInvokeError = { message: string; status?: number };

/**
 * Mirrors supabase.functions.invoke()'s { data, error } shape. Targets the
 * Lovable-hosted AI functions by default, or the Vercel staging endpoint when
 * opted in, and attaches the user's (self-hosted) access token for the gate check.
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
  const { url, vercel } = endpointFor(name);

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(vercel ? {} : { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    return { data: null, error: { message: 'Network error. Please try again.' } };
  }

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
