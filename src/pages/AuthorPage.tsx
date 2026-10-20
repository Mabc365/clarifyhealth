import { Link } from "react-router-dom";
import PageMeta from "@/components/PageMeta";
import mustafaPhoto from "@/assets/mustafa.jpeg";

const AuthorPage = () => (
  <main className="page-shell">
    <PageMeta title="Mustafa Asif | Founder and Health Writer at Clarify Health"
      description="Mustafa Asif is the founder and a health education writer at Clarify Health, creating accessible medical articles and patient education tools."
      canonical="/author/mustafa-asif"
      jsonLd={{
        "@type": "ProfilePage",
        "@id": "https://clarifyhealth.co/author/mustafa-asif#profile",
        mainEntity: {
          "@type": "Person",
          "@id": "https://clarifyhealth.co/author/mustafa-asif#person",
          name: "Mustafa Asif",
          url: "https://clarifyhealth.co/author/mustafa-asif",
          description: "Founder and health education writer at Clarify Health.",
          worksFor: { "@type": "Organization", name: "Clarify Health", url: "https://clarifyhealth.co" }
        }
      }} />
    <header className="page-intro">
      <p className="micro-label text-accent">Author &amp; Founder</p>
      <h1>Mustafa Asif</h1>
      <p>Founder and health education writer at Clarify Health.</p>
    </header>
    <div className="border-t border-border">
      <section className="editorial-row">
        <h2>About the author</h2>
        <div className="grid gap-6 sm:grid-cols-[150px_1fr] sm:items-start">
          <img src={mustafaPhoto} alt="Mustafa Asif, founder of Clarify Health" className="w-[150px] aspect-[4/5] rounded-lg object-cover grayscale" />
          <div className="space-y-4">
            <p>Mustafa Asif founded Clarify Health to help patients and families understand medical information in plain language. He writes accessible health articles and helps develop patient-facing educational tools.</p>
            <p>His interest in health communication grew from his family's experience navigating cancer treatment and the complexity of medical terminology and treatment options.</p>
            <p>His academic interests include molecular biology, cancer research, and improving access to understandable health information.</p>
            <Link to="/topics" className="text-primary font-medium hover:underline">Explore health articles →</Link>
          </div>
        </div>
      </section>
      <section className="editorial-row">
        <h2>Editorial approach</h2>
        <p>Clarify Health's educational content helps readers prepare informed questions for healthcare professionals. <Link to="/editorial-standards" className="text-primary hover:underline">Read the editorial standards</Link>.</p>
      </section>
    </div>
  </main>
);
export default AuthorPage;
