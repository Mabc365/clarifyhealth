import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const Index = () => {
  return (
    <main className="bg-background">
      <PageMeta
        title="Clarify Health — Health information in plain English"
        description="Clear, doctor-reviewed explanations of common health conditions, written so anyone can understand."
        canonical="/"
      />

      {/* 1. Hero — headline + subhead + ONE button */}
      <section className="px-6 pt-40 pb-24 md:pt-48 md:pb-32">
        <div className="mx-auto max-w-[680px] text-center">
          <h1
            className="text-[44px] md:text-[64px] font-medium text-foreground"
            style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.02em", lineHeight: 1.1 }}
          >
            Health information, in plain English.
          </h1>
          <p
            className="mx-auto mt-6 max-w-[520px] text-[17px] text-foreground/75"
            style={{ fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}
          >
            Skip the jargon. Get clear answers to common health questions, reviewed by clinicians.
          </p>
          <div className="mt-10">
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Ask a health question
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. What it does — three cards, max 12 words each */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { h: "Explained simply", p: "Plain-English explainers for common conditions and tests." },
            { h: "Reviewed by clinicians", p: "Every article checked by a licensed medical professional." },
            { h: "Built for questions", p: "Ask anything — get a clear answer in seconds." },
          ].map((c) => (
            <div key={c.h}>
              <h3
                className="text-[20px] font-medium text-foreground"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                {c.h}
              </h3>
              <p
                className="mt-3 text-[15px] text-foreground/70"
                style={{ fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}
              >
                {c.p}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. How it works — three numbered steps */}
      <section className="px-6 py-24 md:py-32 border-t" style={{ borderColor: "hsl(var(--border) / 0.5)" }}>
        <div className="mx-auto max-w-[680px]">
          <h2
            className="text-[28px] md:text-[36px] font-medium text-foreground mb-12"
            style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.01em" }}
          >
            How it works
          </h2>
          <ol className="space-y-8">
            {[
              "Type a question or browse our library of conditions.",
              "Read a short, plain-English explainer reviewed by a clinician.",
              "Bring the right questions to your next appointment.",
            ].map((step, i) => (
              <li key={i} className="flex gap-5">
                <span
                  className="shrink-0 text-[15px] font-medium text-primary"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p
                  className="text-[17px] text-foreground/85"
                  style={{ fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}
                >
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. One example — single article preview */}
      <section className="px-6 py-24 md:py-32 border-t" style={{ borderColor: "hsl(var(--border) / 0.5)" }}>
        <div className="mx-auto max-w-[680px]">
          <p
            className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground mb-4"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Example
          </p>
          <Link to="/topics/type-2-diabetes" className="block group">
            <h3
              className="text-[28px] md:text-[34px] font-medium text-foreground group-hover:text-primary transition-colors"
              style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.01em", lineHeight: 1.2 }}
            >
              What is type 2 diabetes, really?
            </h3>
            <p
              className="mt-4 text-[17px] text-foreground/75"
              style={{ fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}
            >
              A short, plain-English explainer of what's happening in your body, what the numbers mean, and what to ask your doctor.
            </p>
            <span
              className="mt-5 inline-flex items-center gap-1.5 text-[14px] text-primary underline underline-offset-4"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Read the article
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="px-6 py-24 md:py-32 border-t" style={{ borderColor: "hsl(var(--border) / 0.5)" }}>
        <div className="mx-auto max-w-[680px] text-center">
          <h2
            className="text-[32px] md:text-[44px] font-medium text-foreground"
            style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            Get a clear answer.
          </h2>
          <div className="mt-8">
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Ask a health question
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p
            className="mt-5 text-[13px] text-muted-foreground"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Free. No account needed.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Index;
