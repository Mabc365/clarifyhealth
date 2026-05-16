import { useState } from "react";
import { ThumbsUp, ThumbsDown, Minus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props { slug: string }

type Rating = "yes" | "somewhat" | "no";

const ArticleFeedback = ({ slug }: Props) => {
  const { lang } = useLanguage();
  const [rating, setRating] = useState<Rating | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const choose = async (r: Rating) => {
    setRating(r);
    await supabase.from("article_feedback").insert({ article_slug: slug, rating: r, language: lang });
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;
    await supabase.from("article_feedback").insert({ article_slug: slug, rating, comment: comment.trim(), language: lang });
    setSubmitted(true);
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6 mt-12 no-print" aria-labelledby="feedback-heading">
      <h2 id="feedback-heading" className="text-lg font-semibold mb-3">Was this helpful?</h2>
      {!rating ? (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => choose("yes")} variant="outline" className="rounded-full"><ThumbsUp className="h-4 w-4 mr-1.5" /> Yes</Button>
          <Button onClick={() => choose("somewhat")} variant="outline" className="rounded-full"><Minus className="h-4 w-4 mr-1.5" /> Somewhat</Button>
          <Button onClick={() => choose("no")} variant="outline" className="rounded-full"><ThumbsDown className="h-4 w-4 mr-1.5" /> No</Button>
        </div>
      ) : submitted ? (
        <p className="text-[15px] text-muted-foreground flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Thanks for the feedback.</p>
      ) : (
        <form onSubmit={submitComment} className="space-y-3">
          <p className="text-[15px] text-muted-foreground">Thanks. Want to tell us more? (optional)</p>
          <label htmlFor="fb-comment" className="sr-only">Your comment</label>
          <Textarea id="fb-comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="What could we make clearer?" />
          <div className="flex gap-2">
            <Button type="submit" disabled={!comment.trim()} className="bg-primary hover:bg-primary/90">Send</Button>
            <Button type="button" variant="ghost" onClick={() => setSubmitted(true)}>Skip</Button>
          </div>
        </form>
      )}
    </section>
  );
};

export default ArticleFeedback;