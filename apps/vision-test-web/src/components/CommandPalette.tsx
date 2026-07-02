import React, { useState, useEffect } from 'react';
import { Search, Eye, Settings, FileText, Users, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpen);
    };
  }, []);

  const commands = [
    { id: '1', title: 'Dashboard', icon: Monitor, action: () => navigate('/dashboard') },
    { id: '2', title: 'Run Vision Test', icon: Eye, action: () => { navigate('/dashboard'); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); } },
    { id: '3', title: 'Reports & Analytics', icon: FileText, action: () => navigate('/reports') },
    { id: '4', title: 'Manage Team', icon: Users, action: () => navigate('/team') },
    { id: '5', title: 'Account Settings', icon: Settings, action: () => navigate('/settings') },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      ></div>
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands... (e.g., 'Reports')"
            className="flex-1 bg-transparent border-none text-slate-800 focus:outline-none focus:ring-0 text-lg placeholder-slate-400"
          />
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded">
            <span>ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-medium">
              No results found for "{search}"
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl hover:bg-slate-50 text-slate-700 hover:text-emerald-600 transition-colors group"
                >
                  <cmd.icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                  <span className="font-semibold">{cmd.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
