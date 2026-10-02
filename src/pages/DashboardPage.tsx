import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const TOOLS = [
  { to: "/translate", title: "Jargon translator", desc: "Turn medical text into plain English.", ai: true },
  { to: "/my-notes", title: "Doctor visit notes", desc: "Record or upload visits and simplify them.", ai: true },
  { to: "/wellness-plan", title: "Wellness plan", desc: "A simple plan for everyday health.", ai: true },
  { to: "/find-a-doctor", title: "Find a doctor", desc: "Search the public doctor directory." },
  { to: "/glossary", title: "Glossary", desc: "Medical terms, defined simply." },
  { to: "/topics", title: "Health topics", desc: "Plain-language guides to conditions." },
];

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const [tier, setTier] = useState<string>("free");
  const [used, setUsed] = useState(0);

  useEffect(() => {
    if (!user) return;
    const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
    supabase.from("subscriptions").select("tier,status").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setTier(data?.status === "active" ? data.tier : "free"));
    supabase.from("ai_usage").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", start.toISOString())
      .then(({ count }) => setUsed(count ?? 0));
  }, [user]);

  if (loading) return <div className="min-h-[60vh]" aria-busy="true" />;
  if (!user) return <Navigate to="/login" replace />;

  const limit = tier === "tier2" ? 50 : tier === "tier1" ? 25 : 0;
  const plan = tier === "tier2" ? "Plus Pro" : tier === "tier1" ? "Plus" : "No plan";
  const name = user.user_metadata?.display_name ?? user.email?.split("@")[0];

  return (
    <main className="page-shell">
      <PageMeta title="Dashboard | Clarify Health" description="Your Clarify Health tools." canonical="/dashboard" />
      <header className="page-intro">
        <p className="micro-label text-accent">Dashboard</p>
        <h1>Welcome back, {name}.</h1>
        <p>Your tools and AI uses in one place.</p>
      </header>

      <section className="mx-auto mb-10 flex max-w-[1180px] flex-col gap-4 border-y border-border px-6 py-6 md:flex-row md:items-center md:justify-between" aria-label="Plan">
        <div>
          <p className="micro-label text-muted-foreground">{plan}</p>
          <p className="mt-2 text-[22px] font-medium text-foreground">{limit ? `${used} / ${limit} AI uses this month` : "AI tools need a Plus plan"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {limit > 0 && (
            <Link to="/manage-plan" className="text-[13px] font-medium text-foreground underline underline-offset-4 hover:text-accent">Manage plan</Link>
          )}
          {tier !== "tier2" && <Button asChild className="rounded-lg"><Link to="/checkout">{limit ? "Upgrade" : "Get Plus"} <ArrowUpRight className="h-4 w-4" /></Link></Button>}
        </div>
      </section>

      <ul className="directory-grid" aria-label="Your tools">
        {TOOLS.map((tool) => (
          <li key={tool.to}>
            <Link to={tool.to} className="group flex min-h-[200px] flex-col justify-between p-6 md:p-7">
              <div className="flex items-start justify-between">
                <span className="micro-label text-accent">{tool.ai ? "AI · Plus" : "Free"}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
              <div><h2 className="text-[22px] font-medium text-foreground">{tool.title}</h2><p className="mt-2 text-[14px] text-muted-foreground">{tool.desc}</p></div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default DashboardPage;
