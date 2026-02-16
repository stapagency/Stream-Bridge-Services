import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Products from './pages/Products';
import Contact from './pages/Contact';
import Customers from './pages/Customers';
import Auth from './pages/admin/Auth';
import Dashboard from './pages/admin/Dashboard';
import ResetPassword from './pages/admin/ResetPassword';
import { AlertTriangle } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { user, loading, isApprovedAdmin } = useAuth();

  useEffect(() => {
    if (window.location.pathname === '/admin/reset-password') {
      setShowResetPassword(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#003b67] border-t-[#f57a18] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Configuration Required
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Supabase environment variables are not configured. Please add the following to your deployment settings:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 font-mono text-sm">
            <div className="mb-2">
              <span className="text-gray-500">VITE_SUPABASE_URL</span>
            </div>
            <div>
              <span className="text-gray-500">VITE_SUPABASE_ANON_KEY</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Contact your administrator for the correct values.
          </p>
        </div>
      </div>
    );
  }

  if (showResetPassword) {
    return <ResetPassword />;
  }

  if (showAdmin) {
    if (!user) {
      return <Auth onLoginSuccess={() => setCurrentPage('home')} />;
    }
    if (!isApprovedAdmin) {
      return <Auth onLoginSuccess={() => setCurrentPage('home')} />;
    }
    return <Dashboard onLogout={() => {
      setShowAdmin(false);
      setCurrentPage('home');
    }} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'about':
        return <About />;
      case 'services':
        return <Services onNavigate={setCurrentPage} />;
      case 'products':
        return <Products onNavigate={setCurrentPage} />;
      case 'customers':
        return <Customers />;
      case 'contact':
        return <Contact />;
      case 'admin-login':
        setShowAdmin(true);
        return null;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
      <Footer onNavigate={setCurrentPage} />
    </div>
  );
}

export default App;
