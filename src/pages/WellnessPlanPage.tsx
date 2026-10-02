import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleAiGateError } from "@/lib/aiGate";
import { supabase } from "@/lib/supabase";
import { aiInvoke } from "@/lib/aiFunctions";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Loader2, ChevronDown, ChevronUp, Salad, Dumbbell, Moon, Pill, Heart,
  BookOpen, RefreshCw,
} from "lucide-react";
import PageMeta from "@/components/PageMeta";

const HEALTH_GOALS = [
  "Lose weight", "Manage stress", "Improve sleep", "More energy",
  "Manage a condition", "General wellness",
];

const DIET_PREFERENCES = [
  "No restrictions", "Vegetarian", "Vegan", "Halal", "Kosher",
  "Gluten-free", "Dairy-free", "Low sodium", "Diabetic-friendly", "Heart-healthy",
];

const HOLISTIC_OPTIONS = [
  "Herbal/natural supplements", "Mindfulness & meditation", "Acupuncture",
  "Yoga", "Ayurveda", "Islamic medicine (Tibb)", "No preference",
];

const AGE_RANGES = ["18-25", "26-35", "36-50", "51-65", "65+"];
const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light (1-2x/week)" },
  { value: "moderate", label: "Moderate (3-4x/week)" },
  { value: "active", label: "Active (5+/week)" },
];

interface WellnessPlan {
  nutrition?: { summary: string; recommendations: string[]; sources: string[] };
  exercise?: { summary: string; recommendations: string[]; sources: string[] };
  stressSleep?: { summary: string; recommendations: string[]; sources: string[] };
  supplements?: { applicable: boolean; summary: string; recommendations: string[]; disclaimer: string; sources: string[] };
  mindfulness?: { applicable: boolean; summary: string; recommendations: string[]; sources: string[] };
}

interface Preferences {
  ageRange: string;
  healthGoals: string[];
  conditions: string;
  dietPreferences: string[];
  activityLevel: string;
  limitations: string;
  holisticPreferences: string[];
}

const ChipSelect = ({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => {
      const active = selected.includes(opt);
      return (
        <button
          key={opt}
          type="button"
          onClick={() =>
            onChange(active ? selected.filter((s) => s !== opt) : [...selected, opt])
          }
          className={`px-3 py-1.5 text-[12px] font-medium rounded-full border transition-colors ${
            active
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
          }`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

const PlanSection = ({
  icon: Icon,
  title,
  data,
}: {
  icon: React.ElementType;
  title: string;
  data: { summary: string; recommendations: string[]; sources: string[]; disclaimer?: string };
}) => {
  const [open, setOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className="flex items-center justify-between w-full p-4 rounded-md transition-colors hover:bg-muted/50 text-left"
          style={{ border: "0.5px solid hsl(var(--border))" }}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-primary" />
            <span
              className="text-[16px] font-medium text-foreground"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {title}
            </span>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 pt-2">
        <p className="text-[14px] text-muted-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {data.summary}
        </p>
        <ul className="space-y-2 mb-4">
          {data.recommendations.map((rec, i) => (
            <li key={i} className="flex gap-2 text-[14px] text-foreground">
              <span className="text-primary mt-0.5">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
        {data.disclaimer && (
          <p className="text-[12px] text-muted-foreground italic mb-3 p-3 rounded" style={{ background: "hsl(var(--section-bg))" }}>
            ⚠️ {data.disclaimer}
          </p>
        )}
        {data.sources && data.sources.length > 0 && (
          <Collapsible open={sourcesOpen} onOpenChange={setSourcesOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                <BookOpen className="h-3 w-3" />
                {t("wellness.sources")}
                {sourcesOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1">
              {data.sources.map((src, i) => (
                <p key={i} className="text-[12px] text-muted-foreground">{src}</p>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

const WellnessPlanPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const [prefs, setPrefs] = useState<Preferences>({
    ageRange: "",
    healthGoals: [],
    conditions: "",
    dietPreferences: [],
    activityLevel: "",
    limitations: "",
    holisticPreferences: [],
  });

  const [plan, setPlan] = useState<WellnessPlan | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [formOpen, setFormOpen] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) loadExisting();
  }, [user]);

  const loadExisting = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("wellness_plans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      const row = data[0] as any;
      setExistingId(row.id);
      if (row.preferences) setPrefs(row.preferences as Preferences);
      if (row.plan) {
        setPlan(row.plan as WellnessPlan);
        setFormOpen(false);
      }
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    setError("");

    try {
      const { data, error: fnError } = await aiInvoke("wellness-plan", {
        body: { preferences: prefs, language: lang },
      });
    if (fnError && (await handleAiGateError(fnError, navigate))) return;

      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
        setGenerating(false);
        return;
      }

      const generatedPlan = data.plan as WellnessPlan;
      setPlan(generatedPlan);
      setFormOpen(false);

      // Save to DB
      if (existingId) {
        await supabase
          .from("wellness_plans")
          .update({ preferences: prefs as any, plan: generatedPlan as any, updated_at: new Date().toISOString() })
          .eq("id", existingId);
      } else {
        const { data: inserted } = await supabase
          .from("wellness_plans")
          .insert({ user_id: user.id, preferences: prefs as any, plan: generatedPlan as any })
          .select("id")
          .single();
        if (inserted) setExistingId(inserted.id);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    }
    setGenerating(false);
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <>
      <PageMeta
        title={t("wellness.meta.title")}
        description={t("wellness.meta.desc")}
        canonical="/wellness-plan"
      />
      <main className="min-h-screen pt-28 pb-24 px-6">
        <div className="mx-auto max-w-[700px]">

          {/* Hero */}
          <div className="mb-10">
            <div className="w-[60px] h-[3px] bg-primary mb-6" />
            <h1
              className="text-[36px] md:text-[44px] font-medium leading-[1.1] mb-3"
              style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.5px" }}
            >
              {t("wellness.title")}
            </h1>
            <p
              className="text-[15px] text-muted-foreground max-w-[520px]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {t("wellness.sub")}
            </p>
          </div>

          {/* Onboarding Form */}
          <Collapsible open={formOpen} onOpenChange={setFormOpen} className="mb-10">
            <CollapsibleTrigger asChild>
              <button
                className="flex items-center justify-between w-full text-left mb-4"
              >
                <span
                  className="text-[13px] font-medium text-muted-foreground uppercase tracking-[1.2px]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {t("wellness.yourPreferences")}
                </span>
                {formOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-8">

              {/* Section 1: About you */}
              <div>
                <h2
                  className="text-[18px] font-medium mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {t("wellness.aboutYou")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-[12px] text-muted-foreground">{t("wellness.ageRange")}</Label>
                    <Select value={prefs.ageRange} onValueChange={(v) => setPrefs({ ...prefs, ageRange: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {AGE_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[12px] text-muted-foreground mb-2 block">{t("wellness.healthGoals")}</Label>
                    <ChipSelect options={HEALTH_GOALS} selected={prefs.healthGoals} onChange={(v) => setPrefs({ ...prefs, healthGoals: v })} />
                  </div>
                  <div>
                    <Label className="text-[12px] text-muted-foreground">{t("wellness.conditions")}</Label>
                    <Input
                      value={prefs.conditions}
                      onChange={(e) => setPrefs({ ...prefs, conditions: e.target.value })}
                      placeholder={t("wellness.conditionsPlaceholder")}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Diet */}
              <div>
                <h2
                  className="text-[18px] font-medium mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {t("wellness.dietTitle")}
                </h2>
                <ChipSelect options={DIET_PREFERENCES} selected={prefs.dietPreferences} onChange={(v) => setPrefs({ ...prefs, dietPreferences: v })} />
              </div>

              {/* Section 3: Exercise */}
              <div>
                <h2
                  className="text-[18px] font-medium mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {t("wellness.exerciseTitle")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-[12px] text-muted-foreground">{t("wellness.activityLevel")}</Label>
                    <Select value={prefs.activityLevel} onValueChange={(v) => setPrefs({ ...prefs, activityLevel: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[12px] text-muted-foreground">{t("wellness.limitations")}</Label>
                    <Input
                      value={prefs.limitations}
                      onChange={(e) => setPrefs({ ...prefs, limitations: e.target.value })}
                      placeholder={t("wellness.limitationsPlaceholder")}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Beliefs */}
              <div>
                <h2
                  className="text-[18px] font-medium mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {t("wellness.beliefsTitle")}
                </h2>
                <ChipSelect options={HOLISTIC_OPTIONS} selected={prefs.holisticPreferences} onChange={(v) => setPrefs({ ...prefs, holisticPreferences: v })} />
                <p className="text-[12px] text-muted-foreground mt-3 italic">
                  {t("wellness.beliefsNote")}
                </p>
              </div>

              {/* Submit */}
              <Button
                onClick={handleGenerate}
                disabled={generating || !prefs.ageRange}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-[15px] h-12 gap-2"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("wellness.generate")}
              </Button>

              {error && (
                <p className="text-destructive text-[13px] text-center">{error}</p>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Plan Display */}
          {plan && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-[22px] font-medium"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {t("wellness.yourPlan")}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setFormOpen(true); setPlan(null); }}
                  className="gap-1.5 text-[12px]"
                >
                  <RefreshCw className="h-3 w-3" />
                  {t("wellness.regenerate")}
                </Button>
              </div>

              {plan.nutrition && (
                <PlanSection icon={Salad} title={t("wellness.section.nutrition")} data={plan.nutrition} />
              )}
              {plan.exercise && (
                <PlanSection icon={Dumbbell} title={t("wellness.section.exercise")} data={plan.exercise} />
              )}
              {plan.stressSleep && (
                <PlanSection icon={Moon} title={t("wellness.section.stressSleep")} data={plan.stressSleep} />
              )}
              {plan.supplements?.applicable && (
                <PlanSection icon={Pill} title={t("wellness.section.supplements")} data={plan.supplements} />
              )}
              {plan.mindfulness?.applicable && (
                <PlanSection icon={Heart} title={t("wellness.section.mindfulness")} data={plan.mindfulness} />
              )}

              <p className="text-[12px] text-muted-foreground text-center mt-8 leading-relaxed">
                {t("wellness.disclaimer")}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default WellnessPlanPage;
