import PageMeta from "@/components/PageMeta";

const DisclaimerPage = () => {
  return (
    <main className="pt-32 pb-[64px] md:pb-[120px] px-6">
      <PageMeta
        title="Medical Disclaimer | Clarify Health"
        description="Important medical disclaimer for Clarify Health users."
        canonical="/disclaimer"
      />
      <article className="mx-auto max-w-[720px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <h1 className="text-[36px] md:text-[48px] font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Medical Disclaimer
        </h1>
        <p className="mt-3 text-[13px] text-muted-foreground">Last updated: April 20, 2026</p>

        <div
          className="mt-8 p-6 rounded-lg"
          style={{ border: "0.5px solid hsl(var(--border))", backgroundColor: "hsl(var(--section-bg))" }}
        >
          <p className="text-[15px] leading-relaxed text-foreground">
            <strong>If you are experiencing a medical emergency, call 911 (or your local emergency number) immediately. Do not use this site for emergency medical needs.</strong>
          </p>
        </div>

        <div className="mt-10 space-y-6 text-[16px] leading-[1.8] text-foreground/80">
          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">Educational use only</h2>
            <p>All information provided by Clarify Health — including articles, AI-generated answers, doctor recommendations, and wellness plans — is for <strong className="text-foreground">general informational and educational purposes only</strong>. It is not intended as, and should not be relied upon as, medical advice, diagnosis, or treatment.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">No doctor-patient relationship</h2>
            <p>Use of this Service does not create a doctor-patient or any other professional relationship between you and Clarify Health or its operators. We are not licensed medical professionals.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">Always consult a qualified clinician</h2>
            <p>Always seek the advice of your physician or other qualified healthcare provider with any questions you may have regarding a medical condition, medication, or treatment. Never disregard professional medical advice or delay seeking it because of something you read on Clarify Health.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">AI-generated content</h2>
            <p>Responses produced by our AI assistant may be inaccurate, incomplete, or out of date. AI cannot examine you, review your records, or order tests. Treat AI output as a starting point for a conversation with a clinician — never as a final answer.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">No endorsement of doctors or services</h2>
            <p>Doctor listings are pulled from third-party data (e.g., Google Places). Inclusion is not an endorsement. Verify credentials, licensure, and insurance acceptance directly with the provider before booking.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">No FDA evaluation</h2>
            <p>Statements about supplements, foods, or natural remedies have not been evaluated by the U.S. Food and Drug Administration. Content is not intended to diagnose, treat, cure, or prevent any disease.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">Acknowledgment</h2>
            <p>By using Clarify Health, you acknowledge and agree to this disclaimer and our <a href="/terms" className="text-primary hover:underline">Terms of Use</a>.</p>
          </section>
        </div>
      </article>
    </main>
  );
};

export default DisclaimerPage;