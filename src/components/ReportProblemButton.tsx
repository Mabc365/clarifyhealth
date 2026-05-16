import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const TYPES = ["Factual error", "Outdated info", "Unclear language", "Broken link", "Other"];

const ReportProblemButton = ({ slug }: { slug: string }) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(TYPES[0]);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.length > 2000) {
      toast({ title: "Please describe the problem (under 2000 chars).", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.functions.invoke("report-problem", {
      body: { article_slug: slug, problem_type: type, description: description.trim(), reporter_email: email.trim() || undefined },
    });
    setLoading(false);
    if (error) { toast({ title: "Couldn't send report — please try again.", variant: "destructive" }); return; }
    toast({ title: "Thanks — our editors will review this." });
    setOpen(false); setDescription(""); setEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full"><Flag className="h-4 w-4 mr-1.5" /> Report a problem</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Report a problem with this page</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">What's wrong?</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Describe it</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={2000} required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Tell us what we got wrong or what's missing." />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Your email <span className="text-muted-foreground font-normal">(optional, only if you want a reply)</span></label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="you@example.com" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />} Send report
          </Button>
          <p className="text-xs text-muted-foreground">We don't collect any health information. Reports go to our editorial team.</p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportProblemButton;