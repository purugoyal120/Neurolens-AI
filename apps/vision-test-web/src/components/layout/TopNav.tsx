import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Info, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


export const TopNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const links = ['Overview', 'Simulator', 'Reports', 'Integrations', 'Team', 'Settings'];

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openSearch = () => {
    window.dispatchEvent(new Event('open-command-palette'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };



  return (
    <div className="flex items-center justify-between w-full mb-8 pt-4 relative z-50">
      {/* Left Navigation Pill */}
      <div className="bg-white rounded-full px-1.5 py-1.5 flex items-center shadow-sm">
        {links.map((link) => {
          const path = link === 'Overview' ? '/dashboard' : `/${link.toLowerCase()}`;
          const isActive = location.pathname === path;
          return (
            <Link
              key={link}
              to={path}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {link}
            </Link>
          );
        })}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        


        {/* Actions Pill */}
        <div className="bg-white rounded-full px-5 py-2.5 flex items-center gap-6 shadow-sm">
          <button onClick={openSearch} className="text-slate-500 hover:text-emerald-500 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              className="text-slate-500 hover:text-emerald-500 transition-colors relative flex items-center"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <h4 className="font-bold text-slate-800">Notifications</h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                    <p className="text-sm text-slate-800 font-medium">Vision Profile successfully synced to Extension.</p>
                    <span className="text-xs text-slate-400">2 minutes ago</span>
                  </div>
                </div>
                <div className="px-4 py-2 text-center border-t border-slate-100 hover:bg-slate-50 cursor-pointer text-sm text-emerald-600 font-bold transition-colors">
                  Mark all as read
                </div>
              </div>
            )}
          </div>

          <button className="text-slate-500 hover:text-emerald-500 transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Pill */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="bg-white rounded-full p-1.5 pr-4 flex items-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-emerald-100"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 overflow-hidden flex items-center justify-center">
              <span className="text-emerald-700 font-bold text-lg">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 leading-tight">{user?.name || 'User'}</span>
              <span className="text-[10px] text-slate-500 leading-tight">Pro Plan</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 ml-2 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </div>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-bold text-lg">{user?.name?.charAt(0) || 'U'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 leading-tight">{user?.name || 'User'}</span>
                  <span className="text-xs text-slate-500 leading-tight">Pro Plan</span>
                </div>
              </div>
              <div className="py-2">
                <button onClick={() => { navigate('/settings'); setShowProfileMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2 transition-colors">
                  <User className="w-4 h-4" /> My Profile
                </button>
                <button onClick={() => { navigate('/settings'); setShowProfileMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2 transition-colors">
                  <Settings className="w-4 h-4" /> Account Settings
                </button>
              </div>
              <div className="border-t border-slate-100 py-2">
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-rose-600 font-semibold hover:bg-rose-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};