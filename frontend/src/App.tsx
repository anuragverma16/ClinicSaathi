import { Component, lazy, Suspense, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoadingScreen } from './components/ui';
import { AuthPage } from './pages/AuthPage';
import { useAuth } from './context/AuthContext';

const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const RecordsPage = lazy(() => import('./pages/RecordsPage').then((module) => ({ default: module.RecordsPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage })));
const UtilityPage = lazy(() => import('./pages/UtilityPage').then((module) => ({ default: module.UtilityPage })));

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ClinicSaathi UI error', error, info.componentStack);
  }
  render() {
    if (this.state.failed) return (
      <main className="grid min-h-screen place-items-center bg-canvas p-6 text-center dark:bg-slate-950">
        <div><h1 className="text-2xl font-bold text-ink dark:text-white">Something went wrong</h1>
          <p className="mt-2 text-muted">The page hit an unexpected error.</p>
          <button className="button-primary mt-5" onClick={() => window.location.reload()}>Reload page</button>
        </div>
      </main>
    );
    return this.props.children;
  }
}

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  if (loading) return <LoadingScreen />;
  if (!user) return <AuthPage mode={authMode} onModeChange={setAuthMode} />;
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="appointments/*" element={<RecordsPage path="/appointments" title="Appointment Management" subtitle="Manage your clinic's schedule and patient visits." />} />
          <Route path="online-booking/*" element={<RecordsPage path="/appointments" title="Online Appointment Booking" subtitle="Manage your clinic's schedule and patient visits." />} />
          <Route path="patients/*" element={<RecordsPage path="/patients" title="Patient CRM" subtitle="Keep patient details and visit history close at hand." />} />
          <Route path="doctors/*" element={<RecordsPage path="/doctors" title="Doctor Dashboard" subtitle="Manage your care team and clinic availability." />} />
          <Route path="queue/*" element={<RecordsPage path="/queue" title="Digital Queue Management" subtitle="A live view of patients waiting to be seen." />} />
          <Route path="prescriptions/*" element={<RecordsPage path="/prescriptions" title="Prescription & Reports" subtitle="Create and manage digital prescriptions." />} />
          <Route path="billing/*" element={<RecordsPage path="/billing" title="Billing & Payments" subtitle="Track payments and outstanding invoices." />} />
          <Route path="communications/*" element={<RecordsPage path="/communications" title="WhatsApp Booking Assistant" subtitle="Review patient messages and reminders." />} />
          <Route path="automated-whatsapp/*" element={<RecordsPage path="/communications" title="Automated WhatsApp Communication" subtitle="Review patient messages and reminders." />} />
          <Route path="reviews/*" element={<RecordsPage path="/reviews" title="Patient reviews" subtitle="Build trust with thoughtful patient feedback." />} />
          <Route path="campaigns/*" element={<RecordsPage path="/campaigns" title="Campaigns" subtitle="Keep patients informed with clinic updates." />} />
          <Route path="analytics/*" element={<AnalyticsPage />} />
          <Route path="ai/*" element={<UtilityPage kind="ai" />} />
          <Route path="settings/*" element={<UtilityPage kind="settings" />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return <ErrorBoundary><ProtectedRoutes /></ErrorBoundary>;
}
