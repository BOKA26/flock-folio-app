import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatbotReligieux from "@/components/ChatbotReligieux";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Announcements from "./pages/Announcements";
import Prayers from "./pages/Prayers";
import Donations from "./pages/Donations";
import DonationPayment from "./pages/DonationPayment";
import OnlineDonations from "./pages/OnlineDonations";
import Church from "./pages/Church";
import Settings from "./pages/Settings";
import MemberSpace from "./pages/MemberSpace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/member-space" element={<MemberSpace />} />
          <Route path="/members" element={<Members />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/prayers" element={<Prayers />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/donation-payment" element={<DonationPayment />} />
          <Route path="/online-donations" element={<OnlineDonations />} />
          <Route path="/church" element={<Church />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatbotReligieux />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
