import React, { createContext, useContext, useState, useEffect } from 'react';
import type { VisionReport } from '../utils/visionCore';

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api(\/v1)?\/?$/, '') : 'http://127.0.0.1:8000';
const API_URL = `${BASE_URL}/api/v1`;

interface AuthContextType {
  user: any;
  role: string;
  activeProfile: string;
  setActiveProfile: (profile: string) => void;
  activeReport: VisionReport | null;
  setActiveReport: (report: VisionReport | null) => void;
  isCaregiverMode: boolean;
  setIsCaregiverMode: (mode: boolean) => void;
  addGlobalProfile: (profile: any) => void;
  login: (email: string, password?: string, name?: string, profile?: string, role?: string) => Promise<void>;
  register: (email: string, password?: string, name?: string, profile?: string, role?: string) => Promise<void>;
  logout: () => void;
  savedReports: any[];
  saveReport: (report: any) => void;
  deleteReport: (id: string) => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'patient',
  activeProfile: 'Standard Mode',
  setActiveProfile: () => {},
  activeReport: null,
  setActiveReport: () => {},
  isCaregiverMode: true,
  setIsCaregiverMode: () => {},
  addGlobalProfile: () => {},
  login: async () => {},
  register: async () => {},
  logout: () => {},
  savedReports: [],
  saveReport: () => {},
  deleteReport: () => {},
  isLoading: false,
  error: null
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>(localStorage.getItem('role') || 'patient');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeProfile, setActiveProfile] = useState(() => localStorage.getItem('neurolens_active_profile') || 'Standard Mode');
  const [activeReport, setActiveReport] = useState<VisionReport | null>(() => {
    const r = localStorage.getItem('neurolens_active_report');
    return r ? JSON.parse(r) : null;
  });
  const [isCaregiverMode, setIsCaregiverMode] = useState(true);

  useEffect(() => {
    localStorage.setItem('neurolens_active_profile', activeProfile);
  }, [activeProfile]);

  useEffect(() => {
    if (activeReport) {
      localStorage.setItem('neurolens_active_report', JSON.stringify(activeReport));
    } else {
      localStorage.removeItem('neurolens_active_report');
    }
  }, [activeReport]);
  
  const [savedReports, setSavedReports] = useState<any[]>(() => {
    const local = localStorage.getItem('neurolens_reports');
    return local ? JSON.parse(local) : [];
  });

  useEffect(() => {
    localStorage.setItem('neurolens_reports', JSON.stringify(savedReports));
  }, [savedReports]);

  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ name: data.full_name || 'User', email: data.email });
        setRole(data.role || 'patient');
      } else {
        // If real backend rejects token, clear it
        if (authToken !== 'mock_jwt_token_123') {
          setToken(null);
        }
      }
    } catch (err) {
      console.warn("Backend unavailable. Using mock user for demo.");
      // MOCK FALLBACK for Vercel Demo on refresh
      if (authToken === 'mock_jwt_token_123') {
        const mockName = localStorage.getItem('mock_user_name') || 'Demo User';
        const mockEmail = localStorage.getItem('mock_user_email') || 'demo@google.com';
        setUser({ name: mockName, email: mockEmail });
        // Can't reliably know role on refresh without local storage, default to patient
      }
    }
  };

  // Check token on mount and fetch user
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      fetchUser(token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setUser(null);
      setRole('patient');
    }
  }, [token, role]);

  const saveReport = (report: any) => {
    const newReport = {
      ...report,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    setSavedReports(prev => [newReport, ...prev]);
  };

  const deleteReport = (id: string) => {
    setSavedReports(prev => prev.filter(r => r.id !== id));
  };
  
  const register = async (email: string, password?: string, name?: string, profile?: string, userRole?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || 'default', full_name: name, role: userRole || 'patient' })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Registration failed');
      }
      // After successful registration, log them in
      await login(email, password, name, profile, userRole);
    } catch (err: any) {
      console.warn("Backend unavailable. Using mock registration for demo.");
      // MOCK FALLBACK for Vercel Demo
      await login(email, password, name, profile, userRole);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string, name?: string, profile?: string, userRole?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Guest Login logic (no password)
      if (email === 'demo@google.com' || !password) {
        const finalName = name || 'Guest User';
        setUser({ name: finalName, email });
        localStorage.setItem('mock_user_name', finalName);
        localStorage.setItem('mock_user_email', email);
        setRole(userRole || 'patient');
        applyProfile(profile);
        setIsLoading(false);
        return;
      }

      // Real API Login
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Login failed');
      }
      
      const data = await res.json();
      setToken(data.access_token);
      applyProfile(profile);
      // fetchUser will be triggered by token change and set the actual role

    } catch (err: any) {
      console.warn("Backend unavailable. Using mock login for demo.");
      // MOCK FALLBACK for Vercel Demo
      const finalName = name || 'Demo User';
      setUser({ name: finalName, email });
      localStorage.setItem('mock_user_name', finalName);
      localStorage.setItem('mock_user_email', email);
      setRole(userRole || 'patient');
      setToken('mock_jwt_token_123'); // Fake token so the app thinks we are logged in
      applyProfile(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const applyProfile = (profile?: string) => {
    if (profile) {
      setActiveProfile(profile);
      if (profile !== 'Standard Mode') {
        setIsCaregiverMode(false);
      } else {
        setIsCaregiverMode(true);
      }
    }
  }

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole('patient');
    localStorage.removeItem('mock_user_name');
    localStorage.removeItem('mock_user_email');
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      role,
      activeProfile, 
      setActiveProfile,
      activeReport,
      setActiveReport,
      isCaregiverMode,
      setIsCaregiverMode,
      addGlobalProfile: () => {}, 
      login,
      register,
      logout,
      savedReports,
      saveReport,
      deleteReport,
      isLoading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
