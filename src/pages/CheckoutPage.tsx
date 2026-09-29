import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Checkout, CheckoutElement, WhopElements } from "@whop/elements-react";
import { loadWhop } from "@whop/elements";
import PageMeta from "@/components/PageMeta";
import { useAuth } from "@/hooks/useAuth";

const PLANS = {
  tier1: { id: "plan_fmrUm4OGpaGSD", name: "Plus", price: "$10/mo", uses: "25 AI uses per month" },
  tier2: { id: "plan_nHSGuYgKRbIQR", name: "Plus Pro", price: "$20/mo", uses: "50 AI uses per month" },
} as const;

type Tier = keyof typeof PLANS;

const CheckoutPage = () => {
  const [params] = useSearchParams();
  const initial: Tier = params.get("plan") === "tier2" ? "tier2" : "tier1";
  const [tier, setTier] = useState<Tier>(initial);
  const plan = PLANS[tier];
  const { user, loading } = useAuth();

  return (
    <>
      <PageMeta title="Upgrade to Plus | Clarify Health" description="Unlock AI-powered health tools with a Plus subscription." canonical="/checkout" />
      <main className="pt-32 pb-24 px-6">
        <div className="mx-auto max-w-[520px]">
          <p className="micro-label text-accent">Clarify Health Plus</p>
          <h1 className="mt-3 text-[36px] font-medium leading-tight text-foreground">
            Upgrade to Plus
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Plus unlocks the AI-powered tools: the wellness plan generator and
            doctor visit notes with recording transcription and simplification.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Choose a plan">
            {(Object.keys(PLANS) as Tier[]).map((key) => {
              const p = PLANS[key];
              const active = key === tier;
              return (
                <button
                  key={key}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTier(key)}
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    active
                      ? "border-accent bg-accent/5"
                      : "border-border bg-background hover:border-foreground/30"
                  }`}
                >
                  <span className="block text-[15px] font-semibold text-foreground">{p.name}</span>
                  <span className="mt-1 block text-[20px] font-medium text-foreground">{p.price}</span>
                  <span className="mt-1 block text-[12px] text-muted-foreground">{p.uses}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            {loading ? null : !user ? (
              <p className="rounded-lg border border-border p-5 text-[14px] text-foreground">
                Please <Link to="/login" className="text-primary underline underline-offset-4">log in</Link> or{" "}
                <Link to="/signup" className="text-primary underline underline-offset-4">create an account</Link> first. Use the same email at checkout so your plan unlocks.
              </p>
            ) : (
            <>
            <p className="mb-4 text-[13px] text-muted-foreground">Use <strong>{user.email}</strong> at checkout so your plan unlocks automatically.</p>
            <WhopElements elements={loadWhop()}>
              <Checkout
                key={plan.id}
                plan={plan.id}
                returnUrl={`${window.location.origin}/checkout/return`}
                onComplete={() => {
                  // analytics only — access is unlocked by Whop, not here
                }}
              >
                <CheckoutElement />
              </Checkout>
            </WhopElements>
            </>
            )}
          </div>

          <p className="mt-6 text-[12px] leading-relaxed text-muted-foreground">
            Payments are processed securely by Whop. Cancel anytime. Clarify
            Health is an educational project and does not provide medical
            advice — always talk to your doctor about your health.
          </p>
          <p className="mt-4 text-[13px]">
            <Link to="/tools" className="text-primary underline underline-offset-4">
              Back to tools
            </Link>
          </p>
        </div>
      </main>
    </>
  );
};

export default CheckoutPage;
