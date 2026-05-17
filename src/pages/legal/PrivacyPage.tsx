import LegalLayout from "./_LegalLayout";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-[22px] font-semibold text-foreground mb-2 mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>
    {children}
  </h2>
);

const PrivacyPage = () => (
  <LegalLayout
    title="Privacy Policy"
    description="How [COMPANY NAME] collects, processes, and protects your information."
    canonical="/legal/privacy"
  >
    <section>
      <p>
        This Privacy Policy explains how <strong className="text-foreground">[COMPANY NAME]</strong>{" "}
        ("we", "us", "our") collects, uses, and protects information when you use our website,
        mobile app, and AI-powered features (collectively, the "Service"). We are based in the
        United States but the Service is accessible globally.
      </p>
    </section>

    <section>
      <H2>1. Information we collect</H2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong className="text-foreground">Account information:</strong> email address and a hashed password when you create an account. Optional display name.</li>
        <li><strong className="text-foreground">Transient user inputs:</strong> text, questions, photos, location, health-related details, and financial details you submit to AI features. These inputs are processed in real time and are <strong>not persisted</strong> to our database.</li>
        <li><strong className="text-foreground">Technical data:</strong> IP address, browser type, device, and pages visited (used for security, rate limiting, and aggregate analytics).</li>
        <li><strong className="text-foreground">Local storage:</strong> language preference, cookie consent, and recent activity stored only in your browser.</li>
      </ul>
    </section>

    <section>
      <H2>2. How we process information</H2>
      <ul className="list-disc pl-6 space-y-2">
        <li>To provide AI features, your inputs are sent to third-party AI providers for inference and a response is returned to you. Inputs are not stored on our servers after the response is generated.</li>
        <li>To operate, secure, and improve the Service.</li>
        <li>To send transactional emails (account confirmation, password reset).</li>
        <li>To detect abuse and enforce rate limits.</li>
      </ul>
    </section>

    <section>
      <H2>3. Third-party processors (subprocessors)</H2>
      <p>We share limited data with vendors who help us operate the Service:</p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li><strong className="text-foreground">AI providers:</strong> [LIST AI PROVIDERS — e.g. Anthropic, Google AI, OpenAI]. Their data-use policies apply to inputs sent for inference.</li>
        <li><strong className="text-foreground">Authentication and database:</strong> [LIST AUTH/DB PROVIDER].</li>
        <li><strong className="text-foreground">Hosting:</strong> [LIST HOSTING PROVIDER].</li>
        <li><strong className="text-foreground">Transactional email:</strong> [LIST EMAIL PROVIDER].</li>
      </ul>
      <p className="mt-2">These providers are contractually required to protect your data and process it only as instructed.</p>
    </section>

    <section>
      <H2>4. We do not sell or share your personal information</H2>
      <p>
        We do not sell, rent, or trade your personal information, and we do not "share" it for
        cross-context behavioral advertising as those terms are defined by the CCPA/CPRA. We do
        not use your inputs to train third-party AI models beyond what is necessary to generate
        your response.
      </p>
      <p className="mt-2">
        You may exercise your right to opt out at any time at{" "}
        <a href="/legal/do-not-sell" className="text-primary hover:underline">Do Not Sell or Share My Personal Information</a>.
      </p>
    </section>

    <section>
      <H2>5. Your rights — California (CCPA/CPRA)</H2>
      <p>If you are a California resident, you have the right to:</p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li>Know what personal information we collect and how we use it.</li>
        <li>Request deletion of your personal information.</li>
        <li>Request correction of inaccurate information.</li>
        <li>Opt out of sale or sharing of personal information (we do not sell or share).</li>
        <li>Non-discrimination for exercising your rights.</li>
      </ul>
      <p className="mt-2">To exercise a right, email <a href="mailto:[CONTACT EMAIL]" className="text-primary hover:underline">[CONTACT EMAIL]</a>.</p>
    </section>

    <section>
      <H2>6. Your rights — EU / UK (GDPR)</H2>
      <p>If you are in the European Economic Area or United Kingdom, you have the right to:</p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li>Access your personal data.</li>
        <li>Rectify inaccurate data.</li>
        <li>Erase your data ("right to be forgotten").</li>
        <li>Port your data to another service.</li>
        <li>Object to or restrict processing.</li>
        <li>Lodge a complaint with your local supervisory authority.</li>
      </ul>
      <p className="mt-2">Our legal bases for processing are: performance of a contract, your consent, and our legitimate interests in operating a secure service.</p>
    </section>

    <section>
      <H2>7. Data retention</H2>
      <p>
        Account data is retained until you delete your account. User inputs submitted to AI
        features are not retained after the response is generated. Aggregated, anonymized
        analytics may be retained indefinitely.
      </p>
    </section>

    <section>
      <H2>8. Children's privacy (COPPA)</H2>
      <p>
        The Service is not directed to children under 13. We do not knowingly collect personal
        information from children under 13. If you believe a child has provided us information,
        contact us and we will delete it.
      </p>
    </section>

    <section>
      <H2>9. Sensitive data: health and financial</H2>
      <p>
        The Service is not a healthcare provider and is <strong className="text-foreground">not a
        covered entity</strong> under HIPAA. The Service is not a financial institution under
        GLBA. Do not submit information you do not want processed. State laws such as
        Washington's My Health My Data Act and California's CMIA may apply to certain health
        information you choose to submit.
      </p>
    </section>

    <section>
      <H2>10. Security</H2>
      <p>We use industry-standard encryption in transit (TLS) and at rest. No system is 100% secure.</p>
    </section>

    <section>
      <H2>11. Cookies</H2>
      <p>
        See our <a href="/legal/cookies" className="text-primary hover:underline">Cookie Policy</a>{" "}
        for details on cookies and browser local storage we use, and how to opt out.
      </p>
    </section>

    <section>
      <H2>12. International transfers</H2>
      <p>
        We are based in the United States. If you access the Service from outside the US, your
        information will be transferred to and processed in the US.
      </p>
    </section>

    <section>
      <H2>13. Changes</H2>
      <p>We may update this policy. Material changes will be announced on the Service. Continued use after changes constitutes acceptance.</p>
    </section>

    <section>
      <H2>14. Contact</H2>
      <p>
        Privacy requests: <a href="mailto:[CONTACT EMAIL]" className="text-primary hover:underline">[CONTACT EMAIL]</a>.
      </p>
    </section>
  </LegalLayout>
);

export default PrivacyPage;
