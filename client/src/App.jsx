import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import SearchPage from "./pages/SearchPage";
import PredictionPageWrapper from "./pages/PredictionPageWrapper";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./AppLayout";
import HomePage from "./pages/HomePage";
import MarketplacePage from "./pages/MarketplacePage";
import ProfessionalDetailPage from "./pages/ProfessionalDetailPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import OpportunityDetailPage from "./pages/OpportunityDetailPage";
import AboutPage from "./pages/AboutPage";

import "./App.css";


function AppRoutes() {
  const { isLoading, isAuthenticated } = useAuth();

  const authLoading = (
    <div className="loading-screen">
      <div className="loader"></div>
      <p>Loading...</p>
    </div>
  );

  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================= */}

      <Route
        path="/login"
        element={
          isLoading
            ? authLoading
            : isAuthenticated
              ? <Navigate to="/" replace />
              : <LoginPage />
        }
      />

      <Route
        path="/register"
        element={
          isLoading
            ? authLoading
            : isAuthenticated
              ? <Navigate to="/" replace />
              : <RegisterPage />
        }
      />


      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/marketplace/:id" element={<ProfessionalDetailPage />} />
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
        <Route path="/about" element={<AboutPage />} />

        <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
          <Route path="/ai-analyzer" element={<PredictionPageWrapper />} />
          <Route path="/prediction" element={<PredictionPageWrapper />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}


function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;