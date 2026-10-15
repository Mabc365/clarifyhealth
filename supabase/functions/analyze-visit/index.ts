import { requireAiUse } from "../_shared/gate.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANG_NAMES: Record<string, string> = {
  en: "English", es: "Spanish", ur: "Urdu", hi: "Hindi", ar: "Arabic",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  { const blocked = await requireAiUse(req, "analyze-visit"); if (blocked) return blocked; }
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: u } = await sb.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!u?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { text, language } = await req.json();
    if (!text || typeof text !== "string" || text.length > 20000) {
      return new Response(JSON.stringify({ error: "text is required (max 20000 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const safeLang = ["en", "es", "ur", "hi", "ar"].includes(language) ? language : "en";
    const langName = LANG_NAMES[safeLang];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a medical analysis assistant at Clarify Health. The user gives you raw doctor visit notes or a transcript. Extract a structured plain-English breakdown.

Respond ONLY with a single JSON object (no prose, no code fences) in this exact shape, written in ${langName}:

{
  "summary": "Markdown-formatted patient explanation with **What your doctor found**, **What this means for your daily life**, and **What happens next** headings. Add **Questions to bring to your doctor** when helpful.",
  "structured": {
    "diagnosis": "string or empty",
    "medications": [ { "name": "", "dose": "", "frequency": "", "purpose": "" } ],
    "tests_ordered": [ "" ],
    "follow_ups": [ { "what": "", "when": "" } ],
    "red_flags": [ "" ]
  },
  "follow_up_questions": [ "Question 1", "Question 2", "Question 3" ],
  "key_terms": [ { "term": "", "definition": "plain-English" } ]
}

Write the summary TO the patient using "you" and "your", not "the patient" or third-person charting language. Use natural, reassuring but medically precise 8th-grade English. Under each Markdown heading, write 1-2 short paragraphs or helpful - bullets. Explain the diagnosis and medical jargon in plain language, what the findings mean in everyday life, and the actual next steps; keep it informative but not excessively long (usually 140-250 words). Only describe effects or prognosis supported by the source; do not call a condition harmless or promise outcomes without justification. Always produce three specific, patient-friendly questions in follow_up_questions when clinically meaningful source information is present. Questions must not be omitted. Do not repeat the questions inside the summary; the frontend renders them separately. Do not fabricate references or URLs.
The summary MUST contain all three Markdown headings **What your doctor found**, **What this means for your daily life**, and **What happens next** on their own lines. Do not produce a chart-style third-person overview. Never omit source-documented major treatments or follow-up dates. Do not change, round, or guess lab measurements, units, medications, or timings. Distinguish a proposed prescription from one already prescribed, and a follow-up recommendation from an actual scheduled appointment. Include only explicitly ordered tests in tests_ordered; put suggested evaluations in follow_ups. red_flags should be warning symptoms or changes to seek care for, NOT existing abnormal lab results; do not invent symptoms or red flags. Preserve the JSON structure and existing sections exactly. Never invent details. Return [] or "" for anything you cannot fill. Output must be valid JSON.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch {
      throw new Error("AI returned invalid JSON");
    }
    if (!parsed || typeof parsed.summary !== "string" ||
      !["What your doctor found", "What this means for your daily life", "What happens next"].every(h => parsed.summary.includes(h)) ||
      !Array.isArray(parsed.follow_up_questions) || parsed.follow_up_questions.length < 2 ||
      !parsed.structured || typeof parsed.structured !== "object") {
      console.error("AI analysis missing mandatory patient-friendly sections");
      return new Response(JSON.stringify({ error: "Analysis was incomplete. Please retry." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-visit error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});