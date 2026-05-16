import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const TOOLS = [
  { to: "/ask", title: "Ask a question", desc: "Get a plain-English answer to any health question." },
  { to: "/translate", title: "Jargon translator", desc: "Paste medical text and get a clear translation." },
  { to: "/symptoms", title: "Symptom explainer", desc: "Understand what a symptom might mean and when to see a doctor." },
  { to: "/glossary", title: "Glossary", desc: "Common medical terms, defined in plain English." },
  { to: "/find-a-doctor", title: "Find a doctor", desc: "Match your symptoms to the right kind of specialist." },
  { to: "/wellness-plan", title: "Wellness plan", desc: "A simple, personalized plan for everyday health." },
  { to: "/my-notes", title: "Doctor visit notes", desc: "Save notes or upload a recording — we'll summarize it." },
];

const ToolsPage = () => (
  <>
    <PageMeta title="Tools | Clarify Health" description="Tools to help you understand health information." canonical="/tools" />
    <main className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-[680px]">
        <h1
          className="text-[36px] md:text-[48px] font-medium text-foreground"
          style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.02em", lineHeight: 1.1 }}
        >
          Tools
        </h1>
        <p
          className="mt-4 text-[17px] text-foreground/75"
          style={{ fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}
        >
          Small, focused tools to make health information easier to understand.
        </p>

        <ul className="mt-12 divide-y" style={{ borderColor: "hsl(var(--border) / 0.5)" }}>
          {TOOLS.map((tool) => (
            <li key={tool.to} className="border-t first:border-t-0" style={{ borderColor: "hsl(var(--border) / 0.5)" }}>
              <Link to={tool.to} className="group flex items-start justify-between gap-6 py-6">
                <div>
                  <h2
                    className="text-[20px] font-medium text-foreground group-hover:text-primary transition-colors"
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    {tool.title}
                  </h2>
                  <p
                    className="mt-1.5 text-[15px] text-muted-foreground"
                    style={{ fontFamily: "Inter, sans-serif", lineHeight: 1.6 }}
                  >
                    {tool.desc}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-2 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  </>
);

export default ToolsPage;
