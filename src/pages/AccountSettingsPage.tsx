import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, Trash2, KeyRound, Mail } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const AccountSettingsPage = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
    if (user) setEmail(user.email ?? "");
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <main className="pt-32 px-6 text-sm text-muted-foreground">Loading…</main>;
  }

  const updateEmail = async () => {
    setBusy("email");
    const { error } = await supabase.auth.updateUser({ email });
    setBusy(null);
    if (error) toast({ title: "Could not update email", description: error.message, variant: "destructive" });
    else toast({ title: "Check your inbox", description: "Confirm the change from the link we sent." });
  };

  const updatePassword = async () => {
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    setBusy("password");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(null);
    if (error) toast({ title: "Could not update password", description: error.message, variant: "destructive" });
    else { setPassword(""); toast({ title: "Password updated" }); }
  };

  const downloadMyData = async () => {
    setBusy("download");
    try {
      const [profile, notes, wellness] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id),
        supabase.from("visit_notes").select("*").eq("user_id", user.id),
        supabase.from("wellness_plans").select("*").eq("user_id", user.id),
      ]);
      const payload = {
        exported_at: new Date().toISOString(),
        account: { id: user.id, email: user.email, created_at: user.created_at },
        profile: profile.data ?? [],
        visit_notes: notes.data ?? [],
        wellness_plans: wellness.data ?? [],
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clarify-health-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export downloaded" });
    } catch (e) {
      toast({ title: "Export failed", description: String(e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const deleteAccount = async () => {
    const ok = window.confirm(
      "Delete your account?\n\nThis permanently removes:\n• Your profile\n• All visit notes and recordings\n• Your wellness plan\n\nThis cannot be undone.",
    );
    if (!ok) return;
    setBusy("delete");
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      await signOut();
      toast({ title: "Account deleted" });
      navigate("/");
    } catch (e: any) {
      toast({ title: "Could not delete account", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageMeta title="Account Settings | Clarify Health" description="Manage your account, export your data, or delete your account." canonical="/account" />
      <main className="pt-32 pb-24 px-6">
        <div className="mx-auto max-w-[640px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <h1 className="text-[36px] font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Account Settings
          </h1>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Signed in as <span className="text-foreground">{user.email}</span>
          </p>

          <section className="mt-10 space-y-3">
            <h2 className="text-[18px] font-semibold text-foreground flex items-center gap-2"><Mail className="h-4 w-4" /> Email</h2>
            <Label htmlFor="email" className="text-[13px]">Email address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button onClick={updateEmail} disabled={busy === "email" || email === user.email}>
              Update email
            </Button>
          </section>

          <section className="mt-10 space-y-3">
            <h2 className="text-[18px] font-semibold text-foreground flex items-center gap-2"><KeyRound className="h-4 w-4" /> Password</h2>
            <Label htmlFor="pw" className="text-[13px]">New password</Label>
            <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            <Button onClick={updatePassword} disabled={busy === "password" || !password}>
              Update password
            </Button>
          </section>

          <section className="mt-10 space-y-3">
            <h2 className="text-[18px] font-semibold text-foreground flex items-center gap-2"><Download className="h-4 w-4" /> Download my data</h2>
            <p className="text-[14px] text-muted-foreground">
              Export a JSON file containing your profile, visit notes, and wellness plan.
            </p>
            <Button variant="outline" onClick={downloadMyData} disabled={busy === "download"}>
              {busy === "download" ? "Preparing…" : "Download JSON"}
            </Button>
          </section>

          <section className="mt-10 space-y-3">
            <h2 className="text-[18px] font-semibold text-destructive flex items-center gap-2"><Trash2 className="h-4 w-4" /> Delete my account</h2>
            <p className="text-[14px] text-muted-foreground">
              Permanently delete your account and all associated data: your profile, every visit
              note and recording, your wellness plan, and your login. This cannot be undone.
            </p>
            <Button variant="destructive" onClick={deleteAccount} disabled={busy === "delete"}>
              {busy === "delete" ? "Deleting…" : "Delete account"}
            </Button>
          </section>

          <p className="mt-12 text-[12px] text-muted-foreground">
            For privacy requests, see our{" "}
            <Link to="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </>
  );
};

export default AccountSettingsPage;
