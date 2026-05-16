import { useEffect, useState } from "react";

type Scale = "sm" | "md" | "lg";

const SCALE_VALUE: Record<Scale, number> = { sm: 0.9, md: 1, lg: 1.15 };

export function useA11yPrefs() {
  const [scale, setScale] = useState<Scale>(() => (localStorage.getItem("clarify_font_scale") as Scale) || "md");
  const [highContrast, setHighContrast] = useState<boolean>(() => localStorage.getItem("clarify_high_contrast") === "1");
  const [dark, setDark] = useState<boolean>(() => localStorage.getItem("clarify_dark") === "1");

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", String(SCALE_VALUE[scale]));
    localStorage.setItem("clarify_font_scale", scale);
  }, [scale]);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
    localStorage.setItem("clarify_high_contrast", highContrast ? "1" : "0");
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("clarify_dark", dark ? "1" : "0");
  }, [dark]);

  return { scale, setScale, highContrast, setHighContrast, dark, setDark };
}