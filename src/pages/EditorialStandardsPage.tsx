import PageMeta from "@/components/PageMeta";

const EditorialStandardsPage = () => (
  <main className="min-h-screen pt-28 pb-20 px-6 bg-background">
    <PageMeta title="Editorial Standards — Clarify Health" description="How Clarify Health writes, reviews, updates, and corrects every article — plus our conflict-of-interest policy." canonical="/editorial-standards" />
    <article className="mx-auto max-w-3xl prose-clarify">
      <h1 className="text-4xl md:text-5xl font-semibold mb-6" style={{ fontFamily: "Fraunces, serif" }}>Our editorial process</h1>
      <p className="text-lg text-muted-foreground mb-8">Every page on Clarify Health follows the same playbook: research, write at a Grade 6–8 reading level, review for accuracy, publish, and revisit on a fixed schedule.</p>

      <Section title="Who writes our articles">
        Articles are drafted by our editorial team using current clinical guidelines from sources like the CDC, NIH, AHA, and Mayo Clinic, then reviewed by a clinician with relevant training before publication.
      </Section>
      <Section title="How often we review">
        Every article is reviewed at least once every 12 months. Time-sensitive topics (medication guidance, screening recommendations) are reviewed every 6 months. The last- and next-review dates appear on every article.
      </Section>
      <Section title="Reading level">
        We target a Grade 6–8 reading level — about 6th to 8th grade English. Jargon is either avoided or defined inline.
      </Section>
      <Section title="Sources we cite">
        We cite primary sources whenever possible: peer-reviewed studies, federal health agencies (CDC, NIH, FDA), and the major medical specialty societies. Every article lists its sources.
      </Section>
      <Section title="Conflict-of-interest policy">
        Clarify Health does not take money from pharmaceutical companies, medical device makers, insurers, or any other party with a financial stake in the topics we cover. We do not run ads. Reviewers disclose any potential conflicts and recuse themselves from related articles.
      </Section>
      <Section title="Correction policy">
        If you spot an error, use the "Report a problem" button on any article. Our editors triage every report within 5 business days. Substantive corrections are noted at the bottom of the article along with the date.
      </Section>
      <Section title="What we are not">
        Clarify Health is educational information. We are not a doctor, we do not diagnose, and we never recommend specific treatments for individuals. Always talk to a qualified clinician about your situation.
      </Section>
    </article>
  </main>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-10">
    <h2 className="text-2xl font-semibold mb-3" style={{ fontFamily: "Fraunces, serif" }}>{title}</h2>
    <p className="text-[17px] leading-[1.75] text-foreground/85">{children}</p>
  </section>
);

export default EditorialStandardsPage;