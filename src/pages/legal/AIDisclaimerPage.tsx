import LegalLayout from "./_LegalLayout";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-[22px] font-semibold text-foreground mb-2 mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>
    {children}
  </h2>
);

const AIDisclaimerPage = () => (
  <LegalLayout
    title="AI Disclaimer & Acceptable Use"
    description="Important notice about AI-generated outputs and acceptable use of [COMPANY NAME]."
    canonical="/legal/ai-disclaimer"
  >
    <section
      className="rounded-lg p-5"
      style={{ background: "hsl(var(--section-bg))", border: "0.5px solid hsl(var(--border))" }}
    >
      <p className="text-foreground font-semibold">
        AI outputs are not professional advice. They are not medical advice, legal advice, or
        financial advice. Always consult a qualified, licensed professional for decisions about
        your health, legal rights, or finances.
      </p>
    </section>

    <section>
      <H2>What our AI does</H2>
      <p>
        We use third-party AI models to generate responses based on the information you submit.
        Responses are generated automatically and may be inaccurate, incomplete, or out of date.
        AI models can also "hallucinate" — produce confident-sounding answers that are wrong.
      </p>
    </section>

    <section>
      <H2>What you should not submit</H2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Information you are not authorized to share — including another person's medical, financial, or personal data.</li>
        <li>Protected Health Information (PHI) covered by HIPAA, or information you would not be comfortable processing through a third-party AI vendor.</li>
        <li>Government-issued ID numbers, full payment card numbers, or other regulated identifiers.</li>
        <li>Anything you are legally or contractually obligated to keep confidential.</li>
      </ul>
    </section>

    <section>
      <H2>How your inputs are handled</H2>
      <p>
        Inputs you submit to AI features are sent to our AI providers for inference and returned
        to you. We do not persist your inputs in our database after the response is generated.
        See the <a href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</a>{" "}
        for full details, including our list of AI subprocessors.
      </p>
    </section>

    <section>
      <H2>By using AI features, you agree:</H2>
      <ul className="list-disc pl-6 space-y-2">
        <li>You will not rely on AI outputs as professional advice.</li>
        <li>You will independently verify any factual or actionable information before acting on it.</li>
        <li>You are responsible for the content you submit and for compliance with applicable laws.</li>
      </ul>
    </section>

    <section>
      <H2>Contact</H2>
      <p>
        Questions: <a href="mailto:[CONTACT EMAIL]" className="text-primary hover:underline">[CONTACT EMAIL]</a>.
      </p>
    </section>
  </LegalLayout>
);

export default AIDisclaimerPage;
