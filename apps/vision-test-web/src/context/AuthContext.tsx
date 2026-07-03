import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

interface AuthContextType {
  user: any;
  activeProfile: string;
  setActiveProfile: (profile: string) => void;
  isCaregiverMode: boolean;
  setIsCaregiverMode: (mode: boolean) => void;
  addGlobalProfile: (profile: any) => void;
  login: (email: string, password?: string, name?: string, profile?: string) => Promise<void>;
  register: (email: string, password?: string, name?: string, profile?: string) => Promise<void>;
  logout: () => void;
  savedReports: any[];
  saveReport: (report: any) => void;
  deleteReport: (id: string) => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  activeProfile: 'Standard Mode',
  setActiveProfile: () => {},
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
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeProfile, setActiveProfile] = useState('Standard Mode');
  const [isCaregiverMode, setIsCaregiverMode] = useState(true);
  
  const [savedReports, setSavedReports] = useState<any[]>(() => {
    const local = localStorage.getItem('neurolens_reports');
    return local ? JSON.parse(local) : [];
  });

  useEffect(() => {
    localStorage.setItem('neurolens_reports', JSON.stringify(savedReports));
  }, [savedReports]);

  // Check token on mount and fetch user
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUser(token);
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ name: data.full_name || 'User', email: data.email });
      } else {
        setToken(null);
      }
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

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
  
  const register = async (email: string, password?: string, name?: string, profile?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || 'default', full_name: name })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Registration failed');
      }
      // After successful registration, log them in
      await login(email, password, name, profile);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string, name?: string, profile?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Guest Login logic (no password)
      if (email === 'demo@google.com' || !password) {
        setUser({ name: name || 'Guest User', email });
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

    } catch (err: any) {
      setError(err.message);
      throw err;
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
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      activeProfile, 
      setActiveProfile,
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
