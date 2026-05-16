import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import FloatingAskButton from "@/components/FloatingAskButton";
import Index from "./pages/Index";
import TopicsIndex from "./pages/TopicsIndex";
import TopicPage from "./pages/TopicPage";
import AskPage from "./pages/AskPage";
import AboutPage from "./pages/AboutPage";
import HolisticTopicPage from "./pages/HolisticTopicPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyNotesPage from "./pages/MyNotesPage";
import FindADoctorPage from "./pages/FindADoctorPage";
import WellnessPlanPage from "./pages/WellnessPlanPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import DisclaimerPage from "./pages/DisclaimerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <a href="#main-content" className="skip-link">Skip to content</a>
          <Header />
          <div id="main-content" className="animate-page-enter">
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
          <FloatingAskButton />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
