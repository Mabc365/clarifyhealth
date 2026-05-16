import { useEffect, useState } from "react";
import { Type } from "lucide-react";
import { Button } from "@/components/ui/button";

const KEY = "clarify_dyslexic_font";

const DyslexicFontToggle = () => {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const v = localStorage.getItem(KEY) === "1";
    setOn(v);
    document.documentElement.classList.toggle("dyslexic-font", v);
  }, []);
  const toggle = () => {
    const next = !on;
    setOn(next);
    localStorage.setItem(KEY, next ? "1" : "0");
    document.documentElement.classList.toggle("dyslexic-font", next);
  };
  return (
    <Button onClick={toggle} variant="outline" size="sm" className="rounded-full" aria-pressed={on} title="OpenDyslexic font">
      <Type className="h-4 w-4 mr-1.5" /> {on ? "Default font" : "Dyslexia font"}
    </Button>
  );
};

export default DyslexicFontToggle;