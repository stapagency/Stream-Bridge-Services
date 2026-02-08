import { useState, useEffect } from 'react';
import { KeyRound, Loader, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidSession(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!validSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#003b67] to-[#005a9c] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#003b67] mb-4">Invalid or Expired Link</h1>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <a
            href="/admin"
            className="inline-block bg-[#f57a18] hover:bg-[#d86a15] text-white px-6 py-3 rounded-lg font-bold transition"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#003b67] to-[#005a9c] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#003b67] mb-4">Password Reset Successful</h1>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <a
            href="/admin"
            className="inline-block bg-[#f57a18] hover:bg-[#d86a15] text-white px-6 py-3 rounded-lg font-bold transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003b67] to-[#005a9c] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-[#003b67] to-[#005a9c] w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <KeyRound className="h-8 w-8 text-[#f57a18]" />
          </div>
          <h1 className="text-3xl font-bold text-[#003b67] mb-2">Set New Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#003b67] mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18] transition"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#003b67] mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18] transition"
              placeholder="Re-enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f57a18] hover:bg-[#d86a15] text-white px-6 py-4 rounded-lg font-bold transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <KeyRound className="h-5 w-5" />
                <span>Reset Password</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
