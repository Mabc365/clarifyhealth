import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageMeta from "@/components/PageMeta";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <>
      <PageMeta title="Log In | Clarify Health" description="Log in to access your doctor visit notes and health journal." canonical="/login" />
      <main className="min-h-screen flex items-center justify-center px-6 pt-32 pb-24">
        <div className="w-full max-w-[420px]">
          <span className="micro-label text-accent">Your account</span>
          <h1 className="mt-4 text-[36px] font-medium">
            {t("auth.login")}
          </h1>
          <p className="mt-3 mb-8 text-[15px] leading-relaxed text-muted-foreground">
            {t("auth.loginSub")}
          </p>

          <form onSubmit={handleLogin} className="space-y-5 border-t border-border pt-8">
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
                className="mt-1"
              />
            </div>

            {error && (
              <p className="text-destructive text-[13px]">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "..." : t("auth.login")}
            </Button>
          </form>

          <p className="mt-7 text-center text-[13px] text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              {t("auth.signup")}
            </Link>
          </p>
        </div>
      </main>
    </>
  );
};

export default LoginPage;
