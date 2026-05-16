import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2, Check, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageMeta from "@/components/PageMeta";

const NewsletterConfirmPage = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "ok" | "already" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    supabase.functions.invoke("newsletter-confirm", { body: { token } }).then(({ data, error }) => {
      if (error || (data as any)?.error) { setStatus("error"); return; }
      if ((data as any)?.already) setStatus("already"); else setStatus("ok");
    });
  }, [token]);

  return (
    <main className="min-h-screen pt-32 px-6 bg-background flex items-center justify-center">
      <PageMeta title="Confirm subscription — Clarify Health" description="Confirm your Clarify Health newsletter subscription." canonical="/newsletter/confirm" />
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center">
        {status === "loading" && <><Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-3" /><p>Confirming…</p></>}
        {status === "ok" && (<><Check className="h-10 w-10 mx-auto text-primary mb-3" /><h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: "Fraunces, serif" }}>You're subscribed</h1><p className="text-muted-foreground mb-4">Look out for one plain-English explainer in your inbox each week.</p><Link to="/" className="text-primary underline">Back to home</Link></>)}
        {status === "already" && (<><Check className="h-10 w-10 mx-auto text-primary mb-3" /><h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: "Fraunces, serif" }}>You're already in</h1><p className="text-muted-foreground mb-4">This email is already confirmed.</p><Link to="/" className="text-primary underline">Back to home</Link></>)}
        {status === "error" && (<><AlertTriangle className="h-10 w-10 mx-auto text-destructive mb-3" /><h1 className="text-2xl font-semibold mb-2">Link not valid</h1><p className="text-muted-foreground mb-4">The confirmation link is invalid or expired.</p><Link to="/" className="text-primary underline">Back to home</Link></>)}
      </div>
    </main>
  );
};

export default NewsletterConfirmPage;