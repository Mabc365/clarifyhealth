// Shared Lovable AI Gateway helper for non-streaming JSON responses.
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export async function aiChat(opts: {
  system: string;
  user: string;
  model?: string;
  json?: boolean;
}): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY is not set");
  const body: Record<string, unknown> = {
    model: opts.model ?? "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
  };
  if (opts.json) body.response_format = { type: "json_object" };
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 402) throw new Error("CREDITS");
    throw new Error(`AI gateway ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}