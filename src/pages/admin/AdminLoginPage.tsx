import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { apiClient } from '../../lib/apiClient';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();

  // Already signed in as an admin - head straight to the panel.
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/login', { email, password });

      const { user: loggedIn, accessToken } = res.data.data;

      // This is the admin entry point. Starter accounts must not land here.
      if (loggedIn.role !== 'ADMIN') {
        setError('This account does not have admin access. Please use the customer sign-in page.');
        return;
      }

      setAuth(loggedIn, accessToken);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      console.error('[Admin login error]', err);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to sign in. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-2xl space-y-6">

        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#00a8cc] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#00a8cc] group-hover:opacity-80 transition-opacity">
              CINEBOOK
            </span>
          </Link>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Admin Sign In</h1>
          <p className="text-xs text-gray-600">Restricted access · cinema staff only</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cinebook.com"
                className="w-full bg-gray-50 border border-gray-300/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00a8cc] transition-colors"
              />
            </div>
          </div>

          {/* Password Input with Eye Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-300/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00a8cc] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#00a8cc] hover:bg-[#0096c7] text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? 'Signing in...' : 'Sign In to Admin Panel'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Back to customer sign in */}
        <p className="text-center text-xs text-gray-600">
          Not an admin?{' '}
          <Link to="/login" className="text-[#00a8cc] font-bold hover:underline">
            Customer sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;