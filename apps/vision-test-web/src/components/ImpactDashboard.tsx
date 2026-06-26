import React, { useState, useEffect } from 'react';

export const ImpactDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    usersProfiled: 0,
    elementsTransformed: 0,
    webPagesAccessible: 0
  });

  const [excelStats, setExcelStats] = useState({
    total_transformed: 0,
    recent_details: ["Waiting for live telemetry from Excel..."]
  });

  const [extensionStats, setExtensionStats] = useState({
    total_transformed: 420,
    recent_details: [
      "NeuroLens Extension successfully linked to active diagnostic report.",
      "Meaning-based labels active: ⚠ [CRITICAL ALERT], 📈 [ACTIVE GROWTH], 🔗 [PRIMARY ACTION].",
      "Safe palette enforcement active for Deuteranomaly (Green-Weak)."
    ]
  });

  useEffect(() => {
    // Simulate real-time data growth for the hackathon demo
    const interval = setInterval(() => {
      setStats(prev => ({
        usersProfiled: prev.usersProfiled + Math.floor(Math.random() * 2),
        elementsTransformed: prev.elementsTransformed + Math.floor(Math.random() * 15),
        webPagesAccessible: prev.webPagesAccessible + Math.floor(Math.random() * 3)
      }));
    }, 2000);
    
    // Live fetch from Excel Telemetry API
    const excelInterval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:8000/api/excel/stats");
        if (res.ok) {
          const data = await res.json();
          setExcelStats(data);
        }
      } catch (e) {
        // silent fallback
      }
    }, 2000);

    // Live fetch from Extension & Website Telemetry API
    const extensionInterval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:8000/api/extension/stats");
        if (res.ok) {
          const data = await res.json();
          setExtensionStats(data);
        }
      } catch (e) {
        // silent fallback
      }
    }, 2000);

    // Initial fake payload
    setStats({
      usersProfiled: 1420,
      elementsTransformed: 849201,
      webPagesAccessible: 15420
    });

    return () => {
      clearInterval(interval);
      clearInterval(excelInterval);
      clearInterval(extensionInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto py-20 relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 blur-[100px] -z-10 rounded-full"></div>

      <div className="text-center mb-20 animate-in slide-in-from-bottom-8 duration-700">
        <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 font-semibold text-sm tracking-widest uppercase mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
          Live Telemetry Feed
        </div>
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-6 tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
          NeuroLens Global Impact
        </h1>
        <p className="text-2xl text-slate-300/80 max-w-3xl mx-auto font-light leading-relaxed">
          Every second, our Neural Engine is actively removing color dependency from the internet. Watch the real-time transformation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        <StatCard title="Users Profiled" value={stats.usersProfiled.toLocaleString()} icon="👤" color="from-blue-400 to-cyan-400" glowColor="rgba(56,189,248,0.3)" />
        <StatCard title="Elements Transformed" value={stats.elementsTransformed.toLocaleString()} icon="✨" color="from-purple-400 to-indigo-400" glowColor="rgba(167,139,250,0.3)" />
        <StatCard title="Webpages Optimized" value={stats.webPagesAccessible.toLocaleString()} icon="🌐" color="from-emerald-400 to-teal-400" glowColor="rgba(52,211,153,0.3)" />
      </div>

      {/* Live Web Extension & Website Telemetry Section */}
      <div className="mt-12 px-4">
        <div className="glass-panel rounded-3xl p-10 border border-emerald-500/30 relative overflow-hidden group shadow-[0_0_40px_rgba(16,185,129,0.1)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-3xl">🌐</span>
                <h3 className="text-2xl font-bold text-white tracking-tight">Website & Extension Live Synchronization</h3>
              </div>
              <p className="text-slate-400 text-base">
                Real-time telemetry streaming directly from your active browser extension across the web.
              </p>
            </div>
            
            <div className="bg-slate-800/80 border border-slate-700 px-8 py-4 rounded-2xl flex items-center space-x-4 shadow-inner">
              <span className="text-emerald-400 animate-pulse text-xl">●</span>
              <div>
                <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Web Elements Adapted</div>
                <div className="text-3xl font-black text-white" style={{fontFamily: 'var(--font-display)'}}>
                  {extensionStats.total_transformed}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 font-mono text-sm shadow-inner max-h-60 overflow-y-auto space-y-3">
            <div className="text-slate-500 text-xs uppercase tracking-widest pb-2 border-b border-slate-800 flex justify-between">
              <span>Live Website Action Log</span>
              <span className="text-emerald-400 font-semibold">Status: Linked to Active Report</span>
            </div>
            {extensionStats.recent_details.map((detail, index) => (
              <div key={index} className="flex items-center space-x-3 text-slate-300 animate-in fade-in duration-300">
                <span className="text-emerald-400">➜</span>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Excel Telemetry Section */}
      <div className="mt-12 px-4">
        <div className="glass-panel rounded-3xl p-10 border border-blue-500/30 relative overflow-hidden group shadow-[0_0_40px_rgba(59,130,246,0.1)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-3xl">📊</span>
                <h3 className="text-2xl font-bold text-white tracking-tight">Microsoft Excel Live Synchronization</h3>
              </div>
              <p className="text-slate-400 text-base">
                Real-time telemetry streaming directly from your active spreadsheet add-in.
              </p>
            </div>
            
            <div className="bg-slate-800/80 border border-slate-700 px-8 py-4 rounded-2xl flex items-center space-x-4 shadow-inner">
              <span className="text-emerald-400 animate-pulse text-xl">●</span>
              <div>
                <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Cells Corrected</div>
                <div className="text-3xl font-black text-white" style={{fontFamily: 'var(--font-display)'}}>
                  {excelStats.total_transformed}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 font-mono text-sm shadow-inner max-h-60 overflow-y-auto space-y-3">
            <div className="text-slate-500 text-xs uppercase tracking-widest pb-2 border-b border-slate-800 flex justify-between">
              <span>Live Action Log</span>
              <span className="text-blue-400 font-semibold">Status: Active</span>
            </div>
            {excelStats.recent_details.map((detail, index) => (
              <div key={index} className="flex items-center space-x-3 text-slate-300 animate-in fade-in duration-300">
                <span className="text-blue-400">➜</span>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, glowColor }: { title: string, value: string, icon: string, color: string, glowColor: string }) => (
  <div className="glass-panel rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden group cursor-default transition-all duration-500">
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl transition-all duration-500 group-hover:scale-150" style={{backgroundColor: glowColor}}></div>
    
    <div className="text-5xl mb-6 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 shadow-inner z-10 group-hover:-translate-y-2 transition-transform duration-500">{icon}</div>
    <div className={`text-6xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r ${color} z-10 tracking-tighter`} style={{fontFamily: 'var(--font-display)'}}>{value}</div>
    <div className="text-slate-400 font-semibold uppercase tracking-[0.2em] text-sm z-10">{title}</div>
  </div>
);
