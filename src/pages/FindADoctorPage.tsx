import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageMeta from "@/components/PageMeta";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, LocateFixed, Phone, MapPin, X as XIcon } from "lucide-react";

const SPECIALTIES = [
  { value: "", label: "All specialties" },
  { value: "primary-care", label: "Primary Care" },
  { value: "cardiology", label: "Cardiology" },
  { value: "dermatology", label: "Dermatology" },
  { value: "ob-gyn", label: "OB-GYN" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "mental-health", label: "Mental Health" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "ent", label: "ENT" },
];

interface Address {
  purpose: string; line1: string; line2: string; city: string;
  state: string; postal: string; phone: string | null; fax: string | null;
}
interface Doctor {
  npi: string; name: string; credential: string; displayName: string;
  specialty: string | null; taxonomies: { code: string; desc: string; primary: boolean; state: string; license: string }[];
  practice: Address | null; addresses: Address[]; phone: string | null;
  lastUpdated: string | null;
}

const PAGE_SIZE = 10;
const cache = new Map<string, Doctor[]>();

const formatPhone = (p: string | null) => {
  if (!p) return null;
  const d = p.replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return p;
};

const fullAddress = (a: Address) =>
  [a.line1, a.line2, `${a.city}, ${a.state} ${a.postal}`].filter(Boolean).join(", ");

const FindADoctorPage = () => {
  const [params, setParams] = useSearchParams();
  const [specialty, setSpecialty] = useState(params.get("specialty") || "");
  const [location, setLocation] = useState(params.get("location") || "");
  const [name, setName] = useState(params.get("name") || "");
  const [showMore, setShowMore] = useState(!!params.get("name"));

  const [results, setResults] = useState<Doctor[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [locating, setLocating] = useState(false);
  const [selected, setSelected] = useState<Doctor | null>(null);

  const debounceRef = useRef<number | null>(null);

  const cacheKey = useMemo(
    () => `${specialty}|${location.trim().toLowerCase()}|${name.trim().toLowerCase()}`,
    [specialty, location, name]
  );

  const runSearch = useCallback(async () => {
    if (!specialty && !location.trim() && !name.trim()) return;
    setError(null);
    setSearched(true);

    if (cache.has(cacheKey)) {
      setResults(cache.get(cacheKey)!);
      setPage(1);
      return;
    }

    setLoading(true);
    setResults([]);
    try {
      const url = new URL(
        `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.functions.supabase.co/npi-search`
      );
      if (specialty) url.searchParams.set("specialty", specialty);
      if (location.trim()) url.searchParams.set("location", location.trim());
      if (name.trim()) url.searchParams.set("name", name.trim());
      url.searchParams.set("limit", "50");

      const res = await fetch(url.toString(), {
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Search failed");

      const list: Doctor[] = data.results || [];
      cache.set(cacheKey, list);
      setResults(list);
      setPage(1);
    } catch (e) {
      console.error("Find a doctor search failed:", e);
      setError("We couldn't load results right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, [specialty, location, name, cacheKey]);

  // Debounced auto-search on input change
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!specialty && !location.trim() && !name.trim()) return;
    debounceRef.current = window.setTimeout(() => {
      const next = new URLSearchParams();
      if (specialty) next.set("specialty", specialty);
      if (location.trim()) next.set("location", location.trim());
      if (name.trim()) next.set("name", name.trim());
      setParams(next, { replace: true });
      runSearch();
    }, 300);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialty, location, name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    runSearch();
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const d = await r.json();
          const zip = d.address?.postcode;
          if (zip) setLocation(zip);
        } catch { /* ignore */ }
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000 }
    );
  };

  const handleReset = () => {
    setSpecialty(""); setLocation(""); setName("");
    setResults([]); setSearched(false); setError(null);
    setParams(new URLSearchParams(), { replace: true });
  };

  const visible = results.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < results.length;

  return (
    <>
      <PageMeta
        title="Find a doctor | Clarify Health"
        description="Search real US doctors by specialty, name, or location, sourced from the NIH National Provider Registry."
        canonical="/find-a-doctor"
      />
      <main className="px-6 pt-32 pb-24">
        <div className="mx-auto max-w-[760px]">
          {/* Header */}
          <header className="mb-10">
            <h1
              className="text-[36px] md:text-[48px] font-medium text-foreground"
              style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.02em", lineHeight: 1.1 }}
            >
              Find a doctor
            </h1>
            <p
              className="mt-4 text-[17px] text-foreground/75"
              style={{ fontFamily: "Inter, sans-serif", lineHeight: 1.6 }}
            >
              Search by specialty, name, or location. Real doctors, pulled from the national provider registry.
            </p>
          </header>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-10" aria-label="Find a doctor search form">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,1.4fr,auto] gap-3">
              <div>
                <label htmlFor="specialty" className="block text-[12px] font-medium text-muted-foreground mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                  Specialty
                </label>
                <select
                  id="specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full h-11 rounded-full border border-input bg-background px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {SPECIALTIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-[12px] font-medium text-muted-foreground mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                  Location (city, state, or ZIP)
                </label>
                <div className="flex gap-2">
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="New York, NY"
                    className="flex-1 h-11 rounded-full border border-input bg-background px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={locating}
                    aria-label="Use my current location"
                    className="shrink-0 h-11 w-11 rounded-full border border-input bg-background flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="h-11 w-full md:w-auto px-7 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:bg-primary/90 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Search
                </button>
              </div>
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="text-[13px] text-primary underline underline-offset-4"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {showMore ? "Hide" : "More"} filters
              </button>
              {showMore && (
                <div className="mt-3">
                  <label htmlFor="name" className="block text-[12px] font-medium text-muted-foreground mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                    Doctor name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Smith"
                    className="w-full h-11 rounded-full border border-input bg-background px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </div>
              )}
            </div>
          </form>

          {/* Results region */}
          <div aria-live="polite" aria-busy={loading}>
            {loading && (
              <ul className="space-y-4" aria-label="Loading results">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="rounded-2xl border border-border/60 p-6 animate-pulse">
                    <div className="h-5 w-2/3 bg-muted rounded mb-3" />
                    <div className="h-3.5 w-1/3 bg-muted rounded mb-2" />
                    <div className="h-3.5 w-1/2 bg-muted rounded" />
                  </li>
                ))}
              </ul>
            )}

            {!loading && error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <p className="text-[15px] text-foreground mb-3" style={{ fontFamily: "Inter, sans-serif" }}>{error}</p>
                <button
                  onClick={runSearch}
                  className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && searched && results.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[15px] text-foreground/80 mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
                  No doctors match your search. Try widening your location or removing filters.
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Reset
                </button>
              </div>
            )}

            {!loading && !error && visible.length > 0 && (
              <>
                <p className="text-[13px] text-muted-foreground mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
                  {results.length} {results.length === 1 ? "result" : "results"} · directory lookup, not an endorsement
                </p>
                <ul className="space-y-4" aria-label="Doctor search results">
                  {visible.map((d) => (
                    <li key={d.npi} className="rounded-2xl border border-border/60 bg-card p-6 hover:border-foreground/20 transition-colors">
                      <h2 className="text-[19px] font-medium text-foreground" style={{ fontFamily: "Fraunces, serif" }}>
                        {d.displayName}
                      </h2>
                      {d.specialty && (
                        <p className="mt-1 text-[14px] text-foreground/75" style={{ fontFamily: "Inter, sans-serif" }}>
                          {d.specialty}
                        </p>
                      )}
                      {d.practice && (
                        <p className="mt-2 text-[14px] text-muted-foreground flex items-start gap-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          {d.practice.city}, {d.practice.state}
                        </p>
                      )}
                      {d.phone && (
                        <p className="mt-1 text-[14px] text-muted-foreground flex items-center gap-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                          <Phone className="h-3.5 w-3.5" />
                          <a href={`tel:${d.phone}`} className="hover:text-foreground transition-colors">{formatPhone(d.phone)}</a>
                        </p>
                      )}
                      <button
                        onClick={() => setSelected(d)}
                        className="mt-4 text-[13px] text-primary underline underline-offset-4"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        View details
                      </button>
                    </li>
                  ))}
                </ul>

                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="px-6 py-2.5 rounded-full border border-input text-[13px] font-medium text-foreground hover:bg-muted transition-colors"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Load more
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-[640px] max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 500 }}>
                  {selected.displayName}
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-5" style={{ fontFamily: "Inter, sans-serif" }}>
                <section>
                  <h3 className="text-[11px] uppercase tracking-[1.2px] text-muted-foreground mb-2">Specialties</h3>
                  <ul className="space-y-1 text-[14px] text-foreground">
                    {selected.taxonomies.map((t, i) => (
                      <li key={i}>
                        {t.desc}{t.primary ? " (primary)" : ""}
                        <span className="text-muted-foreground"> · {t.code}{t.state ? ` · Lic ${t.state}` : ""}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-[11px] uppercase tracking-[1.2px] text-muted-foreground mb-2">Practice locations</h3>
                  <ul className="space-y-3 text-[14px]">
                    {selected.addresses.map((a, i) => (
                      <li key={i} className="text-foreground">
                        <p className="font-medium">{a.purpose === "LOCATION" ? "Practice" : "Mailing"}</p>
                        <p className="text-muted-foreground">{fullAddress(a)}</p>
                        {a.phone && (
                          <a href={`tel:${a.phone}`} className="text-primary underline underline-offset-4">{formatPhone(a.phone)}</a>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>

                {selected.practice && (
                  <section>
                    <h3 className="text-[11px] uppercase tracking-[1.2px] text-muted-foreground mb-2">Map</h3>
                    <div className="rounded-lg overflow-hidden border border-border/60">
                      <iframe
                        title="Practice location map"
                        width="100%"
                        height="260"
                        loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=&layer=mapnik&marker=&q=${encodeURIComponent(fullAddress(selected.practice))}`}
                      />
                      <a
                        href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(fullAddress(selected.practice))}`}
                        target="_blank" rel="noopener noreferrer"
                        className="block px-3 py-2 text-[12px] text-primary underline underline-offset-4"
                      >
                        Open in OpenStreetMap
                      </a>
                    </div>
                  </section>
                )}

                <section className="text-[12px] text-muted-foreground">
                  <p>NPI: {selected.npi}</p>
                  {selected.lastUpdated && <p>Last updated: {selected.lastUpdated}</p>}
                </section>

                <p className="text-[12px] text-muted-foreground italic">
                  Information from the NIH NPI Registry. Always confirm with the doctor's office before visiting.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FindADoctorPage;
