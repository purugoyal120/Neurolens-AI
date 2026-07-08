import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/layout/AuthLayout';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const { register, saveReport, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlRole = searchParams.get('role');
  
  // Update initial role if urlRole is present and role hasn't been explicitly set yet
  React.useEffect(() => {
    if (urlRole === 'patient' || urlRole === 'doctor') {
      setRole(urlRole);
    }
  }, [urlRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const profile = location.state?.profile || 'Standard Mode';
      
      await register(email, password, name, profile, role);
      
      if (location.state?.reportData && role === 'patient') {
        saveReport(location.state.reportData);
      }

      navigate('/dashboard');
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <AuthLayout>
      <form className="space-y-6" onSubmit={handleSubmit}>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {!urlRole && (
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="role" 
                value="patient" 
                checked={role === 'patient'} 
                onChange={() => setRole('patient')} 
                className="text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm font-semibold text-slate-700">I am a Patient</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="role" 
                value="doctor" 
                checked={role === 'doctor'} 
                onChange={() => setRole('doctor')} 
                className="text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm font-semibold text-slate-700">I am a Doctor/Clinic</span>
            </label>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700">Full Name</label>
          <div className="mt-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium transition-colors"
              placeholder="Jane Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Email address</label>
          <div className="mt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium transition-colors"
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
              minLength={6}
              className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};
