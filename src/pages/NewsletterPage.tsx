import { Link } from "react-router-dom";
import { Check, Mail, Shield, BookOpen } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";
import PageMeta from "@/components/PageMeta";

const NewsletterPage = () => (
  <main className="min-h-screen pt-28 pb-20 px-6 bg-background">
    <PageMeta title="Newsletter — Clarify Health" description="Plain-English health explainers in your inbox. One email a week, no spam, easy to unsubscribe." canonical="/newsletter" />
    <div className="mx-auto max-w-2xl text-center">
      <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
      <h1 className="text-4xl md:text-5xl font-semibold mb-3" style={{ fontFamily: "Fraunces, serif" }}>Health, in plain English — weekly</h1>
      <p className="text-lg text-muted-foreground mb-8">One short email a week with our newest explainers, plus a single "questions to ask your doctor" prompt you can actually use.</p>
      <div className="rounded-2xl border border-border bg-card p-6 mb-10 shadow-sm">
        <NewsletterSignup />
      </div>
      <ul className="text-left space-y-3 max-w-md mx-auto">
        {[
          { icon: BookOpen, text: "One email per week. No fluff, no ads." },
          { icon: Shield, text: "We never share your email. Unsubscribe in one click." },
          { icon: Check, text: "Double opt-in: confirm by email before we ever send anything." },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3 text-[15px]"><Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" /> {text}</li>
        ))}
      </ul>
      <p className="mt-10 text-sm text-muted-foreground">See our <Link to="/privacy" className="text-primary underline">privacy policy</Link>.</p>
    </div>
  </main>
);

export default NewsletterPage;