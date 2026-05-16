import { Link } from "react-router-dom";
import PageMeta from "@/components/PageMeta";

type Reviewer = {
  name: string; credentials: string; specialty: string; bio: string; initials: string;
};

const REVIEWERS: Reviewer[] = [
  { name: "Clarify Health Editorial Team", credentials: "Reviewed for plain-language accuracy", specialty: "General health education", bio: "Our in-house editors review every article for clarity, reading level, and adherence to current clinical guidelines before publication.", initials: "CH" },
];

const ReviewersPage = () => (
  <main className="min-h-screen pt-28 pb-20 px-6 bg-background">
    <PageMeta title="Our Reviewers — Clarify Health" description="The clinicians and editors who review every article on Clarify Health." canonical="/reviewers" />
    <div className="mx-auto max-w-5xl">
      <h1 className="text-4xl md:text-5xl font-semibold mb-3" style={{ fontFamily: "Fraunces, serif" }}>Our reviewers</h1>
      <p className="text-lg text-muted-foreground mb-10 max-w-2xl">Every article is checked by a person with relevant training before it goes live. We're actively expanding our reviewer panel — if you're a credentialed clinician interested in contributing, <Link to="/contact" className="text-primary underline">reach out</Link>.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {REVIEWERS.map((r) => (
          <article key={r.name} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl font-semibold" aria-hidden="true">{r.initials}</div>
              <div>
                <h2 className="font-semibold text-lg leading-tight">{r.name}</h2>
                <p className="text-sm text-muted-foreground">{r.credentials}</p>
              </div>
            </div>
            <p className="text-sm text-foreground/80 mb-3">{r.bio}</p>
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">{r.specialty}</p>
          </article>
        ))}
      </div>

      <p className="mt-12 text-sm text-muted-foreground">Want to know more about how we review? Read our <Link to="/editorial-standards" className="text-primary underline">editorial standards</Link>.</p>
    </div>
  </main>
);

export default ReviewersPage;