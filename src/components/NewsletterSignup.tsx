import { useState } from "react";
import { Mail, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("newsletter-subscribe", { body: { email } });
    setLoading(false);
    if (error || (data as any)?.error) {
      toast({ title: "Couldn't sign up", description: "Please try again later.", variant: "destructive" });
      return;
    }
    setDone(true);
    toast({ title: "Check your inbox", description: "Click the confirmation link to finish signing up." });
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <Check className="h-6 w-6 mx-auto mb-2 text-primary" aria-hidden="true" />
        <p className="text-[17px]">Check your inbox to confirm your subscription.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-2 mb-2 text-primary">
        <Mail className="h-5 w-5" aria-hidden="true" />
        <h3 className="text-xl font-semibold" style={{ fontFamily: "Fraunces, serif" }}>One plain-English health explainer in your inbox each week</h3>
      </div>
      <p className="text-[15px] text-muted-foreground mb-4">No spam. Unsubscribe anytime. We'll never share your email.</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <Input
          id="newsletter-email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
        </Button>
      </div>
    </form>
  );
};

export default NewsletterSignup;