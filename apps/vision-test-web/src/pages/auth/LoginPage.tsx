import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/layout/AuthLayout';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled in context and displayed below
    }
  };

  const handleGuestLogin = async () => {
    await login('demo@google.com'); // Trigger guest mode
    navigate('/dashboard');
  };

  return (
    <AuthLayout>
      <form className="space-y-6" onSubmit={handleSubmit}>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700">Email address</label>
          <div className="mt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-colors"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Password</label>
          <div className="mt-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
              Forgot password?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>

      <div className="mt-8 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-slate-500 font-medium">Or continue with</span>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full flex justify-center py-3 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Continue as Guest
        </button>
      </div>
      
      <p className="mt-8 text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};
