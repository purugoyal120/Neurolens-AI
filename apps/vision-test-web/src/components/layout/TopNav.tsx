import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Info, ChevronDown, LogOut, User, Sun, Moon, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';


export const TopNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, setMode } = useTheme();
  const { notifications, unreadCount, markAllAsRead } = useNotification();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const links = ['Overview', 'Simulator', 'Reports', 'Integrations', 'Settings'];

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
    <div className="flex flex-col md:flex-row items-center justify-between w-full mb-8 pt-4 gap-4 relative z-50">
      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="bg-white p-3 rounded-full shadow-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Left Navigation Pill */}
        <div className="bg-white rounded-full px-1.5 py-1.5 flex items-center shadow-sm overflow-x-auto no-scrollbar w-full md:w-auto">
        {links.map((link) => {
          const path = link === 'Overview' ? '/dashboard' : `/${link.toLowerCase()}`;
          const isActive = location.pathname === path;
          return (
            <Link
              key={link}
              to={path}
              className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
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
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-end">
        


        {/* Actions Pill */}
        <div className="bg-white rounded-full px-5 py-2.5 flex items-center gap-6 shadow-sm">
          <button 
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} 
            className="text-slate-500 hover:text-amber-500 transition-colors"
            title="Toggle Theme"
          >
            {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button onClick={openSearch} className="text-slate-500 hover:text-blue-500 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              className="text-slate-500 hover:text-blue-500 transition-colors relative flex items-center"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h4 className="font-bold text-slate-800">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-slate-500 text-sm">
                      No new notifications.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`px-4 py-3 border-b border-slate-50 transition-colors cursor-pointer ${notif.isRead ? 'hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}>
                        <p className={`text-sm font-medium ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{notif.message}</p>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{notif.time}</span>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <button onClick={markAllAsRead} className="w-full px-4 py-2 text-center border-t border-slate-100 hover:bg-slate-50 text-sm text-blue-600 font-bold transition-colors">
                    Mark all as read
                  </button>
                )}
              </div>
            )}
          </div>

          <button className="text-slate-500 hover:text-blue-500 transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Pill */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="bg-white rounded-full p-1.5 pr-4 flex items-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-blue-100"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center">
              <span className="text-blue-700 font-bold text-lg">{user?.name?.charAt(0) || 'U'}</span>
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
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-lg">{user?.name?.charAt(0) || 'U'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 leading-tight">{user?.name || 'User'}</span>
                  <span className="text-xs text-slate-500 leading-tight">Pro Plan</span>
                </div>
              </div>
              <div className="py-2">
                <button onClick={() => { navigate('/settings'); setShowProfileMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors">
                  <User className="w-4 h-4" /> My Profile
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