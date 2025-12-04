import React, { useState } from 'react';
import { useAuth } from '../context/SupabaseAuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, register, resetPassword } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  // Reset form when mode changes to prevent controlled/uncontrolled input warnings
  React.useEffect(() => {
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
    });
    setError('');
    setSuccess('');
  }, [mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        await resetPassword(formData.email);
        setSuccess('Password reset email sent! Check your inbox.');
        setIsLoading(false);
        return;
      } else if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone || undefined,
        });
      }
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-background-dark rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="font-headline text-3xl font-bold text-primary">
              {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join Mehendi' : 'Reset Password'}
            </h2>
            <p className="mt-2 text-text-primary-light/70 dark:text-text-primary-dark/70">
              {mode === 'login' 
                ? 'Admin access only - Regular users can use all features without login' 
                : mode === 'register'
                ? 'Create an admin account'
                : 'Enter your email to receive a reset link'}
            </p>
          </div>

          {error && (
            <div 
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          {success && (
            <div 
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm"
              role="alert"
              aria-live="polite"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="auth-name" className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  id="auth-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Priya Sharma"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="auth-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label htmlFor="auth-password" className="block text-sm font-medium mb-1">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label htmlFor="auth-phone" className="block text-sm font-medium mb-1">Phone (Optional)</label>
                <input
                  id="auth-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="+91 7011489500"
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !!success}
              className="w-full py-3 rounded-full bg-primary text-white font-bold shadow-primary-soft hover:bg-[#a15842] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : mode === 'login' ? (
                'Admin Sign In'
              ) : mode === 'register' ? (
                'Create Admin Account'
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === 'forgot' ? (
              <p className="text-sm text-text-primary-light/70 dark:text-text-primary-dark/70">
                Remember your password?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary font-semibold hover:underline"
                >
                  Back to Sign in
                </button>
              </p>
            ) : (
              <p className="text-sm text-text-primary-light/70 dark:text-text-primary-dark/70">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-primary font-semibold hover:underline"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
