import { Link } from "react-router-dom";
import PageMeta from "@/components/PageMeta";

const CheckoutReturnPage = () => (
  <>
    <PageMeta title="Welcome to Plus | Clarify Health" description="Your Plus subscription is active." canonical="/checkout/return" />
    <main className="pt-32 pb-24 px-6">
      <div className="mx-auto max-w-[520px] text-center">
        <p className="micro-label text-accent">Clarify Health Plus</p>
        <h1 className="mt-3 text-[36px] font-medium leading-tight text-foreground">
          You're all set
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          Your Plus subscription is active. Your AI-powered tools — the wellness
          plan and doctor visit notes — are ready to use.
        </p>
        <div className="mt-10">
          <Link
            to="/tools"
            className="inline-block rounded-full bg-primary px-8 py-3 text-[14px] font-medium text-primary-foreground"
          >
            Open your tools
          </Link>
        </div>
      </div>
    </main>
  </>
);

export default CheckoutReturnPage;
