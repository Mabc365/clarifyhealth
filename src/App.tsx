import { useEffect, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import FloatingAskButton from "@/components/FloatingAskButton";
import Index from "./pages/Index";
const TopicsIndex = lazy(() => import("./pages/TopicsIndex"));
const TopicPage = lazy(() => import("./pages/TopicPage"));
const AskPage = lazy(() => import("./pages/AskPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const HolisticTopicPage = lazy(() => import("./pages/HolisticTopicPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const MyNotesPage = lazy(() => import("./pages/MyNotesPage"));
const FindADoctorPage = lazy(() => import("./pages/FindADoctorPage"));
const WellnessPlanPage = lazy(() => import("./pages/WellnessPlanPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const DisclaimerPage = lazy(() => import("./pages/DisclaimerPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const JargonTranslatorPage = lazy(() => import("./pages/JargonTranslatorPage"));
const SymptomExplainerPage = lazy(() => import("./pages/SymptomExplainerPage"));
const GlossaryPage = lazy(() => import("./pages/GlossaryPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const EmbedArticlePage = lazy(() => import("./pages/EmbedArticlePage"));
const NewsletterConfirmPage = lazy(() => import("./pages/NewsletterConfirmPage"));
const EditorialStandardsPage = lazy(() => import("./pages/EditorialStandardsPage"));
const ReviewersPage = lazy(() => import("./pages/ReviewersPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const NewsletterPage = lazy(() => import("./pages/NewsletterPage"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
const AccessibilityPage = lazy(() => import("./pages/AccessibilityPage"));

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const SUPABASE_PROJECT = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const RssRedirect = () => {
  useEffect(() => {
    window.location.replace(`https://${SUPABASE_PROJECT}.functions.supabase.co/rss-feed`);
  }, []);
  return <p className="pt-32 text-center text-sm text-muted-foreground">Redirecting to RSS feed…</p>;
};

const Chrome = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const isEmbed = pathname.startsWith("/embed/");
  if (isEmbed) return <>{children}</>;
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <div id="main-content" className="animate-page-enter">{children}</div>
      <Footer />
      <FloatingAskButton />
    </>
  );
};

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground" aria-busy="true">Loading…</div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Chrome>
            <Suspense fallback={<PageFallback />}>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/topics" element={<TopicsIndex />} />
              <Route path="/topics/:id" element={<TopicPage />} />
              <Route path="/ask" element={<AskPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/holistic/:id" element={<HolisticTopicPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/my-notes" element={<MyNotesPage />} />
              <Route path="/find-a-doctor" element={<FindADoctorPage />} />
              <Route path="/wellness-plan" element={<WellnessPlanPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/disclaimer" element={<DisclaimerPage />} />
              <Route path="/translate" element={<JargonTranslatorPage />} />
              <Route path="/symptoms" element={<SymptomExplainerPage />} />
              <Route path="/glossary" element={<GlossaryPage />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/embed/article/:slug" element={<EmbedArticlePage />} />
              <Route path="/newsletter/confirm" element={<NewsletterConfirmPage />} />
              <Route path="/newsletter" element={<NewsletterPage />} />
              <Route path="/editorial-standards" element={<EditorialStandardsPage />} />
              <Route path="/reviewers" element={<ReviewersPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />
              <Route path="/rss" element={<RssRedirect />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Chrome>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
