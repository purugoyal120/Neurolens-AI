import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Power, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const BookmarkletCard: React.FC = () => {
  const { activeReport } = useAuth();
  const { addToast } = useToast();
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    // Check if previously activated
    const activated = localStorage.getItem('neurolens_extension_enabled') === 'true';
    setIsActivated(activated);
  }, []);

  const handleActivate = () => {
    if (isActivated) {
      // Deactivate
      localStorage.removeItem('neurolens_extension_enabled');
      setIsActivated(false);
      addToast('Neurolens System Deactivated.', 'info');
      return;
    }

    const confirmActivation = window.confirm(
      "Do you want to grant Neurolens permission to automatically adapt colors on all websites you visit?"
    );
    
    if (confirmActivation) {
      localStorage.setItem('neurolens_extension_enabled', 'true');
      setIsActivated(true);
      addToast('Neurolens System Activated! The Browser Extension will now apply your profile everywhere.', 'success');
    }
  };

  const profileDisplay = activeReport ? activeReport.clinical_diagnosis : "No Profile (Standard)";

  return (
    <div className={`rounded-3xl p-6 border shadow-xl shadow-slate-200/50 relative overflow-hidden group h-full flex flex-col transition-colors duration-500 ${isActivated ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-10 transition-transform duration-700 ${isActivated ? 'bg-emerald-500/10 scale-150' : 'bg-emerald-500/5 group-hover:scale-110'}`}></div>
      
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Power className={`w-5 h-5 ${isActivated ? 'text-emerald-600' : 'text-slate-400'}`} />
            <h3 className="text-lg font-bold text-slate-800">System Activation</h3>
          </div>
          <p className="text-sm font-medium text-slate-500">Apply your vision profile to ALL websites</p>
        </div>
      </div>

      <div className={`rounded-2xl p-4 mb-6 border flex items-center justify-between transition-colors ${isActivated ? 'bg-emerald-100/50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Diagnostic Profile</div>
          <div className={`font-bold px-3 py-1.5 rounded-xl border inline-block ${isActivated ? 'text-emerald-700 bg-white border-emerald-300 shadow-sm' : 'text-slate-600 bg-white border-slate-200'}`}>
            {profileDisplay}
          </div>
        </div>
        <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
        <div className="text-right flex items-center gap-2 hidden sm:flex">
          <ShieldCheck className={`w-4 h-4 ${isActivated ? 'text-emerald-500' : 'text-slate-400'}`} />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custom Matrix</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center py-4">
        <div className="text-center animate-in fade-in duration-300">
          <div className="mb-4 text-sm font-medium text-slate-500">
            {isActivated ? "System is actively filtering your web." : "1-Click to activate Neurolens globally."}
          </div>
          <button
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-extrabold text-lg shadow-xl transition-all duration-300 border-2 border-white ${
              isActivated 
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-emerald-500/10' 
                : 'bg-emerald-500 text-white hover:scale-105 hover:bg-emerald-400 shadow-emerald-500/30'
            }`}
            onClick={handleActivate}
          >
            {isActivated ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                System Activated
              </>
            ) : (
              <>
                <Power className="w-5 h-5" />
                Activate Neurolens
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
        <span className="text-slate-400 font-medium">Auto-syncs with Chrome Extension</span>
        <span className={`font-bold ${isActivated ? 'text-emerald-600' : 'text-slate-400'}`}>
          {isActivated ? 'Live Connection Active' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
};
