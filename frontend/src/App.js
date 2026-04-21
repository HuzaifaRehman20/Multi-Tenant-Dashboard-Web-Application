import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';

function Router() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = React.useState('login');

  // Redirect authenticated users away from auth pages
  React.useEffect(() => {
    if (user) setPage('dashboard');
  }, [user]);

  // Global 401 handler; if any API call returns 401, log the user out cleanly
  // This runs once on mount and listens for the custom event dispatched below
  React.useEffect(() => {
    const handle401 = () => {
      logout();
      setPage('login');
    };
    window.addEventListener('auth:logout', handle401);
    return () => window.removeEventListener('auth:logout', handle401);
  }, [logout]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p className="loading-text">Loading session…</p>
      </div>
    );
  }

  if (!user) {
    if (page === 'signup') return <SignupPage onNavigate={setPage} />;
    return <LoginPage onNavigate={setPage} />;
  }

  return <DashboardPage onNavigate={setPage} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}