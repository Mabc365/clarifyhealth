import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TRIAGE_SYSTEM_PROMPT = `You are a medical triage assistant at Clarify Health. A patient has described their symptoms or situation. Your job is to identify what ONE type of doctor or specialist they most likely need.

Return a JSON object only, no explanation. Rules:
- "specialty" MUST be a SINGLE clean specialty name with NO slashes, NO "or", NO parentheses. Examples: "Cardiologist", "Primary Care Physician", "Endocrinologist", "Psychiatrist", "Dermatologist", "Emergency Medicine".
- For life-threatening situations (chest pain + shortness of breath, stroke symptoms, severe bleeding, suicidal thoughts, anaphylaxis), set urgency to "urgent" and specialty to "Emergency Medicine".
- "search_query" should be a short 2-4 word phrase optimized for directory search, e.g. "cardiologist", "primary care doctor", "endocrinologist".

{
  "specialty": "<single specialty>",
  "search_query": "<short search phrase>",
  "reason": "<one plain-English sentence explaining why this specialty>",
  "urgency": "<routine | soon | urgent>",
  "urgency_note": "<one sentence on timing>"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms, zipCode } = await req.json();

    if (!symptoms || typeof symptoms !== "string" || symptoms.trim().length < 3) {
      return new Response(JSON.stringify({ error: "Please describe your symptoms" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Step 1: AI triage — determine specialty + urgency
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: TRIAGE_SYSTEM_PROMPT },
          { role: "user", content: symptoms.trim().slice(0, 500) },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content ?? "";

    let triage: {
      specialty: string;
      search_query: string;
      reason: string;
      urgency: string;
      urgency_note: string;
    };
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      triage = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
    } catch {
      triage = {
        specialty: "Primary Care",
        search_query: "primary care doctor",
        reason: "A primary care doctor can evaluate your symptoms and refer you to a specialist if needed.",
        urgency: "routine",
        urgency_note: "Schedule an appointment at your convenience.",
      };
    }

    // Sanitize specialty: strip slashes, parens, "or" — Healthgrades/Zocdoc choke on compound terms
    const cleanSpecialty = (triage.specialty || "Primary Care")
      .split(/[\/\(]| or /i)[0]
      .trim()
      .slice(0, 60) || "Primary Care";
    const searchQuery = (triage.search_query || cleanSpecialty).trim().slice(0, 60);

    // Step 2: Build curated search links to trusted directories (no Google Places API needed)
    const safeZip = zipCode ? zipCode.trim().slice(0, 5) : "";
    const locationSuffix = safeZip ? ` near ${safeZip}` : "";
    const queryText = `${searchQuery}${locationSuffix}`;
    const enc = encodeURIComponent;

    const searchLinks = [
      {
        name: "Healthgrades",
        description: "Browse doctors with detailed patient reviews, credentials, and ratings.",
        url: safeZip
          ? `https://www.healthgrades.com/usearch?what=${enc(cleanSpecialty)}&where=${enc(safeZip)}`
          : `https://www.healthgrades.com/usearch?what=${enc(cleanSpecialty)}`,
      },
      {
        name: "Zocdoc",
        description: "Book in-person or video appointments online and filter by insurance.",
        url: safeZip
          ? `https://www.zocdoc.com/search?address=${enc(safeZip)}&search_query=${enc(searchQuery)}`
          : `https://www.zocdoc.com/search?search_query=${enc(searchQuery)}`,
      },
      {
        name: "Google Maps",
        description: "See nearby offices with hours, phone numbers, and directions.",
        url: `https://www.google.com/maps/search/${enc(queryText)}`,
      },
      {
        name: "Vitals",
        description: "Compare doctors by experience, education, and patient ratings.",
        url: safeZip
          ? `https://www.vitals.com/search?type=Specialty&query=${enc(cleanSpecialty)}&geo=${enc(safeZip)}`
          : `https://www.vitals.com/search?type=Specialty&query=${enc(cleanSpecialty)}`,
      },
    ];

    return new Response(
      JSON.stringify({
        specialty: cleanSpecialty,
        reason: triage.reason,
        urgency: triage.urgency,
        urgency_note: triage.urgency_note,
        doctors: [],
        searchLinks,
        zipCode: safeZip,
        fallback: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("find-doctor error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
