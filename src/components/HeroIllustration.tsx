import { useEffect, useState } from "react";

/**
 * Animated illustration: a tangled medical document
 * untangling into clear, friendly sentences.
 */
const HeroIllustration = () => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % 2), 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full max-w-[520px] aspect-square select-none" aria-hidden="true">
      {/* Soft blob background */}
      <div
        className="blob"
        style={{
          background: "hsl(var(--secondary))",
          width: "70%",
          height: "70%",
          top: "8%",
          left: "12%",
        }}
      />
      <div
        className="blob"
        style={{
          background: "hsl(var(--accent) / 0.35)",
          width: "45%",
          height: "45%",
          bottom: "8%",
          right: "6%",
          animationDelay: "-6s",
        }}
      />

      <svg
        viewBox="0 0 520 520"
        className="relative z-10 h-full w-full"
        fill="none"
      >
        {/* Document card */}
        <g style={{ transition: "transform 1.2s cubic-bezier(.22,1,.36,1)", transform: phase === 0 ? "rotate(-4deg)" : "rotate(0deg)", transformOrigin: "260px 260px" }}>
          <rect
            x="90"
            y="70"
            width="340"
            height="380"
            rx="22"
            fill="hsl(var(--card))"
            stroke="hsl(var(--border))"
            strokeWidth="1.5"
            style={{ filter: "drop-shadow(0 18px 30px hsl(158 17% 14% / 0.12))" }}
          />

          {/* Doc header */}
          <circle cx="125" cy="108" r="9" fill="hsl(var(--primary) / 0.85)" />
          <rect x="146" y="100" width="120" height="16" rx="6" fill="hsl(var(--primary) / 0.18)" />

          {/* Tangled scribble (phase 0) */}
          <g style={{ opacity: phase === 0 ? 1 : 0, transition: "opacity 1s ease" }}>
            <path
              d="M120 160 C 180 140, 220 200, 280 170 S 380 150, 400 190 S 320 230, 260 210 S 150 250, 200 270 S 360 260, 400 290 S 280 320, 220 310 S 130 340, 180 370 S 380 360, 400 400"
              stroke="hsl(var(--foreground) / 0.55)"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <text x="140" y="245" fontFamily="ui-monospace, monospace" fontSize="11" fill="hsl(var(--muted-foreground))" opacity="0.8">
              hypercholesterolemia
            </text>
            <text x="155" y="305" fontFamily="ui-monospace, monospace" fontSize="11" fill="hsl(var(--muted-foreground))" opacity="0.7">
              proteinuria · idiopathic
            </text>
          </g>

          {/* Clean sentences (phase 1) */}
          <g style={{ opacity: phase === 1 ? 1 : 0, transition: "opacity 1s ease" }}>
            {[160, 196, 232, 268, 304, 340, 376].map((y, i) => (
              <rect
                key={y}
                x="120"
                y={y}
                width={i % 2 === 0 ? 280 : 220}
                height="10"
                rx="5"
                fill={i === 2 ? "hsl(var(--accent) / 0.55)" : "hsl(var(--foreground) / 0.18)"}
              />
            ))}
            {/* Friendly checkmark */}
            <circle cx="380" cy="408" r="22" fill="hsl(var(--primary))" />
            <path
              d="M370 408 l8 8 l14 -16"
              stroke="hsl(var(--primary-foreground))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        </g>

        {/* Untangling arrow line */}
        <path
          d="M60 470 C 160 460, 260 480, 470 450"
          stroke="hsl(var(--accent))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="6 8"
          fill="none"
          opacity="0.7"
        />
      </svg>
    </div>
  );
};

export default HeroIllustration;