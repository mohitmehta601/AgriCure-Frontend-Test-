import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { RealTimeDataProvider } from "@/contexts/RealTimeDataContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import Auth from "@/pages/Auth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Recommendations from "./pages/Recommendations";
import RecommendationDetails from "./pages/RecommendationDetails";
import NotFound from "./pages/NotFound";
import Video from "./pages/Video";
import { EnhancedMLDemo } from "./components/EnhancedMLDemo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <RealTimeDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <PublicRoute>
                  <Index />
                </PublicRoute>
              } />
              
              {/* New Supabase Auth Routes */}
              <Route path="/auth/:step" element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } />
              <Route path="/auth" element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } />
              
              {/* Legacy auth routes - redirect to new auth */}
              <Route path="/login" element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/recommendations" element={
                <ProtectedRoute>
                  <Recommendations />
                </ProtectedRoute>
              } />
              <Route path="/recommendations/:id" element={
                <ProtectedRoute>
                  <RecommendationDetails />
                </ProtectedRoute>
              } />
              
              {/* Public Routes */}
              <Route path="/video" element={<Video src="video.mp4" />} />
              <Route path="/demo" element={<EnhancedMLDemo />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RealTimeDataProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
