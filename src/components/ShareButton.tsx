import { Share2, Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Props {
  title: string;
  url: string;
  text?: string;
}

const ShareButton = ({ title, url, text }: Props) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = { title, text: text ?? title, url };
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share(shareData);
        return;
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copied", description: "Share it anywhere." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Couldn't copy", variant: "destructive" });
    }
  };

  return (
    <Button onClick={handleShare} variant="outline" size="sm" className="rounded-full" aria-label="Share this article">
      {copied ? <Check className="h-4 w-4 mr-1.5" /> : (typeof navigator !== "undefined" && (navigator as any).share) ? <Share2 className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
      {copied ? "Copied" : "Share"}
    </Button>
  );
};

export default ShareButton;