import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

interface SendBody {
  to?: string | string[];
  subject?: string;
  html?: string;
  text?: string;
  from?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Require authenticated user; force `to` to that user's email to prevent open-relay abuse
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);
  const authClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );
  const { data: userData, error: userErr } = await authClient.auth.getUser(authHeader.replace('Bearer ', ''));
  if (userErr || !userData?.user?.email) return json({ error: 'Unauthorized' }, 401);

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!LOVABLE_API_KEY) return json({ error: 'LOVABLE_API_KEY not configured' }, 500);
  if (!RESEND_API_KEY) return json({ error: 'RESEND_API_KEY not configured' }, 500);

  let body: SendBody;
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  // Always send to the authenticated user's own email — ignore client-supplied recipients
  const to = userData.user.email;
  const subject = body.subject ?? 'Hello World';
  const html = body.html ?? '<p>Congrats on sending your <strong>first email</strong>!</p>';
  const from = body.from ?? 'Clarify Health <onboarding@resend.dev>';

  if (!subject || (!html && !body.text)) return json({ error: 'subject and html/text required' }, 400);

  const resp = await fetch(`${GATEWAY_URL}/emails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': RESEND_API_KEY,
    },
    body: JSON.stringify({ from, to: [to], subject, html, text: body.text }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    console.error('Resend error', resp.status, data);
    return json({ error: 'Send failed', status: resp.status, details: data }, resp.status);
  }
  return json({ success: true, ...data }, 200);
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
