import PageMeta from "@/components/PageMeta";

const PrivacyPage = () => {
  return (
    <main className="pt-32 pb-[64px] md:pb-[120px] px-6">
      <PageMeta
        title="Privacy Policy | Clarify Health"
        description="How Clarify Health collects, uses, and protects your information."
        canonical="/privacy"
      />
      <article className="mx-auto max-w-[720px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <h1 className="text-[36px] md:text-[48px] font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Privacy Policy
        </h1>
        <p className="mt-3 text-[13px] text-muted-foreground">Last updated: April 20, 2026</p>

        <div className="mt-10 space-y-6 text-[16px] leading-[1.8] text-foreground/80">
          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">1. Who we are</h2>
            <p>Clarify Health ("we", "us", "our") operates clarifyhealth.co and provides plain-language health education. We are an independent educational project, not a healthcare provider.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">2. Information we collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Account information</strong> (optional): email address and display name when you sign up.</li>
              <li><strong className="text-foreground">Content you create</strong>: visit notes, wellness preferences, and questions you submit to our AI assistant.</li>
              <li><strong className="text-foreground">Search queries</strong>: anonymized symptom descriptions and ZIP codes submitted to "Find a Doctor" are stored without personal identifiers for analytics.</li>
              <li><strong className="text-foreground">Technical data</strong>: IP address, browser type, device, and pages visited (used for security and aggregate analytics).</li>
              <li><strong className="text-foreground">Local storage</strong>: language preference and recent question history stored only in your browser.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">3. How we use information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve the service.</li>
              <li>Generate AI responses to your questions (questions are sent to our AI provider for processing).</li>
              <li>Send transactional emails (account confirmation, password reset).</li>
              <li>Detect abuse and enforce rate limits.</li>
              <li>Aggregate, anonymized analytics to understand which topics are most useful.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">4. We do not sell your data</h2>
            <p>We do not sell, rent, or trade your personal information. We do not use your health questions to train third-party AI models.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">5. Service providers</h2>
            <p>We share limited data with vendors who help us operate the site:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong className="text-foreground">Supabase</strong> — database, authentication, file storage.</li>
              <li><strong className="text-foreground">Anthropic / Google AI</strong> — AI question answering.</li>
              <li><strong className="text-foreground">Google Places</strong> — doctor lookup.</li>
              <li><strong className="text-foreground">Resend</strong> — transactional email delivery.</li>
            </ul>
            <p className="mt-2">These providers are contractually required to protect your data.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">6. Your rights</h2>
            <p>You may request access, correction, or deletion of your personal data by contacting us. EU/UK residents have rights under GDPR; California residents have rights under the CCPA, including the right to know, delete, and opt out of sale (we do not sell data).</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">7. Children</h2>
            <p>Clarify Health is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us information, contact us and we will delete it.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">8. HIPAA notice</h2>
            <p>Clarify Health is <strong className="text-foreground">not a covered entity</strong> under HIPAA. Information you submit is not Protected Health Information (PHI) under HIPAA, but we treat it with care. Do not submit information you do not want stored.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">9. Data retention & security</h2>
            <p>We retain account data while your account is active. Anonymized search analytics may be retained indefinitely. We use industry-standard encryption in transit (TLS) and at rest. No system is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">10. Cookies</h2>
            <p>We use essential cookies and browser local storage to keep you signed in and remember preferences. We do not use advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">11. Changes</h2>
            <p>We may update this policy. Material changes will be announced on the site. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">12. Contact</h2>
            <p>Questions? Email <a href="mailto:privacy@clarifyhealth.co" className="text-primary hover:underline">privacy@clarifyhealth.co</a>.</p>
          </section>
        </div>
      </article>
    </main>
  );
};

export default PrivacyPage;