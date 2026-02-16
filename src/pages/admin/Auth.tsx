import { useState } from 'react';
import { LogIn, UserPlus, Loader, KeyRound, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface AuthProps {
  onLoginSuccess: () => void;
}

type TabType = 'login' | 'signup' | 'forgot';

export default function Auth({ onLoginSuccess }: AuthProps) {
  const { signIn, checkAdminStatus, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const isApproved = await checkAdminStatus();

      if (!isApproved) {
        setError('Your account is not approved for admin access. Please contact an existing administrator to approve your account.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/admin',
        }
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        setSuccess('Account created successfully! Please contact an existing administrator to approve your account before you can access the admin portal.');
        setEmail('');
        setPassword('');
        setTimeout(() => setActiveTab('login'), 4000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/admin',
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Password reset email sent! Check your inbox.');
        setEmail('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (activeTab === 'login') {
      handleLogin(e);
    } else if (activeTab === 'signup') {
      handleSignup(e);
    } else {
      handleForgotPassword(e);
    }
  };

  const getIcon = () => {
    switch (activeTab) {
      case 'login':
        return <LogIn className="h-8 w-8 text-[#f57a18]" />;
      case 'signup':
        return <UserPlus className="h-8 w-8 text-[#f57a18]" />;
      case 'forgot':
        return <KeyRound className="h-8 w-8 text-[#f57a18]" />;
    }
  };

  const getButtonText = () => {
    switch (activeTab) {
      case 'login':
        return 'Sign In';
      case 'signup':
        return 'Create Account';
      case 'forgot':
        return 'Send Reset Link';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003b67] to-[#005a9c] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-[#003b67] to-[#005a9c] w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            {getIcon()}
          </div>
          <h1 className="text-3xl font-bold text-[#003b67] mb-2">Admin Portal</h1>
          <p className="text-gray-600">Stream Bridge Services Inc.</p>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-3 text-sm font-bold transition ${
              activeTab === 'login'
                ? 'text-[#f57a18] border-b-2 border-[#f57a18]'
                : 'text-gray-500 hover:text-[#003b67]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('signup');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-3 text-sm font-bold transition ${
              activeTab === 'signup'
                ? 'text-[#f57a18] border-b-2 border-[#f57a18]'
                : 'text-gray-500 hover:text-[#003b67]'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => {
              setActiveTab('forgot');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-3 text-sm font-bold transition ${
              activeTab === 'forgot'
                ? 'text-[#f57a18] border-b-2 border-[#f57a18]'
                : 'text-gray-500 hover:text-[#003b67]'
            }`}
          >
            Reset
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#003b67] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18] transition"
              placeholder="admin@streambridgeservices.com"
            />
          </div>

          {activeTab !== 'forgot' && (
            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18] transition"
                placeholder={activeTab === 'signup' ? 'Minimum 6 characters' : 'Enter your password'}
              />
              {activeTab === 'signup' && (
                <p className="text-sm text-gray-500 mt-1">Password must be at least 6 characters</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f57a18] hover:bg-[#d86a15] text-white px-6 py-4 rounded-lg font-bold transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : (
              <span>{getButtonText()}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
