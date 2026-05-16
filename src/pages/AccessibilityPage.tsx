import PageMeta from "@/components/PageMeta";
import { Link } from "react-router-dom";

const AccessibilityPage = () => (
  <main className="min-h-screen pt-28 pb-20 px-6 bg-background">
    <PageMeta title="Accessibility Statement — Clarify Health" description="Clarify Health's commitment to WCAG 2.2 AA accessibility, and how to report barriers." canonical="/accessibility" />
    <article className="mx-auto max-w-3xl">
      <h1 className="text-4xl md:text-5xl font-semibold mb-6" style={{ fontFamily: "Fraunces, serif" }}>Accessibility Statement</h1>
      <p className="text-lg text-muted-foreground mb-8">Clarify Health is committed to providing a website that is accessible to the widest possible audience, regardless of technology or ability.</p>

      <Block title="Our commitment">We target conformance with WCAG 2.2 Level AA across the entire site. We test new pages with automated tools and review with keyboard-only navigation and screen readers before release.</Block>
      <Block title="What we've built in">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Full keyboard navigation, including a "skip to content" link.</li>
          <li>Semantic landmarks (header, nav, main, footer) on every page.</li>
          <li>Color choices that meet WCAG AA contrast in default and dark themes, tested against deuteranopia, protanopia, and tritanopia simulations.</li>
          <li>OpenDyslexic font option, toggleable on every article.</li>
          <li>Adjustable text size (A− / A / A+) on article pages.</li>
          <li>Audio narration ("Listen") on every article, with playback-speed control.</li>
          <li>Reading level held to Grade 6–8 across all explainers.</li>
          <li>Visible focus rings; no information conveyed by color alone.</li>
        </ul>
      </Block>
      <Block title="Known limitations">We're a small team and we publish frequently. If you find a barrier — missing alt text, a form that doesn't work with your screen reader, a contrast issue — please tell us. We treat accessibility bugs as priority.</Block>
      <Block title="Report a barrier">Email <a href="mailto:clarifyhlth@gmail.com" className="text-primary underline">clarifyhlth@gmail.com</a> or use the <Link to="/contact" className="text-primary underline">contact form</Link>. We aim to acknowledge accessibility reports within 2 business days.</Block>
      <Block title="Standards reference">Web Content Accessibility Guidelines (WCAG) 2.2, Level AA — <a className="text-primary underline" href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noopener noreferrer">w3.org/TR/WCAG22</a>.</Block>
    </article>
  </main>
);

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-8">
    <h2 className="text-2xl font-semibold mb-3" style={{ fontFamily: "Fraunces, serif" }}>{title}</h2>
    <div className="text-[17px] leading-[1.75] text-foreground/85">{children}</div>
  </section>
);

export default AccessibilityPage;