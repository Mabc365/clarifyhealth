import LegalLayout from "./_LegalLayout";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-[22px] font-semibold text-foreground mb-2 mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>
    {children}
  </h2>
);

const TermsPage = () => (
  <LegalLayout
    title="Terms of Service"
    description="The terms governing your use of Clarify Health."
    canonical="/legal/terms"
  >
    <section>
      <H2>1. Acceptance of terms</H2>
      <p>
        By creating an account or using <strong className="text-foreground">Clarify Health</strong>
        {" "}("we", "us", "the Service") — an independent educational project run by an individual,
        not a registered business entity — you agree to these Terms of Service and our{" "}
        <a href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</a>. If
        you do not agree, do not use the Service.
      </p>
    </section>

    <section>
      <H2>2. Eligibility</H2>
      <p>
        You must be at least 18 years old, or 13 or older with the verified consent of a parent
        or legal guardian, to use the Service. The Service is not intended for children under 13.
      </p>
    </section>

    <section>
      <H2>3. Account responsibilities</H2>
      <p>
        You are responsible for keeping your login credentials secure and for all activity under
        your account. Notify us immediately at <a href="mailto:mustafa@clarifyhealth.co" className="text-primary hover:underline">mustafa@clarifyhealth.co</a>{" "}
        of any unauthorized access.
      </p>
    </section>

    <section>
      <H2>4. Acceptable use</H2>
      <p>You agree not to:</p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li>Submit information you are not authorized to share, including another person's protected health information, regulated financial data, or other confidential data.</li>
        <li>Use the Service for unlawful, harmful, fraudulent, or deceptive purposes.</li>
        <li>Reverse engineer, scrape, or attempt to extract source code or model weights.</li>
        <li>Interfere with or disrupt the Service, or bypass rate limits.</li>
        <li>Use the Service to build a competing product.</li>
      </ul>
    </section>

    <section>
      <H2>5. AI output disclaimer</H2>
      <p>
        The Service uses AI to generate outputs. AI outputs are{" "}
        <strong className="text-foreground">not professional advice</strong> and must not be
        relied on as a substitute for advice from a licensed professional. In particular, AI
        outputs are <strong className="text-foreground">not medical, legal, or financial
        advice</strong>. AI outputs may be inaccurate, incomplete, or out of date. Always
        consult a qualified professional for decisions affecting your health, legal rights, or
        finances.
      </p>
      <p className="mt-2">
        See our <a href="/legal/ai-disclaimer" className="text-primary hover:underline">AI Disclaimer</a> for more.
      </p>
    </section>

    <section>
      <H2>6. Intellectual property and license to inputs</H2>
      <p>
        You retain ownership of the content you submit ("Inputs"). You grant us a worldwide,
        non-exclusive, royalty-free license to process your Inputs solely to provide and improve
        the Service. We and our licensors own all rights in the Service itself, including
        software, designs, and trademarks.
      </p>
    </section>

    <section>
      <H2>7. No warranty — "as is"</H2>
      <p>
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION THE IMPLIED WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT
        WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT AI OUTPUTS WILL BE
        ACCURATE.
      </p>
    </section>

    <section>
      <H2>8. Limitation of liability</H2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL Clarify Health, ITS AFFILIATES,
        OR ITS LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
        PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, ARISING OUT OF OR RELATED TO YOUR
        USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM WILL NOT EXCEED THE GREATER OF
        ONE HUNDRED U.S. DOLLARS ($100) OR THE AMOUNTS YOU PAID US IN THE TWELVE (12) MONTHS
        BEFORE THE CLAIM.
      </p>
    </section>

    <section>
      <H2>9. Indemnification</H2>
      <p>
        You agree to indemnify and hold harmless Clarify Health and its affiliates from any
        claims, damages, or expenses (including reasonable attorneys' fees) arising from your
        Inputs, your use of the Service, or your breach of these Terms.
      </p>
    </section>

    <section>
      <H2>10. Termination</H2>
      <p>
        You may delete your account at any time from Account Settings. We may suspend or
        terminate your access if you violate these Terms or for any other reason. Sections that
        by their nature should survive termination will survive.
      </p>
    </section>

    <section>
      <H2>11. Governing law</H2>
      <p>
        These Terms are governed by the laws of the State of <strong className="text-foreground">New Jersey</strong>,
        United States, without regard to conflict-of-laws principles.
      </p>
    </section>

    <section>
      <H2>12. Dispute resolution — arbitration and class action waiver</H2>
      <p>
        Any dispute arising out of or relating to these Terms or the Service will be resolved by
        binding individual arbitration administered by the American Arbitration Association under
        its Consumer Arbitration Rules. The seat of arbitration will be in <strong className="text-foreground">New Jersey</strong>.
        <strong className="text-foreground"> YOU AND Clarify Health AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN AN INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE ACTION.</strong>{" "}
        You may opt out of arbitration within 30 days of accepting these Terms by emailing{" "}
        <a href="mailto:mustafa@clarifyhealth.co" className="text-primary hover:underline">mustafa@clarifyhealth.co</a>.
      </p>
    </section>

    <section>
      <H2>13. Changes to terms</H2>
      <p>We may update these Terms. We will post the updated version with a new "Last Updated" date. Continued use after changes constitutes acceptance.</p>
    </section>

    <section>
      <H2>14. Contact</H2>
      <p>Questions: <a href="mailto:mustafa@clarifyhealth.co" className="text-primary hover:underline">mustafa@clarifyhealth.co</a>.</p>
    </section>
  </LegalLayout>
);

export default TermsPage;
