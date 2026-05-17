import LegalLayout from "./_LegalLayout";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-[22px] font-semibold text-foreground mb-2 mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>
    {children}
  </h2>
);

const clearConsent = () => {
  try {
    localStorage.removeItem("clarify_cookie_consent");
    window.location.reload();
  } catch { /* noop */ }
};

const CookiesPage = () => (
  <LegalLayout
    title="Cookie Policy"
    description="What cookies and local storage [COMPANY NAME] uses and how to opt out."
    canonical="/legal/cookies"
  >
    <section>
      <p>
        This Cookie Policy explains how <strong className="text-foreground">[COMPANY NAME]</strong>{" "}
        uses cookies and similar technologies (such as browser local storage) when you use the
        Service.
      </p>
    </section>

    <section>
      <H2>1. What we use</H2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground">Essential</strong>: required for the Service to
          function — keeping you signed in, remembering your cookie-consent choice, and
          enforcing security and rate limits.
        </li>
        <li>
          <strong className="text-foreground">Preferences (local storage)</strong>: language
          selection, accessibility settings, and recent activity stored only in your browser.
        </li>
        <li>
          <strong className="text-foreground">Analytics (optional)</strong>: aggregated usage
          analytics, only loaded after you accept non-essential cookies.
        </li>
      </ul>
      <p className="mt-2">We do not use advertising or cross-site tracking cookies.</p>
    </section>

    <section>
      <H2>2. Your choices</H2>
      <p>
        On your first visit, you can Accept, Reject, or Customize non-essential cookies. You can
        change your choice at any time:
      </p>
      <button
        onClick={clearConsent}
        className="mt-3 inline-flex items-center px-4 py-2 text-[13px] font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Reset cookie preferences
      </button>
      <p className="mt-3">
        You can also clear cookies and local storage at any time through your browser settings.
      </p>
    </section>

    <section>
      <H2>3. Contact</H2>
      <p>Questions: <a href="mailto:[CONTACT EMAIL]" className="text-primary hover:underline">[CONTACT EMAIL]</a>.</p>
    </section>
  </LegalLayout>
);

export default CookiesPage;
