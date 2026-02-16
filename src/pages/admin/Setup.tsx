import { useState } from 'react';
import { UserPlus, Loader, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Setup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#003b67] to-[#005a9c] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#003b67] mb-4">Admin Account Created!</h1>
          <p className="text-gray-600 mb-6">
            Your admin account has been created successfully. You can now log in with your credentials.
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
            <UserPlus className="h-8 w-8 text-[#f57a18]" />
          </div>
          <h1 className="text-3xl font-bold text-[#003b67] mb-2">Create Admin Account</h1>
          <p className="text-gray-600">Stream Bridge Services Inc.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
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

          <div>
            <label className="block text-sm font-bold text-[#003b67] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18] transition"
              placeholder="Minimum 6 characters"
            />
            <p className="text-sm text-gray-500 mt-1">Password must be at least 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f57a18] hover:bg-[#d86a15] text-white px-6 py-4 rounded-lg font-bold transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                <span>Create Admin Account</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
