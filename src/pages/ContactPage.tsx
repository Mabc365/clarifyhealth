import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PageMeta from "@/components/PageMeta";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) { toast({ title: "Email and message are required", variant: "destructive" }); return; }
    if (message.length > 4000) { toast({ title: "Message too long", variant: "destructive" }); return; }
    setLoading(true);
    const html = `<h2>New contact form message</h2>
      <p><strong>Name:</strong> ${escapeHtml(name || "(not given)")}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`;
    const { error } = await supabase.functions.invoke("send-email", {
      body: { to: "clarifyhlth@gmail.com", subject: `[Contact] ${name || email}`, html },
    });
    setLoading(false);
    if (error) { toast({ title: "Couldn't send — please try again.", variant: "destructive" }); return; }
    toast({ title: "Thanks — we'll get back to you." });
    setName(""); setEmail(""); setMessage("");
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-6 bg-background">
      <PageMeta title="Contact — Clarify Health" description="Get in touch with the Clarify Health team. We read every message." canonical="/contact" />
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-semibold mb-3" style={{ fontFamily: "Fraunces, serif" }}>Get in touch</h1>
        <p className="text-lg text-muted-foreground mb-8">Questions, story ideas, partnerships, press, or you're a clinician interested in reviewing — we'd love to hear from you.</p>
        <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Or email us directly: <a href="mailto:clarifyhlth@gmail.com" className="text-primary underline">clarifyhlth@gmail.com</a></p>
        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <Field label="Your name (optional)"><input value={name} onChange={(e)=>setName(e.target.value)} maxLength={100} className={inputCls} /></Field>
          <Field label="Your email"><input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} maxLength={255} className={inputCls} /></Field>
          <Field label="Message"><textarea required value={message} onChange={(e)=>setMessage(e.target.value)} rows={6} maxLength={4000} className={inputCls} placeholder="What's on your mind?" /></Field>
          <Button type="submit" disabled={loading} className="w-full">{loading && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}Send message</Button>
          <p className="text-xs text-muted-foreground">Please don't include any personal health information. We do not provide medical advice.</p>
        </form>
      </div>
    </main>
  );
};

const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block"><span className="text-sm font-medium mb-1.5 block">{label}</span>{children}</label>
);
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));

export default ContactPage;