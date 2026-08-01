import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../features/auth/useAuthStore';
import { signInWithGoogle } from '../lib/googleAuth';

/** Google "G" logo SVG — used on the OAuth button */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, phone: phone || undefined, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Registration failed');
      const { user, accessToken } = data.data;
      setAuth(user, accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const idToken = await signInWithGoogle();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Google sign-up failed');
      const { user, accessToken } = data.data;
      setAuth(user, accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[78vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-2xl space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tight text-[#00a8cc] group-hover:opacity-80 transition-opacity">
              CINEBOOK
            </span>
          </Link>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Create your account</h1>
          <p className="text-xs text-gray-600">Join CineBook to enjoy fast ticket reservations &amp; seat locks</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-Up Button */}
        <button
          type="button"
          id="google-signup-btn"
          onClick={handleGoogleRegister}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-sm transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <GoogleIcon />
              <span>Sign up with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or register with email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-gray-50 border border-gray-300/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00a8cc] transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-gray-50 border border-gray-300/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00a8cc] transition-colors"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+977-9800000000"
                className="w-full bg-gray-50 border border-gray-300/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00a8cc] transition-colors"
              />
            </div>
          </div>

          {/* Password with Eye Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
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
            disabled={loading || googleLoading}
            className="w-full py-3 rounded-xl bg-[#00a8cc] hover:bg-[#0096c7] text-white font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? 'Creating account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-xs text-gray-600 pt-2 border-t border-gray-200">
          Already have an account?{' '}
          <Link to="/login" className="text-[#00a8cc] font-bold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};
