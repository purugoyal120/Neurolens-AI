import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, FileText, Layers, Settings, LogOut, Eye, SplitSquareHorizontal, FolderOpen, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const { addToast } = useToast();

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'success');
  };

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `w-12 h-12 rounded-full flex items-center justify-center transition-all ${
      isActive 
        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' 
        : 'text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm'
    }`;

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-[80px] h-full bg-[#f4f6f8] flex-col items-center py-6 border-r border-slate-200/50 relative z-50 shrink-0">
        {/* Brand Icon */}
        <Link to="/" className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform cursor-pointer" title="Go to Landing Page">
          <Eye className="w-6 h-6 text-white" />
        </Link>

        {/* Nav Icons */}
        <nav className="flex flex-col gap-6 flex-1">
          <NavLink to="/dashboard" end className={navClass} title="Dashboard">
            <Home className="w-5 h-5" />
          </NavLink>
          <NavLink to="/reports" className={navClass} title="My Reports (History)">
            <FileText className="w-5 h-5" />
          </NavLink>
          <NavLink to="/analytics" className={navClass} title="Enterprise Analytics">
            <FolderOpen className="w-5 h-5" />
          </NavLink>
          <NavLink to="/integrations" className={navClass} title="Integrations">
            <Layers className="w-5 h-5" />
          </NavLink>
          <NavLink to="/simulator" className={navClass} title="Vision Simulator">
            <SplitSquareHorizontal className="w-5 h-5" />
          </NavLink>
          <NavLink to="/future" className={navClass} title="Future Vision (Mobile/AR)">
            <Smartphone className="w-5 h-5" />
          </NavLink>
          <NavLink to="/settings" className={navClass} title="Settings">
            <Settings className="w-5 h-5" />
          </NavLink>
        </nav>

        {/* Upgrade & Logout Group */}
        <div className="mt-auto flex flex-col items-center gap-4">
          <Link 
            to="/pricing"
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
            title="Upgrade to Pro"
          >
            <span className="font-extrabold text-lg">PRO</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-white/80 backdrop-blur-md border-t border-slate-200/50 z-[100] flex justify-around items-center px-2 pb-safe">
        <NavLink to="/dashboard" end className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500'}`}>
          <Home className="w-6 h-6" />
        </NavLink>
        
        {/* Mobile FAB */}
        <div className="relative -top-5">
          <Link to="/" className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white" title="Go to Landing Page">
            <Eye className="w-6 h-6 text-white" />
          </Link>
        </div>

        <NavLink to="/reports" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}>
          <FileText className="w-6 h-6" />
        </NavLink>
        <NavLink to="/simulator" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}>
          <SplitSquareHorizontal className="w-6 h-6" />
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}>
          <Settings className="w-6 h-6" />
        </NavLink>
      </div>
    </>
  );
};
