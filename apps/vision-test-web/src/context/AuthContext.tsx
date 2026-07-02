import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any;
  activeProfile: string;
  setActiveProfile: (profile: string) => void;
  isCaregiverMode: boolean;
  setIsCaregiverMode: (mode: boolean) => void;
  addGlobalProfile: (profile: any) => void;
  login: (email: string, name?: string, profile?: string) => void;
  logout: () => void;
  savedReports: any[];
  saveReport: (report: any) => void;
  deleteReport: (id: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  activeProfile: 'Standard Mode',
  setActiveProfile: () => {},
  isCaregiverMode: true,
  setIsCaregiverMode: () => {},
  addGlobalProfile: () => {},
  login: () => {},
  logout: () => {},
  savedReports: [],
  saveReport: () => {},
  deleteReport: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>({ name: 'Puru' });
  const [activeProfile, setActiveProfile] = useState('Deuteranopia Mode');
  const [isCaregiverMode, setIsCaregiverMode] = useState(true);
  const [savedReports, setSavedReports] = useState<any[]>(() => {
    const local = localStorage.getItem('neurolens_reports');
    return local ? JSON.parse(local) : [];
  });

  useEffect(() => {
    localStorage.setItem('neurolens_reports', JSON.stringify(savedReports));
  }, [savedReports]);

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
  
  const login = (email: string, name?: string, profile?: string) => {
    setUser({ name: name || 'User', email });
    if (profile) {
      setActiveProfile(profile);
      if (profile !== 'Standard Mode') {
        setIsCaregiverMode(false);
      } else {
        setIsCaregiverMode(true);
      }
    }
  };

  const logout = () => {
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
      logout,
      savedReports,
      saveReport,
      deleteReport
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
