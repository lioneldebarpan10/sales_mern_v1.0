import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, TrendingUp, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const isLight = (localStorage.getItem('salesify-theme') || 'dark') === 'light';
  const navigate = useNavigate();
  const { auth, loading, login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && auth) navigate('/', { replace: true });
  }, [auth, loading, navigate]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: isLight
          ? 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 40%, #bae6fd 70%, #e0f2fe 100%)'
          : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #4c1d95 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: 400, height: 400, borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle, rgba(2,132,199,0.15) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(79,70,229,0.25) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
        filter: 'blur(50px)',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '20%',
        width: 200, height: 200, borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle, rgba(2,132,199,0.1) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        filter: 'blur(30px)',
      }} />

      {/* Card */}
      <div
        className="w-full max-w-md animate-slide-up relative"
        style={{
          background: isLight ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: isLight ? '1px solid rgba(2,132,199,0.15)' : '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1.75rem',
          padding: '2.5rem',
          boxShadow: isLight ? '0 25px 80px rgba(2,132,199,0.12)' : '0 25px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: isLight ? 'linear-gradient(135deg,#0284c7,#06b6d4)' : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
              boxShadow: isLight ? '0 8px 24px rgba(2,132,199,0.3)' : '0 8px 24px rgba(79,70,229,0.5)',
            }}
          >
            <TrendingUp size={26} color="#fff" />
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: isLight ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.45)' }}>
            Sign in to your SalesiFy dashboard
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in"
            style={{ background: 'rgba(244,63,94,0.15)', color: '#fda4af', border: '1px solid rgba(244,63,94,0.25)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: isLight ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.5)' }}>
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: isLight ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.35)' }}>
                <Mail size={17} />
              </span>
              <input
                type="email"
                name="email"
                id="login-email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@example.com"
                style={{
                  width: '100%',
                  paddingLeft: '2.75rem',
                  paddingRight: '1rem',
                  paddingTop: '0.8rem',
                  paddingBottom: '0.8rem',
                  borderRadius: '0.875rem',
                  background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.07)',
                  border: isLight ? '1.5px solid rgba(2,132,199,0.2)' : '1.5px solid rgba(255,255,255,0.1)',
                  color: isLight ? '#0f172a' : '#fff',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = isLight ? 'rgba(2,132,199,0.7)' : 'rgba(129,140,248,0.7)'; e.target.style.background = isLight ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = isLight ? '0 0 0 3px rgba(2,132,199,0.15)' : '0 0 0 3px rgba(79,70,229,0.2)'; }}
                onBlur={e => { e.target.style.borderColor = isLight ? 'rgba(2,132,199,0.2)' : 'rgba(255,255,255,0.1)'; e.target.style.background = isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: isLight ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.5)' }}>
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: isLight ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.35)' }}>
                <Lock size={17} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="login-password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  paddingLeft: '2.75rem',
                  paddingRight: '3rem',
                  paddingTop: '0.8rem',
                  paddingBottom: '0.8rem',
                  borderRadius: '0.875rem',
                  background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.07)',
                  border: isLight ? '1.5px solid rgba(2,132,199,0.2)' : '1.5px solid rgba(255,255,255,0.1)',
                  color: isLight ? '#0f172a' : '#fff',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = isLight ? 'rgba(2,132,199,0.7)' : 'rgba(129,140,248,0.7)'; e.target.style.background = isLight ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = isLight ? '0 0 0 3px rgba(2,132,199,0.15)' : '0 0 0 3px rgba(79,70,229,0.2)'; }}
                onBlur={e => { e.target.style.borderColor = isLight ? 'rgba(2,132,199,0.2)' : 'rgba(255,255,255,0.1)'; e.target.style.background = isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                style={{ color: isLight ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="login-submit"
            disabled={submitting || loading}
            className="w-full mt-2 py-3.5 rounded-2xl font-semibold text-sm text-white transition-all duration-200"
            style={{
              background: submitting
                ? (isLight ? 'rgba(2,132,199,0.5)' : 'rgba(79,70,229,0.5)')
                : (isLight ? 'linear-gradient(135deg,#0284c7,#06b6d4)' : 'linear-gradient(135deg,#4f46e5,#7c3aed)'),
              boxShadow: submitting
                ? 'none'
                : (isLight ? '0 8px 24px rgba(2,132,199,0.3)' : '0 8px 24px rgba(79,70,229,0.45)'),
              cursor: submitting ? 'not-allowed' : 'pointer',
              transform: submitting ? 'none' : undefined,
            }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs" style={{ color: isLight ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.25)' }}>
          SalesiFy Admin Portal · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default Login;
