import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const TOOLS = [
  { to: "/ask", title: "Ask a question", desc: "Get a plain-English answer to any health question." },
  { to: "/translate", title: "Jargon translator", desc: "Paste medical text and get a clear translation." },
  { to: "/symptoms", title: "Symptom explainer", desc: "Understand a symptom and when to see a doctor." },
  { to: "/glossary", title: "Glossary", desc: "Common medical terms, defined in plain English." },
  { to: "/find-a-doctor", title: "Find a doctor", desc: "Search a public directory for the right specialist." },
  { to: "/wellness-plan", title: "Wellness plan", desc: "A simple, personalized plan for everyday health." },
  { to: "/my-notes", title: "Doctor visit notes", desc: "Save notes or upload a recording to simplify it." },
];

const ToolsPage = () => (
  <main className="page-shell">
    <PageMeta title="Tools | Clarify Health" description="Tools to help you understand health information." canonical="/tools" />
    <header className="page-intro">
      <p className="micro-label text-accent">Clarify Health tools</p>
      <h1>Tools for understanding what your health information means.</h1>
      <p>Small, focused tools for questions, medical language, symptoms, and appointments.</p>
    </header>
    <ul className="directory-grid" aria-label="Health tools">
      {TOOLS.map((tool, index) => (
        <li key={tool.to}>
          <Link to={tool.to} className="group flex min-h-[230px] flex-col justify-between p-6 md:p-7">
            <div className="flex items-start justify-between gap-4"><span className="micro-label text-accent">Tool {String(index + 1).padStart(2, "0")}</span><ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent" /></div>
            <div><h2 className="text-[24px] font-medium leading-tight text-foreground">{tool.title}</h2><p className="mt-3 text-[14px] leading-[1.6] text-muted-foreground">{tool.desc}</p></div>
          </Link>
        </li>
      ))}
    </ul>
  </main>
);

export default ToolsPage;