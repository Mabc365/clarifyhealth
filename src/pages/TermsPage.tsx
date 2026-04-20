import PageMeta from "@/components/PageMeta";

const TermsPage = () => {
  return (
    <main className="pt-32 pb-[64px] md:pb-[120px] px-6">
      <PageMeta
        title="Terms of Use | Clarify Health"
        description="The terms governing your use of Clarify Health."
        canonical="/terms"
      />
      <article className="mx-auto max-w-[720px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <h1 className="text-[36px] md:text-[48px] font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Terms of Use
        </h1>
        <p className="mt-3 text-[13px] text-muted-foreground">Last updated: April 20, 2026</p>

        <div className="mt-10 space-y-6 text-[16px] leading-[1.8] text-foreground/80">
          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">1. Acceptance</h2>
            <p>By accessing or using clarifyhealth.co (the "Service"), you agree to these Terms. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">2. Not medical advice</h2>
            <p>Clarify Health provides <strong className="text-foreground">general health education only</strong>. We are not your doctor. Content (including AI-generated responses) is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you have. Never disregard professional advice or delay seeking it because of something you read here. <strong className="text-foreground">If you think you have a medical emergency, call 911 or your local emergency number immediately.</strong></p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">3. Eligibility</h2>
            <p>You must be at least 13 years old to use the Service. If you are under 18, you must have permission from a parent or guardian.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">4. Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your login credentials and all activity under your account. Notify us immediately of any unauthorized use.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">5. Acceptable use</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>No abuse, scraping, automated querying, or attempts to bypass rate limits.</li>
              <li>No use that violates law or the rights of others.</li>
              <li>No submission of another person's medical information without consent.</li>
              <li>No reverse engineering of the AI or attempts to extract system prompts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">6. AI-generated content</h2>
            <p>Our AI assistant produces responses algorithmically. Responses may be inaccurate, incomplete, or out of date. Verify any health-related information with a licensed clinician before acting on it.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">7. Intellectual property</h2>
            <p>All site content, branding, code, and design are owned by Clarify Health or its licensors and are protected by copyright and trademark laws. You may view and share content for personal, non-commercial use with attribution. You retain ownership of content you submit but grant us a license to store and process it to operate the Service.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">8. Third-party services</h2>
            <p>Links to external sites (Healthgrades, Zocdoc, Google Maps, etc.) are provided for convenience. We do not endorse and are not responsible for their content or practices.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">9. Disclaimers</h2>
            <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR MEDICALLY ACCURATE.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">10. Limitation of liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, CLARIFY HEALTH AND ITS OPERATORS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, REVENUE, OR HEALTH OUTCOMES, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY WILL NOT EXCEED USD $100.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">11. Indemnification</h2>
            <p>You agree to indemnify and hold harmless Clarify Health from any claims arising from your use of the Service or violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">12. Termination</h2>
            <p>We may suspend or terminate access at any time for any reason, including violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">13. Governing law</h2>
            <p>These Terms are governed by the laws of the State of New Jersey, USA, without regard to conflict of law principles. Disputes will be resolved in the state or federal courts located in New Jersey.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">14. Changes</h2>
            <p>We may revise these Terms. Updated terms take effect when posted. Continued use means acceptance.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-foreground mb-2">15. Contact</h2>
            <p>Email <a href="mailto:legal@clarifyhealth.co" className="text-primary hover:underline">legal@clarifyhealth.co</a>.</p>
          </section>
        </div>
      </article>
    </main>
  );
};

export default TermsPage;