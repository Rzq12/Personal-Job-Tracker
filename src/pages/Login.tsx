import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      setSuccess(true);
      setTimeout(() => navigate('/'), 500);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col md:flex-row overflow-hidden"
      style={{ background: '#f7f9fb' }}
    >
      {/* Left Side: Vibrant Branding */}
      <section
        className="hidden md:flex md:w-1/2 p-16 flex-col justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(45deg, #006071 0%, #007b8f 100%)' }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: '#007b8f', mixBlendMode: 'multiply' }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: '#0078a3', mixBlendMode: 'multiply' }}
        />

        {/* Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined" style={{ color: '#006071', fontSize: '22px' }}>
                architecture
              </span>
            </div>
            <span
              className="text-2xl font-extrabold text-white tracking-tight"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Digital Architect
            </span>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-lg">
          <h1
            className="text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-8"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Track every opportunity with clarity and confidence.
          </h1>
          <p className="text-lg opacity-90 leading-relaxed" style={{ color: '#aaedff' }}>
            Designed for the modern professional. Organize your career journey with
            architectural precision and calm.
          </p>
        </div>

        {/* Highlight Glassmorphism Card */}
        <div
          className="relative z-10 p-8 shadow-2xl max-w-md"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '0.75rem',
          }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <p
                className="text-xs font-bold tracking-widest mb-1 uppercase"
                style={{ color: '#aaedff' }}
              >
                This Week Highlight
              </p>
              <h3
                className="text-xl text-white font-bold"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Progress Dashboard
              </h3>
            </div>
            <span className="material-symbols-outlined text-white opacity-80">trending_up</span>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex -space-x-3">
              {['A', 'B', 'C'].map((l, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    background: i === 2 ? '#007b8f' : `hsl(${190 + i * 20}, 60%, 45%)`,
                    border: '2px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
            <div className="h-10 w-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <div>
              <p className="text-white font-bold text-sm">4 New Interviews</p>
              <p className="text-xs" style={{ color: '#aaedff' }}>
                Scheduled for this week
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section
        className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16"
        style={{ background: '#f7f9fb' }}
      >
        <div className="w-full max-w-md space-y-10 animate-fade-in">
          {/* Mobile Branding */}
          <div className="md:hidden flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: '#006071' }}
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>
                architecture
              </span>
            </div>
            <span
              className="text-xl font-extrabold tracking-tight"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#006071' }}
            >
              Digital Architect
            </span>
          </div>

          {/* Header */}
          <div className="space-y-3">
            <h2
              className="text-sm font-bold tracking-widest uppercase"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#006071' }}
            >
              Welcome Back
            </h2>
            <h3
              className="text-4xl font-extrabold tracking-tight"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1e' }}
            >
              Sign in to Job Tracker
            </h3>
            <p style={{ color: '#3e484b' }}>Keep building your career roadmap.</p>
          </div>

          {/* Alerts */}
          {success && (
            <div
              className="px-4 py-3 text-sm rounded-xl animate-slide-down"
              style={{
                background: '#d1fae5',
                color: '#065f46',
                border: '1px solid #6ee7b7',
              }}
            >
              Login successful. Redirecting...
            </div>
          )}
          {error && (
            <div
              className="px-4 py-3 text-sm rounded-xl animate-slide-down"
              style={{
                background: '#ffdad6',
                color: '#93000a',
                border: '1px solid #fca5a5',
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email */}
            <div className="space-y-2">
              <label
                className="text-xs font-bold uppercase tracking-wider ml-1"
                htmlFor="email"
                style={{ color: '#3e484b' }}
              >
                Email Address
              </label>
              <div className="relative group">
                <span
                  className="absolute inset-y-0 left-0 pl-4 flex items-center transition-colors"
                  style={{ color: '#6e797c' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    mail
                  </span>
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@architect.com"
                  className="block w-full pl-11 pr-4 py-4 border-none rounded-xl outline-none transition-all"
                  style={{
                    background: '#e0e3e5',
                    color: '#191c1e',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 96, 113, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = '#e0e3e5';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label
                  className="text-xs font-bold uppercase tracking-wider"
                  htmlFor="password"
                  style={{ color: '#3e484b' }}
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-bold transition-opacity hover:opacity-80"
                  style={{ color: '#006071' }}
                >
                  Forgot?
                </a>
              </div>
              <div className="relative group">
                <span
                  className="absolute inset-y-0 left-0 pl-4 flex items-center"
                  style={{ color: '#6e797c' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    lock
                  </span>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-4 border-none rounded-xl outline-none transition-all"
                  style={{ background: '#e0e3e5', color: '#191c1e' }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 96, 113, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = '#e0e3e5';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                  style={{ color: '#6e797c' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full py-4 px-6 text-white font-bold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  background: 'linear-gradient(45deg, #006071, #007b8f)',
                  boxShadow: '0 4px 15px rgba(0, 96, 113, 0.2)',
                }}
                onMouseEnter={(e) =>
                  !isLoading && !success && (e.currentTarget.style.transform = 'translateY(-1px)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : success ? (
                  'Success!'
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center space-y-6">
            <p className="text-sm" style={{ color: '#3e484b' }}>
              New to the blueprint?{' '}
              <Link
                to="/register"
                className="font-bold hover:underline decoration-2 underline-offset-4"
                style={{ color: '#006071' }}
              >
                Create one
              </Link>
            </p>
          </div>

          {/* Legal */}
          <div className="text-center">
            <p className="text-[10px] leading-loose max-w-xs mx-auto" style={{ color: '#6e797c' }}>
              By signing in, you agree to our{' '}
              <a href="#" className="underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
