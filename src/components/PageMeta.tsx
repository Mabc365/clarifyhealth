import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PageMetaProps {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
  ogType?: "website" | "article";
}

const BASE_URL = "https://clarifyhealth.co";

const PageMeta = ({ title, description, canonical, ogImage, jsonLd, ogType = "website" }: PageMetaProps) => {
  const { lang } = useLanguage();

  useEffect(() => {
    document.title = title;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", `${BASE_URL}${canonical}`);
    setMeta("property", "og:type", ogType);
    const localeMap: Record<string, string> = { en: "en_US", es: "es_ES", ur: "ur_PK", hi: "hi_IN", ar: "ar_SA" };
    setMeta("property", "og:locale", localeMap[lang] ?? "en_US");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("property", "og:site_name", "Clarify Health");

    if (ogImage) {
      setMeta("property", "og:image", ogImage);
      setMeta("name", "twitter:image", ogImage);
    }
    setMeta("name", "theme-color", "#1a6b4a");

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", `${BASE_URL}${canonical}`);

    // hreflang tags
    const hreflangs = [
      { lang: "en", href: `${BASE_URL}${canonical}` },
      { lang: "es", href: `${BASE_URL}${canonical}` },
      { lang: "ur", href: `${BASE_URL}${canonical}` },
      { lang: "hi", href: `${BASE_URL}${canonical}` },
      { lang: "ar", href: `${BASE_URL}${canonical}` },
      { lang: "x-default", href: `${BASE_URL}${canonical}` },
    ];

    // Remove old hreflang tags
    document.querySelectorAll('link[data-hreflang]').forEach((el) => el.remove());

    for (const hl of hreflangs) {
      const hlLink = document.createElement("link");
      hlLink.setAttribute("rel", "alternate");
      hlLink.setAttribute("hreflang", hl.lang);
      hlLink.setAttribute("href", hl.href);
      hlLink.setAttribute("data-hreflang", "true");
      document.head.appendChild(hlLink);
    }

    // JSON-LD
    const existingScript = document.querySelector('script[data-page-jsonld]');
    if (existingScript) existingScript.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-page-jsonld", "true");
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        inLanguage: lang,
        ...jsonLd,
      });
      document.head.appendChild(script);
    }

    return () => {
      const s = document.querySelector('script[data-page-jsonld]');
      if (s) s.remove();
      document.querySelectorAll('link[data-hreflang]').forEach((el) => el.remove());
    };
  }, [title, description, canonical, ogImage, jsonLd, lang]);

  return null;
};

export default PageMeta;
