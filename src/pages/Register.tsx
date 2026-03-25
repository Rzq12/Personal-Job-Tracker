import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name || undefined);
      setSuccess(true);
      // Wait for animation before navigating
      setTimeout(() => navigate('/'), 500);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-300/40 lg:grid-cols-[1.1fr_1fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-sky-700 to-cyan-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute bottom-6 left-2 h-44 w-44 rounded-full bg-indigo-300/20 blur-3xl" />
          <div className="relative">
            <p className="mb-3 inline-flex rounded-full border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
              New Account
            </p>
            <h1 className="max-w-md text-4xl font-bold leading-tight">
              Build your focused job search workspace.
            </h1>
            <p className="mt-4 max-w-md text-cyan-100/90">
              Organize applications, prepare interviews, and track every opportunity from one clean
              dashboard.
            </p>
          </div>
          <div className="relative rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-cyan-100">Fast onboarding</p>
            <p className="mt-1 text-2xl font-semibold">Create your account in under a minute.</p>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md animate-fade-in">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Get Started
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Create your account</h2>
              <p className="mt-2 text-sm text-slate-500">
                Set up your profile and start tracking applications today.
              </p>
            </div>

            {success && (
              <div
                className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 animate-slide-down"
                role="status"
                aria-live="polite"
              >
                Account created successfully. Redirecting...
              </div>
            )}

            {error && (
              <div
                className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 animate-slide-down"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Name (optional)
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-slate-500">At least 6 characters</p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || success}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
                    Creating account...
                  </>
                ) : success ? (
                  'Success!'
                ) : (
                  'Sign up'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-cyan-700 transition hover:text-cyan-800"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
