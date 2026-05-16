import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SPECIALTY_TAXONOMY: Record<string, string> = {
  "primary-care": "Family Medicine",
  "cardiology": "Cardiovascular Disease",
  "dermatology": "Dermatology",
  "ob-gyn": "Obstetrics & Gynecology",
  "pediatrics": "Pediatrics",
  "mental-health": "Psychiatry",
  "orthopedics": "Orthopaedic Surgery",
  "ent": "Otolaryngology",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const p = url.searchParams;
    const specialty = (p.get("specialty") || "").toLowerCase();
    const location = (p.get("location") || "").trim();
    const name = (p.get("name") || "").trim();
    const limit = Math.min(parseInt(p.get("limit") || "10"), 200);
    const skip = Math.max(parseInt(p.get("skip") || "0"), 0);

    const npi = new URL("https://npiregistry.cms.hhs.gov/api/");
    npi.searchParams.set("version", "2.1");
    npi.searchParams.set("limit", String(limit));
    npi.searchParams.set("skip", String(skip));
    npi.searchParams.set("enumeration_type", "NPI-1");

    const taxonomy = SPECIALTY_TAXONOMY[specialty];
    if (taxonomy) npi.searchParams.set("taxonomy_description", taxonomy);

    if (name) {
      const parts = name.split(/\s+/);
      if (parts.length === 1) npi.searchParams.set("last_name", `${parts[0]}*`);
      else {
        npi.searchParams.set("first_name", `${parts[0]}*`);
        npi.searchParams.set("last_name", `${parts.slice(1).join(" ")}*`);
      }
    }

    if (location) {
      if (/^\d{5}$/.test(location)) {
        npi.searchParams.set("postal_code", location);
      } else if (/^[A-Z]{2}$/i.test(location)) {
        npi.searchParams.set("state", location.toUpperCase());
      } else if (location.includes(",")) {
        const [city, state] = location.split(",").map((s) => s.trim());
        if (city) npi.searchParams.set("city", city);
        if (state) npi.searchParams.set("state", state.toUpperCase().slice(0, 2));
      } else {
        npi.searchParams.set("city", location);
      }
    }

    if (!taxonomy && !name && !location) {
      return new Response(
        JSON.stringify({ results: [], total: 0, error: "Provide a specialty, name, or location." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const res = await fetch(npi.toString(), {
      headers: { Accept: "application/json", "User-Agent": "ClarifyHealth/1.0" },
    });

    if (!res.ok) {
      console.error("NPI registry error", res.status, await res.text());
      return new Response(
        JSON.stringify({ error: "Provider registry unavailable. Try again shortly." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    const cap = (s: string) =>
      (s || "").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

    const results = (data.results || []).map((r: any) => {
      const basic = r.basic || {};
      const taxonomies = (r.taxonomies || []).map((t: any) => ({
        code: t.code, desc: t.desc, primary: !!t.primary, state: t.state, license: t.license,
      }));
      const primaryTax = taxonomies.find((t: any) => t.primary) || taxonomies[0];

      const addresses = (r.addresses || []).map((a: any) => ({
        purpose: a.address_purpose,
        line1: cap(a.address_1 || ""),
        line2: cap(a.address_2 || ""),
        city: cap(a.city || ""),
        state: (a.state || "").toUpperCase(),
        postal: (a.postal_code || "").slice(0, 5),
        country: a.country_code,
        phone: a.telephone_number || null,
        fax: a.fax_number || null,
      }));
      const practice = addresses.find((a: any) => a.purpose === "LOCATION") || addresses[0] || null;

      const credential = (basic.credential || "").replace(/\./g, "").trim();
      const fullName = [
        basic.first_name && cap(basic.first_name),
        basic.middle_name && cap(basic.middle_name),
        basic.last_name && cap(basic.last_name),
      ].filter(Boolean).join(" ");

      return {
        npi: r.number,
        name: fullName,
        credential,
        displayName: credential ? `Dr. ${fullName}, ${credential}` : `Dr. ${fullName}`,
        gender: basic.gender || null,
        specialty: primaryTax?.desc || null,
        taxonomies,
        practice,
        addresses,
        phone: practice?.phone || null,
        lastUpdated: basic.last_updated || basic.enumeration_date || null,
        enumerationDate: basic.enumeration_date || null,
      };
    });

    return new Response(
      JSON.stringify({ results, total: data.result_count ?? results.length, limit, skip }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("npi-search error:", e);
    return new Response(
      JSON.stringify({ error: "Search failed. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
