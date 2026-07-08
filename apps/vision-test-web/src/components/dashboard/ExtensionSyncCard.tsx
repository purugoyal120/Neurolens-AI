import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Monitor, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export const ExtensionSyncCard: React.FC = () => {
  const { activeProfile } = useAuth();
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Check if extension is installed by looking for the DOM marker
  useEffect(() => {
    const checkExtension = () => {
      const marker = document.getElementById('neurolens-extension-installed');
      setIsExtensionInstalled(!!marker);
    };
    
    // Check immediately and then poll a few times in case script loaded late
    checkExtension();
    const interval = setInterval(checkExtension, 1000);
    
    // Listen for sync success messages from extension
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NEUROLENS_SYNC_SUCCESS') {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleSync = () => {
    if (!isExtensionInstalled) return;
    setSyncStatus('syncing');
    
    // Dispatch message to window, extension content script will catch it
    window.postMessage({ 
      type: 'NEUROLENS_SYNC_PROFILE', 
      profile: activeProfile 
    }, '*');
    
    // Fallback in case we don't get a response
    setTimeout(() => {
      setSyncStatus((prev) => {
        if (prev === 'syncing') {
          setTimeout(() => setSyncStatus('idle'), 3000);
          return 'error';
        }
        return prev;
      });
    }, 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
      
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Monitor className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-slate-800">Chrome Extension</h3>
          </div>
          <p className="text-sm font-medium text-slate-500">Connect Web Profile to your Browser</p>
        </div>
        
        {isExtensionInstalled ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-xs font-bold text-blue-700">Installed</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold text-amber-700">Not Detected</span>
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Profile</div>
          <div className="font-bold text-slate-800">{activeProfile}</div>
        </div>
        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
        <div className="text-right">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
          <div className="font-bold text-slate-800">
            {syncStatus === 'success' ? 'Synced ✅' : 'Ready'}
          </div>
        </div>
      </div>

      <button
        onClick={handleSync}
        disabled={!isExtensionInstalled || syncStatus === 'syncing'}
        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
          !isExtensionInstalled
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : syncStatus === 'syncing'
            ? 'bg-blue-50 text-blue-500 cursor-wait'
            : syncStatus === 'success'
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
            : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'
        }`}
      >
        {syncStatus === 'syncing' ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Syncing Profile...
          </>
        ) : syncStatus === 'success' ? (
          <>
            <CheckCircle className="w-5 h-5" />
            Successfully Synced!
          </>
        ) : !isExtensionInstalled ? (
          'Please Install Extension'
        ) : (
          <>
            <RefreshCw className="w-5 h-5" />
            Sync Profile to Extension
          </>
        )}
      </button>
      
      {!isExtensionInstalled && (
        <p className="text-xs font-medium text-slate-400 mt-4 text-center">
          Install the NeuroLens Chrome Extension to enable real-time daltonization on all websites.
        </p>
      )}
    </div>
  );
};
