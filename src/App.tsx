import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import FloatingNav from "@/components/FloatingNav";
import HamburgerSidebar from "@/components/HamburgerSidebar";
import FloatingChat from "@/components/FloatingChat";
import PageTransition from "@/components/PageTransition";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/Calendar";
import BrandDNA from "./pages/BrandDNA";
import FabricaConteudo from "./pages/FabricaConteudo";
import ConciergeSDR from "./pages/ConciergeSDR";
import AdsIntelligence from "./pages/AdsIntelligence";
import DimNeutron from "./pages/DimNeutron";
import Planos from "./pages/Planos";
import Perfil from "./pages/Perfil";
import Intelligence from "./pages/Intelligence";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  React.useEffect(() => {
    const hsl = sessionStorage.getItem("gt-accent-hsl");
    const hslDark = sessionStorage.getItem("gt-accent-hsl-dark");
    if (hsl) {
      document.documentElement.style.setProperty("--primary", hsl);
      document.documentElement.style.setProperty("--ring", hsl);
      document.documentElement.style.setProperty("--peach", hsl);
    }
    if (hslDark) {
      document.documentElement.style.setProperty("--peach-dark", hslDark);
    }
  }, []);

  return (
    <>
      {user && <FloatingNav />}
      {user && <HamburgerSidebar />}
      {user && <FloatingChat />}
      <PageTransition>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/calendario" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/brand-dna" element={<ProtectedRoute><BrandDNA /></ProtectedRoute>} />
          <Route path="/fabrica" element={<ProtectedRoute><FabricaConteudo /></ProtectedRoute>} />
          <Route path="/concierge" element={<ProtectedRoute><ConciergeSDR /></ProtectedRoute>} />
          <Route path="/ads-intel" element={<ProtectedRoute><AdsIntelligence /></ProtectedRoute>} />
          <Route path="/dim-neutron" element={<ProtectedRoute><DimNeutron /></ProtectedRoute>} />
          <Route path="/planos" element={<ProtectedRoute><Planos /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
