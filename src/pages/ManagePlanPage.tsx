import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import PageMeta from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Info = { status: string | null; plan: string | null; renewal_period_end: number | string | null; cancel_at_period_end: boolean; manage_url: string };

type Payment = { id: string; created_at: string | number | null; amount: number | null; currency: string; status: string | null; card: string | null };

const PLAN_NAMES: Record<string, string> = { plan_fmrUm4OGpaGSD: "Plus · 25 AI uses/month", plan_nHSGuYgKRbIQR: "Plus Pro · 50 AI uses/month" };

const fmtDate = (v: Info["renewal_period_end"]) => {
  if (!v) return "—";
  const d = typeof v === "number" ? new Date(v * 1000) : new Date(v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
};

const ManagePlanPage = () => {
  const { user, loading } = useAuth();
  const [info, setInfo] = useState<Info | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "none" | "error">("loading");
  const [busy, setBusy] = useState(false);
  const [payments, setPayments] = useState<Payment[] | null>(null);

  const call = async (action: "get" | "cancel" | "resume") => {
    const { data, error } = await supabase.functions.invoke("whop-manage", { body: { action } });
    if (error) {
      const body = await (error as { context?: Response }).context?.json?.().catch(() => null);
      if (body?.error === "NO_MEMBERSHIP") { setState("none"); return null; }
      throw error;
    }
    return data as Info;
  };

  useEffect(() => {
    if (!user) return;
    call("get").then((d) => { if (d) { setInfo(d); setState("ready"); } }).catch((e) => { console.error(e); setState("error"); });
    supabase.functions.invoke("whop-manage", { body: { action: "payments" } })
      .then(({ data }) => setPayments((data?.payments as Payment[]) ?? []))
      .catch(() => setPayments([]));
  }, [user]);

  const act = async (action: "cancel" | "resume") => {
    setBusy(true);
    try {
      const d = await call(action);
      if (d) setInfo(d);
      toast.success(action === "cancel" ? "Your plan will end at the end of this period." : "Your plan will keep renewing.");
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
    } finally { setBusy(false); }
  };

  if (loading) return <div className="min-h-[60vh]" aria-busy="true" />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <main className="page-shell">
      <PageMeta title="Manage plan | Clarify Health" description="Manage your Clarify Health plan." canonical="/manage-plan" />
      <header className="page-intro">
        <p className="micro-label text-accent">Account</p>
        <h1>Manage plan</h1>
      </header>

      <section className="mx-auto max-w-[680px] px-6 pb-24" aria-live="polite">
        {state === "loading" && <p className="text-muted-foreground">Loading your plan…</p>}
        {state === "error" && <p className="text-muted-foreground">We couldn't load your plan. Please refresh to try again.</p>}
        {state === "none" && (
          <div className="space-y-4">
            <p className="text-muted-foreground">You don't have a plan yet.</p>
            <Button asChild className="rounded-lg"><Link to="/checkout">Get Plus</Link></Button>
          </div>
        )}
        {state === "ready" && info && (
          <div className="space-y-8">
            <dl className="divide-y divide-border border-y border-border">
              <div className="flex justify-between py-4"><dt className="text-muted-foreground">Plan</dt><dd className="font-medium text-foreground">{PLAN_NAMES[info.plan ?? ""] ?? "Plus"}</dd></div>
              <div className="flex justify-between py-4"><dt className="text-muted-foreground">Status</dt><dd className="font-medium capitalize text-foreground">{info.cancel_at_period_end ? "Ending" : info.status ?? "—"}</dd></div>
              <div className="flex justify-between py-4"><dt className="text-muted-foreground">{info.cancel_at_period_end ? "Ends on" : "Renews on"}</dt><dd className="font-medium text-foreground">{fmtDate(info.renewal_period_end)}</dd></div>
            </dl>
            <div className="flex flex-wrap items-center gap-6">
              {info.cancel_at_period_end
                ? <Button className="rounded-lg" disabled={busy} onClick={() => act("resume")}>Keep my plan</Button>
                : info.plan !== "plan_nHSGuYgKRbIQR" && <Button asChild className="rounded-lg"><Link to="/checkout">Upgrade to Plus Pro</Link></Button>}
              {!info.cancel_at_period_end && (
                <button type="button" disabled={busy} onClick={() => { if (confirm("Cancel your plan? You keep access until the end of this period.")) act("cancel"); }}
                  className="text-[13px] font-medium text-foreground underline underline-offset-4 hover:text-accent disabled:opacity-50">Cancel plan</button>
              )}
              <a href={info.manage_url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-muted-foreground underline underline-offset-4 hover:text-accent">Update payment card</a>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">Billing history</h2>
              {payments === null && <p className="text-muted-foreground">Loading…</p>}
              {payments?.length === 0 && <p className="text-muted-foreground">No payments to show yet.</p>}
              {!!payments?.length && (
                <ul className="divide-y divide-border border-y border-border">
                  {payments.map((p) => (
                    <li key={p.id} className="flex flex-wrap justify-between gap-2 py-3 text-[15px]">
                      <span className="text-foreground">{fmtDate(p.created_at)}</span>
                      <span className="text-muted-foreground">{p.card ?? ""}</span>
                      <span className="capitalize text-muted-foreground">{p.status?.replace(/_/g, " ") ?? ""}</span>
                      <span className="font-medium text-foreground">{p.amount != null ? new Intl.NumberFormat(undefined, { style: "currency", currency: p.currency.toUpperCase() }).format(p.amount) : "—"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default ManagePlanPage;
