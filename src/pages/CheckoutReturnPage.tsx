import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "@/components/PageMeta";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const CheckoutReturnPage = () => {
  const { user, loading } = useAuth();
  const [synced, setSynced] = useState<"pending" | "ok" | "failed">("pending");

  useEffect(() => {
    if (!user) return;
    supabase.functions.invoke("whop-verify")
      .then(({ data, error }) => setSynced(!error && data?.synced ? "ok" : "failed"))
      .catch(() => setSynced("failed"));
  }, [user]);

  return (
    <>
      <PageMeta title="Welcome to Plus | Clarify Health" description="Your Plus subscription is active." canonical="/checkout/return" />
      <main className="pt-32 pb-24 px-6">
        <div className="mx-auto max-w-[520px] text-center">
          <p className="micro-label text-accent">Clarify Health Plus</p>
          <h1 className="mt-3 text-[36px] font-medium leading-tight text-foreground">
            You're all set
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            {synced === "failed"
              ? "Your payment went through on Whop, but we couldn't confirm it just yet. Open your dashboard in a minute — if your plan still isn't showing, contact us."
              : "Your Plus subscription is active. Your AI-powered tools — the wellness plan and doctor visit notes — are ready to use."}
          </p>
          <div className="mt-10">
            <Link
              to="/dashboard"
              className="inline-block rounded-full bg-primary px-8 py-3 text-[14px] font-medium text-primary-foreground"
            >
              Open your dashboard
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default CheckoutReturnPage;