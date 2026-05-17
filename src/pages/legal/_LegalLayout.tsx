import { ReactNode } from "react";
import PageMeta from "@/components/PageMeta";

interface Props {
  title: string;
  description: string;
  canonical: string;
  lastUpdated?: string;
  children: ReactNode;
}

const LegalLayout = ({ title, description, canonical, lastUpdated = "May 17, 2026", children }: Props) => (
  <main className="pt-32 pb-[64px] md:pb-[120px] px-6">
    <PageMeta title={`${title} | Clarify Health`} description={description} canonical={canonical} />
    <article className="mx-auto max-w-[760px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <h1
        className="text-[36px] md:text-[48px] font-semibold text-foreground"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h1>
      <p className="mt-3 text-[13px] text-muted-foreground">Last Updated: {lastUpdated}</p>
      <div className="mt-10 space-y-7 text-[16px] leading-[1.8] text-foreground/80 legal-content">
        {children}
      </div>
    </article>
  </main>
);

export default LegalLayout;
