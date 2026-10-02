import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "./cors.ts";

// Requires a signed-in user and consumes one monthly AI use.
// Verifies logins and usage against the self-hosted Supabase when
// EXTERNAL_SUPABASE_URL / EXTERNAL_SUPABASE_SERVICE_ROLE_KEY are set,
// otherwise falls back to this project's own backend.
export async function requireAiUse(req: Request, feature: string): Promise<Response | null> {
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "LOGIN_REQUIRED" }, 401);
  const url = Deno.env.get("EXTERNAL_SUPABASE_URL") || Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, key, { auth: { persistSession: false } });
  const { data: u, error } = await admin.auth.getUser(token);
  if (error || !u?.user) return json({ error: "LOGIN_REQUIRED" }, 401);
  const { data, error: rpcErr } = await admin.rpc("consume_ai_use", { _user_id: u.user.id, _feature: feature });
  if (rpcErr) { console.error("consume_ai_use", rpcErr); return json({ error: "Server error" }, 500); }
  if (!data?.allowed) return json({ error: "LIMIT_REACHED", ...data }, 403);
  return null;
}
