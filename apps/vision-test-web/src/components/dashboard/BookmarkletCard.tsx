import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MousePointerClick, ShieldCheck, HelpCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const BookmarkletCard: React.FC = () => {
  const { activeProfile } = useAuth();
  const { addToast } = useToast();
  const [showHelp, setShowHelp] = useState(false);

  // Generate the Bookmarklet Code dynamically based on user's Active Profile
  const getBookmarkletCode = (profile: string) => {
    let matrix = "1,0,0,0,0 0,1,0,0,0 0,0,1,0,0 0,0,0,1,0"; // Standard (no change)
    if (profile === 'Protanopia Mode') {
      matrix = "0.567, 0.433, 0, 0, 0,  0.558, 0.442, 0, 0, 0,  0, 0.242, 0.758, 0, 0,  0, 0, 0, 1, 0";
    } else if (profile === 'Deuteranopia Mode') {
      matrix = "0.625, 0.375, 0, 0, 0,  0.7, 0.3, 0, 0, 0,  0, 0.3, 0.7, 0, 0,  0, 0, 0, 1, 0";
    } else if (profile === 'Tritanopia Mode') {
      matrix = "0.95, 0.05, 0, 0, 0,  0, 0.433, 0.567, 0, 0,  0, 0.475, 0.525, 0, 0,  0, 0, 0, 1, 0";
    }

    // Minified JavaScript URI
    const jsCode = `
      if(document.getElementById('neurolens-filter-container')) {
        document.getElementById('neurolens-filter-container').remove();
        document.documentElement.style.filter = '';
        const oldToast = document.getElementById('nl-toast');
        if(oldToast) oldToast.remove();
        return;
      }
      const svg = '<svg id="neurolens-filter-container" style="width:0;height:0;position:fixed;z-index:-1;"><defs><filter id="nl-dalton"><feColorMatrix type="matrix" values="${matrix}"/></filter></defs></svg>';
      document.body.insertAdjacentHTML('beforeend', svg);
      document.documentElement.style.filter = 'url(#nl-dalton)';
      
      const toast = document.createElement('div');
      toast.id = 'nl-toast';
      toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#10b981;color:white;padding:12px 24px;border-radius:12px;font-family:sans-serif;font-weight:bold;z-index:999999;box-shadow:0 10px 25px -5px rgba(16,185,129,0.4);border:1px solid rgba(255,255,255,0.2);';
      toast.innerHTML = '✨ Neurolens Active: <b>${profile}</b>';
      document.body.appendChild(toast);
      setTimeout(function(){ toast.style.opacity = '0'; toast.style.transition = 'opacity 0.5s'; setTimeout(function(){toast.remove()}, 500); }, 3000);
    `.replace(/\n/g, '').replace(/\s+/g, ' ');

    return `javascript:(function(){${jsCode}})()`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getBookmarkletCode(activeProfile));
    addToast('Bookmarklet code copied! You can manually paste it into a new bookmark URL.', 'success');
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group h-full flex flex-col">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
      
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MousePointerClick className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-800">Browser Bookmarklet</h3>
          </div>
          <p className="text-sm font-medium text-slate-500">Apply your vision profile to ANY website</p>
        </div>
        
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          title="How to install"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Configured Profile</div>
          <div className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
            {activeProfile}
          </div>
        </div>
        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
        <div className="text-right flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Safe Script</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center py-4">
        {showHelp ? (
          <div className="text-sm text-slate-600 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 animate-in fade-in zoom-in duration-300 w-full">
            <ol className="list-decimal pl-5 space-y-2 font-medium">
              <li>Make sure your browser's <b>Bookmarks Bar</b> is visible (Ctrl+Shift+B or Cmd+Shift+B).</li>
              <li>Click and hold the big green button below.</li>
              <li>Drag it up to your Bookmarks Bar and drop it.</li>
              <li>Open any website (like Wikipedia), and click your new bookmark!</li>
            </ol>
          </div>
        ) : (
          <div className="text-center animate-in fade-in duration-300">
            <div className="mb-4 text-sm font-medium text-slate-500">Drag this button to your bookmarks bar ⬇️</div>
            <a
              href={getBookmarkletCode(activeProfile)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-full font-extrabold text-lg shadow-xl shadow-emerald-500/30 hover:scale-105 transition-transform cursor-grab active:cursor-grabbing hover:bg-emerald-400 border-2 border-white"
              onClick={(e) => {
                e.preventDefault();
                addToast("Don't click! Drag this button to your bookmarks bar.", "warning");
              }}
              title="Drag me to your bookmarks bar!"
            >
              <MousePointerClick className="w-5 h-5" />
              Neurolens AI
            </a>
          </div>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
        <span className="text-slate-400 font-medium">Updates automatically when dragged</span>
        <button onClick={handleCopyCode} className="text-emerald-600 font-bold hover:text-emerald-700 underline">
          Copy Manual Code
        </button>
      </div>
    </div>
  );
};
