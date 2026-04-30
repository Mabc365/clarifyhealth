import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin, Search, Loader2, Phone, Star, ChevronDown, ChevronUp,
  ExternalLink, LocateFixed, Clock, AlertTriangle, PhoneCall,
} from "lucide-react";
import PageMeta from "@/components/PageMeta";

interface Doctor {
  placeId: string;
  name: string;
  address: string | { line1?: string; line2?: string; city?: string; state?: string; zip?: string } | null;
  rating: number | null;
  reviewCount: number;
  phone: string;
  googleMapsUrl: string;
  healthgradesUrl: string;
  openNow: boolean | null;
}

interface SearchResult {
  specialty: string;
  reason: string;
  urgency: "routine" | "soon" | "urgent";
  urgency_note: string;
  doctors: Doctor[];
  fallback: boolean;
  searchLinks?: { name: string; description: string; url: string }[];
  zipCode?: string;
}

const QUICK_PILLS = [
  { key: "diagnosis", label: "I just got a diagnosis" },
  { key: "specialist", label: "I need a specialist" },
  { key: "mental", label: "Mental health support" },
  { key: "chronic", label: "Chronic condition" },
  { key: "checkup", label: "General checkup" },
];

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "name", label: "A–Z" },
  { value: "rating", label: "Highest rated" },
];

const FindADoctorPage = () => {
  const { t } = useLanguage();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [symptoms, setSymptoms] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [locating, setLocating] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const handleUseLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          const zip = data.address?.postcode;
          if (zip) setZipCode(zip);
        } catch { /* ignore */ }
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000 }
    );
  };

  const handleSearch = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("find-doctor", {
        body: {
          symptoms: symptoms.trim(),
          zipCode: zipCode.trim() || undefined,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
      } else {
        setResult(data as SearchResult);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    }

    setLoading(false);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
  };

  const handlePillClick = (label: string) => {
    setSymptoms(label);
  };

  const sortedDoctors = result?.doctors
    ? [...result.doctors].sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
        return 0;
      })
    : [];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.25;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<Star key={i} className="h-3.5 w-3.5 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-3.5 w-3.5 text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <>
      <PageMeta
        title={t("findDoctor.meta.title")}
        description={t("findDoctor.meta.desc")}
        canonical="/find-a-doctor"
      />
      <main className="min-h-screen pt-28 pb-24 px-6">
        <div className="mx-auto max-w-[700px]">

          {/* Hero */}
          <div className="mb-12">
            <div className="w-[60px] h-[3px] bg-primary mb-6" />
            <h1
              className="text-[36px] md:text-[48px] font-medium leading-[1.1] mb-4"
              style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.5px" }}
            >
              {t("findDoctor.title")}
            </h1>
            <p
              className="text-[16px] text-muted-foreground max-w-[520px]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {t("findDoctor.sub")}
            </p>
          </div>

          {/* Step 1: Describe symptoms */}
          <div className="mb-8">
            <Label
              className="text-[11px] uppercase tracking-[1.2px] text-muted-foreground mb-3 block"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {t("findDoctor.step1")}
            </Label>
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder={t("findDoctor.symptomsPlaceholder")}
              className="min-h-[100px] text-[15px]"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {QUICK_PILLS.map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => handlePillClick(pill.label)}
                  className="px-3 py-1.5 text-[12px] font-medium rounded-full border transition-colors hover:bg-primary hover:text-primary-foreground"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    borderColor: "hsl(var(--border))",
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Location */}
          <div className="mb-8">
            <Label
              className="text-[11px] uppercase tracking-[1.2px] text-muted-foreground mb-3 block"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {t("findDoctor.step2")}
            </Label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder={t("findDoctor.zipPlaceholder")}
                  maxLength={5}
                  className="text-[15px]"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleUseLocation}
                disabled={locating}
                className="gap-2 text-[13px] shrink-0"
              >
                {locating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="h-3.5 w-3.5" />
                )}
                {t("findDoctor.useLocation")}
              </Button>
            </div>
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            disabled={loading || !symptoms.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-[15px] h-12 gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {t("findDoctor.searchButton")}
          </Button>

          {error && (
            <p className="mt-4 text-destructive text-[14px] text-center">{error}</p>
          )}

          {/* Results */}
          <div ref={resultsRef}>
            {result && (
              <div className="mt-12">

                {/* Urgency banner */}
                {result.urgency === "urgent" && (
                  <div className="mb-6 p-5 rounded-md bg-red-50 border-2 border-red-300">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-[15px] font-semibold text-red-900">
                          This sounds urgent — get help now
                        </p>
                        <p className="text-[13px] text-red-800 mt-1 leading-relaxed">
                          {result.urgency_note}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <a
                            href="tel:911"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors"
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                            Call 911
                          </a>
                          <a
                            href="https://www.google.com/maps/search/emergency+room+near+me"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-red-300 text-red-800 text-[13px] font-semibold hover:bg-red-100 transition-colors"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            Find nearest ER
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {result.urgency === "soon" && (
                  <div className="mb-6 p-4 rounded-md bg-amber-50 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[14px] font-semibold text-amber-800">
                          Consider scheduling soon
                        </p>
                        <p className="text-[13px] text-amber-700 mt-1">
                          {result.urgency_note}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Specialty callout */}
                <div className="mb-6 p-4 rounded-md" style={{ background: "hsl(var(--section-bg))" }}>
                  <p className="text-[14px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Based on what you described, you likely need a{" "}
                    <span className="text-primary font-semibold">{result.specialty}</span>.{" "}
                    <span className="text-muted-foreground">{result.reason}</span>
                  </p>
                </div>

                {/* Curated directory links (when no live doctor data) */}
                {result.searchLinks && result.searchLinks.length > 0 && sortedDoctors.length === 0 ? (
                  <div>
                    <p
                      className="text-[13px] text-muted-foreground mb-4"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Search trusted directories for a {result.specialty}
                      {result.zipCode ? ` near ${result.zipCode}` : ""}:
                    </p>
                    <div className="space-y-3">
                      {result.searchLinks.map((link) => (
                        <a
                          key={link.name}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 rounded-md transition-colors hover:shadow-sm group"
                          style={{
                            border: "0.5px solid hsl(var(--border))",
                            background: "hsl(var(--card))",
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3
                                className="text-[16px] font-medium text-foreground group-hover:text-primary transition-colors"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                              >
                                {link.name}
                              </h3>
                              <p
                                className="text-[13px] text-muted-foreground mt-1"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              >
                                {link.description}
                              </p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : sortedDoctors.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[15px] text-muted-foreground mb-4">
                      We couldn't find doctors in our system for your area.
                    </p>
                    <p className="text-[14px] text-muted-foreground">
                      Try searching on{" "}
                      <a href="https://www.healthgrades.com" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Healthgrades.com</a>
                      {" "}or{" "}
                      <a href="https://www.zocdoc.com" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Zocdoc.com</a>
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Sort controls */}
                    <div className="flex items-center justify-between mb-4">
                      <p
                        className="text-[13px] text-muted-foreground"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {sortedDoctors.length} {t("findDoctor.resultsFound")}
                      </p>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[160px] h-8 text-[12px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SORT_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Doctor cards */}
                    <div className="space-y-4">
                      {sortedDoctors.map((doc) => (
                        <div
                          key={doc.placeId}
                          className="p-5 rounded-md transition-colors hover:shadow-sm"
                          style={{
                            border: "0.5px solid hsl(var(--border))",
                            background: "hsl(var(--card))",
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3
                                className="text-[18px] font-medium text-foreground"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                              >
                                {doc.name}
                              </h3>

                              {/* Rating */}
                              {doc.rating != null && (
                                <div className="flex items-center gap-2 mt-1.5">
                                  <div className="flex items-center gap-0.5">
                                    {renderStars(doc.rating)}
                                  </div>
                                  <span className="text-[13px] font-medium text-foreground">
                                    {Number(doc.rating).toFixed(1)}
                                  </span>
                                  <span className="text-[12px] text-muted-foreground">
                                    ({doc.reviewCount} Google reviews)
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Open/Closed badge */}
                            {doc.openNow !== null && (
                              <span
                                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap ${
                                  doc.openNow
                                    ? "bg-green-50 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                <Clock className="h-3 w-3" />
                                {doc.openNow ? "Open now" : "Closed"}
                              </span>
                            )}
                          </div>

                          {/* Address & phone */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-[13px] text-muted-foreground">
                            {doc.address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {typeof doc.address === "object" && doc.address !== null
                                  ? [doc.address.line1, doc.address.line2, doc.address.city, doc.address.state, doc.address.zip].filter(Boolean).join(", ")
                                  : String(doc.address ?? "")}
                              </span>
                            )}
                            {doc.phone && (
                              <a
                                href={`tel:${doc.phone}`}
                                className="flex items-center gap-1 hover:text-foreground transition-colors"
                              >
                                <Phone className="h-3 w-3 shrink-0" />
                                {doc.phone}
                              </a>
                            )}
                          </div>

                          {/* Links */}
                          <div
                            className="mt-3 pt-3 flex flex-wrap items-center gap-4"
                            style={{ borderTop: "0.5px solid hsl(var(--border))" }}
                          >
                            <a
                              href={doc.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {t("findDoctor.viewProfile")}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <a
                              href={doc.healthgradesUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:underline"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              View on Healthgrades
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Disclaimer */}
                <p className="mt-8 text-[12px] text-muted-foreground text-center leading-relaxed">
                  {t("findDoctor.disclaimer")}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default FindADoctorPage;
