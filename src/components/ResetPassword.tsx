import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/SupabaseAuthContext';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid recovery session from the URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (!accessToken || type !== 'recovery') {
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
          </div>
          <h2 className="font-headline text-2xl font-bold text-primary mb-2">Password Updated!</h2>
          <p className="text-text-primary-light/70 dark:text-text-primary-dark/70">
            Your password has been successfully reset. Redirecting you to the homepage...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="font-headline text-3xl font-bold text-primary">Set New Password</h2>
          <p className="mt-2 text-text-primary-light/70 dark:text-text-primary-dark/70">
            Enter your new password below
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !!error}
            className="w-full py-3 rounded-full bg-primary text-white font-bold shadow-primary-soft hover:bg-[#a15842] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-primary hover:underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
