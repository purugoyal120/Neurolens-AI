import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MousePointerClick, ShieldCheck, HelpCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { calculateColorMatrix } from '../../utils/visionCore';

export const BookmarkletCard: React.FC = () => {
  const { activeReport } = useAuth();
  const { addToast } = useToast();
  const [showHelp, setShowHelp] = useState(false);

  // Generate the Bookmarklet Code dynamically based on user's exact diagnostic report
  const getBookmarkletCode = () => {
    const matrix = calculateColorMatrix(activeReport);
    const profileName = activeReport ? activeReport.clinical_diagnosis : "Standard Mode";

    const rawJs = `javascript:(function(){var s=document.getElementById('nl-style');if(s){s.remove();alert('Neurolens Filter Removed');return;}var svg='<svg xmlns="http://www.w3.org/2000/svg"><filter id="f"><feColorMatrix type="matrix" values="${matrix}"/></filter></svg>';var css='html{-webkit-filter:url("data:image/svg+xml;utf8,'+encodeURIComponent(svg)+'#f")!important;filter:url("data:image/svg+xml;utf8,'+encodeURIComponent(svg)+'#f")!important;}';var sty=document.createElement('style');sty.id='nl-style';sty.innerHTML=css;document.head.appendChild(sty);alert('Neurolens Active: ${profileName}');})()`;
    return encodeURI(rawJs.replace(/\n/g, '').trim());
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getBookmarkletCode());
    addToast('Bookmarklet code copied! You can manually paste it into a new bookmark URL.', 'success');
  };

  const profileDisplay = activeReport ? activeReport.clinical_diagnosis : "No Profile (Standard)";

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
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Diagnostic Profile</div>
          <div className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-block">
            {profileDisplay}
          </div>
        </div>
        <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
        <div className="text-right flex items-center gap-2 hidden sm:flex">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custom Matrix</span>
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
              href={getBookmarkletCode()}
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
        <span className="text-slate-400 font-medium">Auto-synced with test results</span>
        <button onClick={handleCopyCode} className="text-emerald-600 font-bold hover:text-emerald-700 underline">
          Copy Manual Code
        </button>
      </div>
    </div>
  );
};
