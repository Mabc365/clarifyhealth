import { requireAiUse } from "../_shared/gate.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANG_NAMES: Record<string, string> = {
  en: "English", es: "Spanish", ur: "Urdu", hi: "Hindi", ar: "Arabic",
};

const SYSTEM_PROMPT = `You are a certified wellness coach and health educator for Clarify Health. You create personalized, evidence-based wellness plans.

RULES:
- Write at an 8th-grade reading level
- Never diagnose or prescribe medications
- Never contradict existing medical treatments
- Be culturally sensitive to dietary and spiritual preferences
- Cite real sources (NIH, Mayo Clinic, Harvard Health, PubMed, WHO)
- Be practical and actionable — focus on small, achievable steps

RESPOND WITH VALID JSON ONLY matching this structure:
{
  "nutrition": {
    "summary": "2-3 sentence overview",
    "recommendations": ["list of 4-6 specific food/diet tips"],
    "sources": ["source name — URL"]
  },
  "exercise": {
    "summary": "2-3 sentence overview",
    "recommendations": ["list of 3-5 exercise suggestions with frequency"],
    "sources": ["source name — URL"]
  },
  "stressSleep": {
    "summary": "2-3 sentence overview",
    "recommendations": ["list of 3-5 stress/sleep tips"],
    "sources": ["source name — URL"]
  },
  "supplements": {
    "applicable": true/false,
    "summary": "2-3 sentences or empty if not applicable",
    "recommendations": ["list if applicable"],
    "disclaimer": "Always consult your doctor before starting any supplement.",
    "sources": ["source name — URL"]
  },
  "mindfulness": {
    "applicable": true/false,
    "summary": "2-3 sentences based on user preferences",
    "recommendations": ["list if applicable"],
    "sources": ["source name — URL"]
  }
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  { const blocked = await requireAiUse(req, "wellness-plan"); if (blocked) return blocked; }

  try {
    const { preferences, language } = await req.json();

    if (!preferences || typeof preferences !== "object") {
      return new Response(JSON.stringify({ error: "Preferences required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const safeLang = LANG_NAMES[language] || "English";

    const userPrompt = `Create a personalized wellness plan for this person. Respond in ${safeLang}.

Profile:
- Age range: ${preferences.ageRange || "not specified"}
- Health goals: ${(preferences.healthGoals || []).join(", ") || "general wellness"}
- Diagnosed conditions: ${preferences.conditions || "none specified"}
- Diet preferences: ${(preferences.dietPreferences || []).join(", ") || "no restrictions"}
- Activity level: ${preferences.activityLevel || "not specified"}
- Physical limitations: ${preferences.limitations || "none"}
- Openness to holistic approaches: ${(preferences.holisticPreferences || []).join(", ") || "no preference"}

Important: Respect all dietary and spiritual preferences. If they selected Halal, Kosher, Ayurveda, Islamic medicine, etc., incorporate those respectfully. Only suggest supplements/mindfulness if relevant to their selections.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
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
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, t);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content ?? "";

    let plan;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      plan = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
    } catch {
      return new Response(JSON.stringify({ error: "Failed to parse wellness plan. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("wellness-plan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
