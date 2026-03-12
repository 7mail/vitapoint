import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Products } from './components/Products';
import { Orders } from './components/Orders';
import { Inventory } from './components/Inventory';
import { Reports } from './components/Reports';
import { UserManagement } from './components/UserManagement';
import { ActivityLogs } from './components/ActivityLogs';
import { AuditTrail } from './components/AuditTrail';
import { ProtectedRoute } from './components/ProtectedRoute';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, profile, loading, profileError, retryLoadProfile, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Error</h2>
            <p className="text-gray-600 mb-6">
              {profileError || 'Unable to load your profile. Please try again.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={retryLoadProfile}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Retry
              </button>
              <button
                onClick={signOut}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'products' && <Products />}
        {currentPage === 'orders' && <Orders />}
        {currentPage === 'inventory' && <Inventory />}
        {currentPage === 'reports' && <Reports />}
        {currentPage === 'users' && <UserManagement />}
        {currentPage === 'activity' && <ActivityLogs />}
        {currentPage === 'audit' && <AuditTrail />}
      </Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
