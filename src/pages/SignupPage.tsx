import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
        emailRedirectTo: window.location.origin,
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

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 pt-20 pb-24">
        <div className="w-full max-w-[400px] text-center">
          <h1
            className="text-[28px] font-medium mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("auth.checkEmail")}
          </h1>
          <p className="text-muted-foreground text-[14px] mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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
      <main className="min-h-screen flex items-center justify-center px-6 pt-20 pb-24">
        <div className="w-full max-w-[400px]">
          <h1
            className="text-[32px] font-medium mb-2"
            style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.5px" }}
          >
            {t("auth.signup")}
          </h1>
          <p className="text-muted-foreground text-[14px] mb-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {t("auth.signupSub")}
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
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
              <label className="flex items-start gap-2 text-[13px] text-foreground/80" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <input
                  type="checkbox"
                  checked={confirmAge}
                  onChange={(e) => setConfirmAge(e.target.checked)}
                  className="mt-[3px]"
                />
                <span>I confirm I am 18 or older.</span>
              </label>
              <label className="flex items-start gap-2 text-[13px] text-foreground/80" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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

          <p className="mt-6 text-center text-[13px] text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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
