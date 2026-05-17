import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "clarify_cookie_consent";

type Consent = {
  essential: true;
  preferences: boolean;
  analytics: boolean;
  decidedAt: number;
};

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

function writeConsent(c: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch { /* noop */ }
}

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [prefs, setPrefs] = useState({ preferences: true, analytics: false });

  useEffect(() => {
    if (!readConsent()) setVisible(true);
  }, []);

  const save = (next: { preferences: boolean; analytics: boolean }) => {
    writeConsent({ essential: true, ...next, decidedAt: Date.now() });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-[440px] z-[100] rounded-lg shadow-lg"
      style={{
        background: "hsl(var(--background))",
        border: "0.5px solid hsl(var(--border))",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div className="p-5">
        <h2 className="text-[15px] font-semibold text-foreground">We value your privacy</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          We use essential cookies to run the Service. With your consent, we also use preferences
          and aggregate analytics. See our{" "}
          <Link to="/legal/cookies" className="text-primary hover:underline">Cookie Policy</Link>
          {" "}and{" "}
          <Link to="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>

        {customize && (
          <div className="mt-4 space-y-2 text-[13px]">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" checked disabled /> Essential (required)
            </label>
            <label className="flex items-center gap-2 text-foreground">
              <input
                type="checkbox"
                checked={prefs.preferences}
                onChange={(e) => setPrefs((p) => ({ ...p, preferences: e.target.checked }))}
              />
              Preferences (language, accessibility)
            </label>
            <label className="flex items-center gap-2 text-foreground">
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
              />
              Analytics (anonymous usage)
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => save({ preferences: true, analytics: true })}
            className="px-4 py-2 text-[13px] font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Accept all
          </button>
          <button
            onClick={() => save({ preferences: false, analytics: false })}
            className="px-4 py-2 text-[13px] font-medium rounded text-foreground hover:bg-muted"
            style={{ border: "0.5px solid hsl(var(--border))" }}
          >
            Reject non-essential
          </button>
          {!customize ? (
            <button
              onClick={() => setCustomize(true)}
              className="px-4 py-2 text-[13px] font-medium rounded text-muted-foreground hover:text-foreground"
            >
              Customize
            </button>
          ) : (
            <button
              onClick={() => save(prefs)}
              className="px-4 py-2 text-[13px] font-medium rounded text-foreground hover:bg-muted"
              style={{ border: "0.5px solid hsl(var(--border))" }}
            >
              Save choices
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
