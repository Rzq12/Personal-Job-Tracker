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
      setTimeout(() => navigate('/'), 500);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  const inputStyle = {
    background: '#e0e3e5',
    color: '#191c1e',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '1rem 1rem 1rem 2.75rem',
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.background = '#ffffff';
    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 96, 113, 0.2)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.background = '#e0e3e5';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <main
      className="min-h-screen flex flex-col md:flex-row overflow-hidden"
      style={{ background: '#f7f9fb' }}
    >
      {/* Left Branding Side */}
      <section
        className="hidden md:flex md:w-1/2 p-16 flex-col justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(45deg, #006071 0%, #007b8f 100%)' }}
      >
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: '#007b8f', mixBlendMode: 'multiply' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: '#0078a3', mixBlendMode: 'multiply' }}
        />

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

        <div className="relative z-10 max-w-lg">
          <h1
            className="text-5xl font-extrabold text-white leading-[1.1] mb-8"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Build your focused job search workspace.
          </h1>
          <p className="text-lg opacity-90 leading-relaxed" style={{ color: '#aaedff' }}>
            Organize applications, prepare for interviews, and track every opportunity from one clean
            dashboard.
          </p>
        </div>

        <div
          className="relative z-10 p-8 max-w-md"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '0.75rem',
          }}
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#aaedff' }}>
            Fast Onboarding
          </p>
          <p
            className="text-xl font-bold text-white"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Create your account in under a minute.
          </p>
        </div>
      </section>

      {/* Right Form Side */}
      <section
        className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16"
        style={{ background: '#f7f9fb' }}
      >
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile branding */}
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

          <div className="space-y-3">
            <h2
              className="text-sm font-bold tracking-widest uppercase"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#006071' }}
            >
              Get Started
            </h2>
            <h3
              className="text-4xl font-extrabold tracking-tight"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1e' }}
            >
              Create your account
            </h3>
            <p style={{ color: '#3e484b' }}>
              Set up your profile and start tracking applications today.
            </p>
          </div>

          {success && (
            <div
              className="px-4 py-3 text-sm rounded-xl animate-slide-down"
              style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' }}
            >
              Account created successfully. Redirecting...
            </div>
          )}
          {error && (
            <div
              className="px-4 py-3 text-sm rounded-xl animate-slide-down"
              style={{ background: '#ffdad6', color: '#93000a', border: '1px solid #fca5a5' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {[
              { id: 'name', label: 'Name (optional)', type: 'text', value: name, setter: setName, placeholder: 'Your full name', icon: 'person', required: false },
              { id: 'email', label: 'Email Address', type: 'email', value: email, setter: setEmail, placeholder: 'name@architect.com', icon: 'mail', required: true },
              { id: 'password', label: 'Password', type: 'password', value: password, setter: setPassword, placeholder: '••••••••', icon: 'lock', required: true },
              { id: 'confirmPassword', label: 'Confirm Password', type: 'password', value: confirmPassword, setter: setConfirmPassword, placeholder: '••••••••', icon: 'lock_reset', required: true },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <label
                  htmlFor={field.id}
                  className="text-xs font-bold uppercase tracking-wider ml-1 block"
                  style={{ color: '#3e484b' }}
                >
                  {field.label}
                </label>
                <div className="relative">
                  <span
                    className="absolute inset-y-0 left-0 pl-4 flex items-center"
                    style={{ color: '#6e797c' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {field.icon}
                    </span>
                  </span>
                  <input
                    id={field.id}
                    type={field.type}
                    required={field.required}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    className="block w-full pl-11 pr-4 py-4 border-none rounded-xl outline-none transition-all"
                    style={{ background: '#e0e3e5', color: '#191c1e' }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
                {field.id === 'password' && (
                  <p className="text-xs ml-1" style={{ color: '#6e797c' }}>
                    At least 6 characters
                  </p>
                )}
              </div>
            ))}

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
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </>
                ) : success ? 'Success!' : 'Create Account'}
              </button>
            </div>
          </form>

          <p className="text-center text-sm" style={{ color: '#3e484b' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold hover:underline decoration-2 underline-offset-4"
              style={{ color: '#006071' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
