import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageMeta from "@/components/PageMeta";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [confirmAge, setConfirmAge] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || !confirmAge) {
      setError("Please confirm your age and agree to the Terms and Privacy Policy.");
      return;
    }
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: displayName || email.split("@")[0] },
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  const handleGoogle = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setError(error.message);
  };


  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 pt-32 pb-24">
        <div className="w-full max-w-[400px] text-center">
          <h1 className="mb-4 text-[30px] font-medium">
            {t("auth.checkEmail")}
          </h1>
          <p className="mb-6 text-[14px] text-muted-foreground">
            {t("auth.checkEmailSub")}
          </p>
          <Link to="/login">
            <Button variant="outline">{t("auth.login")}</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <PageMeta title="Sign Up | Clarify Health" description="Create an account to save your doctor visit notes." canonical="/signup" />
      <main className="min-h-screen flex items-center justify-center px-6 pt-32 pb-24">
        <div className="w-full max-w-[420px]">
          <span className="micro-label text-accent">Your account</span>
          <h1 className="mt-4 text-[36px] font-medium">
            {t("auth.signup")}
          </h1>
          <p className="mt-3 mb-8 text-[15px] leading-relaxed text-muted-foreground">
            {t("auth.signupSub")}
          </p>

          <form onSubmit={handleSignup} className="space-y-5 border-t border-border pt-8">
            <div>
              <Label htmlFor="name" className="text-[13px]">Name</Label>
              <Input
                id="name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Optional"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-[13px]">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-[13px]">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1"
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-2 text-[13px] text-foreground/80">
                <input
                  type="checkbox"
                  checked={confirmAge}
                  onChange={(e) => setConfirmAge(e.target.checked)}
                  className="mt-[3px]"
                />
                <span>I confirm I am 18 or older.</span>
              </label>
              <label className="flex items-start gap-2 text-[13px] text-foreground/80">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-[3px]"
                />
                <span>
                  I agree to the{" "}
                  <Link to="/legal/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
                  and{" "}
                  <Link to="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </span>
              </label>
            </div>

            {error && (
              <p className="text-destructive text-[13px]">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading || !agreeTerms || !confirmAge}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "..." : t("auth.signup")}
            </Button>
          </form>

          <div className="mt-7 flex items-center gap-4" role="separator" aria-label={t("auth.orEmail")}>
            <span className="h-px flex-1 bg-border" />
            <span className="text-[12px] uppercase tracking-wide text-muted-foreground">{t("auth.orEmail")}</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            onClick={handleGoogle}
            variant="outline"
            className="mt-5 w-full rounded-xl border-border bg-background text-[13px] font-medium text-foreground hover:bg-muted"
          >
            <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62Z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18Z" />
              <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.32Z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58Z" />
            </svg>
            {t("auth.continueWithGoogle")}
          </Button>

          <p className="mt-7 text-center text-[13px] text-muted-foreground">
            {t("auth.hasAccount")}{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t("auth.login")}
            </Link>
          </p>
        </div>
      </main>
    </>
  );
};

export default SignupPage;
