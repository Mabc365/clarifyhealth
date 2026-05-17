import { Info } from "lucide-react";
import { Link } from "react-router-dom";

const AIInputNotice = ({ className = "" }: { className?: string }) => (
  <div
    className={`flex items-start gap-2.5 rounded-md px-3.5 py-2.5 text-[12.5px] leading-relaxed text-muted-foreground ${className}`}
    style={{
      background: "hsl(var(--section-bg))",
      border: "0.5px solid hsl(var(--border))",
      fontFamily: "'DM Sans', sans-serif",
    }}
    role="note"
  >
    <Info className="h-3.5 w-3.5 mt-[2px] shrink-0 text-primary" />
    <span>
      Do not input information you're not authorized to share. AI outputs are not professional
      advice. See our{" "}
      <Link to="/legal/ai-disclaimer" className="text-primary hover:underline">AI Disclaimer</Link>.
    </span>
  </div>
);

export default AIInputNotice;
