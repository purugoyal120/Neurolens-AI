import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VisionTestProvider } from './context/VisionTestContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { ReportsPage } from './pages/dashboard/ReportsPage';
import { IntegrationsPage } from './pages/dashboard/IntegrationsPage';
import { TeamPage } from './pages/dashboard/TeamPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DiagnosticTestPage } from './pages/auth/DiagnosticTestPage';
import { MyReportsPage } from './pages/dashboard/MyReportsPage';
import { SimulatorPage } from './pages/dashboard/SimulatorPage';

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <VisionTestProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/onboarding" element={<DiagnosticTestPage />} />
                
                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout><OverviewPage /></DashboardLayout>} />
                <Route path="/analytics" element={<DashboardLayout><ReportsPage /></DashboardLayout>} />
                <Route path="/reports" element={<DashboardLayout><MyReportsPage /></DashboardLayout>} />
                <Route path="/integrations" element={<DashboardLayout><IntegrationsPage /></DashboardLayout>} />
                <Route path="/team" element={<DashboardLayout><TeamPage /></DashboardLayout>} />
                <Route path="/simulator" element={<DashboardLayout><SimulatorPage /></DashboardLayout>} />
                <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </VisionTestProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
