import { ReactNode } from "react";

// Lightweight markdown renderer for AI answers.
// Supports: **bold** headings, **inline bold**, - / • bullets, --- divider,
// *italic disclaimer* lines, and auto-linked URLs.

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={j} className="text-foreground font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={j}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80 break-words"
        >
          {part}
        </a>
      );
    }
    return <span key={j}>{part}</span>;
  });
}

interface Props {
  text: string;
  className?: string;
}

const MarkdownAnswer = ({ text, className = "" }: Props) => {
  const lines = text.split("\n");

  return (
    <div className={className}>
      {lines.map((line, i) => {
        const trimmed = line.trim();

        if (trimmed === "---") {
          return <div key={i} className="my-5 h-px w-full bg-border" />;
        }

        // **Heading line** (whole line bold)
        if (/^\*\*.+\*\*$/.test(trimmed)) {
          return (
            <h4
              key={i}
              className="mt-5 mb-2 text-[15px] font-semibold text-foreground first:mt-0"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {trimmed.replace(/\*\*/g, "")}
            </h4>
          );
        }

        // Bullet point
        if (/^[-•]\s/.test(trimmed)) {
          return (
            <div key={i} className="my-1 flex gap-2 text-[14px] leading-[1.7] text-foreground/85">
              <span className="text-primary mt-0.5">•</span>
              <span className="flex-1">{renderInline(trimmed.replace(/^[-•]\s/, ""))}</span>
            </div>
          );
        }

        // Italic disclaimer line *like this*
        if (/^\*[^*].*[^*]\*$/.test(trimmed)) {
          return (
            <p key={i} className="mt-4 text-[12px] italic text-muted-foreground">
              {trimmed.replace(/^\*|\*$/g, "")}
            </p>
          );
        }

        if (!trimmed) return <div key={i} className="h-2" />;

        return (
          <p key={i} className="my-1.5 text-[14px] leading-[1.7] text-foreground/85">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
};

export default MarkdownAnswer;