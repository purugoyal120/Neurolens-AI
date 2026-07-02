import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, FileText, Users, Layers, Settings, LogOut, Eye, SplitSquareHorizontal, FolderOpen } from 'lucide-react';
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
        <Link to="/" className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform cursor-pointer" title="Go to Landing Page">
          <Eye className="w-6 h-6 text-white" />
        </Link>

        {/* Nav Icons */}
        <nav className="flex flex-col gap-6 flex-1">
          <NavLink to="/dashboard" end className={navClass} title="Dashboard">
            <Home className="w-5 h-5" />
          </NavLink>
          <NavLink to="/reports" className={navClass} title="Reports">
            <FileText className="w-5 h-5" />
          </NavLink>
          <NavLink to="/reports-history" className={navClass} title="My Reports (History)">
            <FolderOpen className="w-5 h-5" />
          </NavLink>
          <NavLink to="/integrations" className={navClass} title="Integrations">
            <Layers className="w-5 h-5" />
          </NavLink>
          <NavLink to="/team" className={navClass} title="Team">
            <Users className="w-5 h-5" />
          </NavLink>
          <NavLink to="/simulator" className={navClass} title="Vision Simulator">
            <SplitSquareHorizontal className="w-5 h-5" />
          </NavLink>
          <NavLink to="/settings" className={navClass} title="Settings">
            <Settings className="w-5 h-5" />
          </NavLink>
        </nav>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all mt-auto"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </aside>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-white/80 backdrop-blur-md border-t border-slate-200/50 z-[100] flex justify-around items-center px-2 pb-safe">
        <NavLink to="/dashboard" end className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-500'}`}>
          <Home className="w-6 h-6" />
        </NavLink>
        
        {/* Mobile FAB */}
        <div className="relative -top-5">
          <Link to="/" className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white" title="Go to Landing Page">
            <Eye className="w-6 h-6 text-white" />
          </Link>
        </div>

        <NavLink to="/reports" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'}`}>
          <FileText className="w-6 h-6" />
        </NavLink>
        <NavLink to="/simulator" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'}`}>
          <SplitSquareHorizontal className="w-6 h-6" />
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'}`}>
          <Settings className="w-6 h-6" />
        </NavLink>
      </div>
    </>
  );
};
