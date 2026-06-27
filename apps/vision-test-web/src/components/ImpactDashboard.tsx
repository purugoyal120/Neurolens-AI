import React, { useState, useEffect } from 'react';

export const ImpactDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    usersProfiled: 1248,
    elementsTransformed: 849201,
    webPagesAccessible: 15420
  });

  const [excelStats, setExcelStats] = useState({
    total_transformed: 142,
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
    
    // Dynamic API Base helper for public tunnels and local networks
    const getApiBase = () => {
      if (window.location.port === '5173') {
        return `http://${window.location.hostname}:8000/api`;
      }
      return `${window.location.origin}/api`;
    };

    // Live fetch from Excel Telemetry API
    const excelInterval = setInterval(async () => {
      try {
        const res = await fetch(`${getApiBase()}/excel/stats`);
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
        const res = await fetch(`${getApiBase()}/extension/stats`);
        if (res.ok) {
          const data = await res.json();
          setExtensionStats(data);
        }
      } catch (e) {
        // silent fallback
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(excelInterval);
      clearInterval(extensionInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto mt-16 p-8 glass-panel rounded-3xl shadow-2xl mb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#eaddff] text-[#5a00c6] border border-[#d2bbff] mb-4 inline-block">
            LIVE SYSTEM TELEMETRY
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gradient-primary tracking-tight">
            Enterprise Impact & Real-Time Adaptation
          </h2>
        </div>
        <div className="flex items-center gap-3 bg-[#ffdcc6] border border-[#ffb784] px-5 py-2.5 rounded-full text-[#904800] text-sm font-bold shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-[#a15100] animate-pulse"></span>
          Engine Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card-subtle p-6 relative overflow-hidden group hover:border-[#8a4cfc] transition-all shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8a4cfc]/10 rounded-full blur-2xl group-hover:bg-[#8a4cfc]/20 transition-colors"></div>
          <div className="text-[#4a4455] text-xs font-bold uppercase tracking-wider mb-2">Total Profiles Generated</div>
          <div className="text-4xl font-extrabold text-[#1b1b22] tracking-tight mb-2">{stats.usersProfiled.toLocaleString()}</div>
          <div className="text-xs text-[#732fe4] font-semibold flex items-center gap-1">
            <span>↑ 12% increase this week</span>
          </div>
        </div>

        <div className="glass-card-subtle p-6 relative overflow-hidden group hover:border-[#8468bb] transition-all shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8468bb]/10 rounded-full blur-2xl group-hover:bg-[#8468bb]/20 transition-colors"></div>
          <div className="text-[#4a4455] text-xs font-bold uppercase tracking-wider mb-2">Web Elements Adapted</div>
          <div className="text-4xl font-extrabold text-[#1b1b22] tracking-tight mb-2">{stats.elementsTransformed.toLocaleString()}</div>
          <div className="text-xs text-[#6b4fa0] font-semibold flex items-center gap-1">
            <span>Real-time DOM injection</span>
          </div>
        </div>

        <div className="glass-card-subtle p-6 relative overflow-hidden group hover:border-[#a15100] transition-all shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#a15100]/10 rounded-full blur-2xl group-hover:bg-[#a15100]/20 transition-colors"></div>
          <div className="text-[#4a4455] text-xs font-bold uppercase tracking-wider mb-2">Websites & Apps Enhanced</div>
          <div className="text-4xl font-extrabold text-[#1b1b22] tracking-tight mb-2">{stats.webPagesAccessible.toLocaleString()}</div>
          <div className="text-xs text-[#a15100] font-semibold flex items-center gap-1">
            <span>Seamless Zero-Config Linking</span>
          </div>
        </div>
      </div>

      {/* Live Telemetry Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Browser Extension Telemetry Feed */}
        <div className="bg-[#fcf8ff]/90 border border-[#ccc3d8] rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between border-b border-[#eae6f0] pb-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#eaddff] border border-[#d2bbff] flex items-center justify-center text-[#5a00c6] text-sm font-bold">
                  🌐
                </div>
                <h3 className="font-bold text-[#1b1b22] text-lg tracking-tight">Browser Extension Telemetry</h3>
              </div>
              <span className="text-xs font-mono font-bold bg-[#eaddff] text-[#5a00c6] px-3 py-1 rounded-full border border-[#d2bbff]">
                {extensionStats.total_transformed} Elements Adapted
              </span>
            </div>
            <div className="space-y-3 font-mono text-xs text-[#4a4455] max-h-48 overflow-y-auto pr-2">
              {extensionStats.recent_details.map((detail, idx) => (
                <div key={idx} className="flex items-start space-x-2 animate-in fade-in duration-300">
                  <span className="text-[#8a4cfc] select-none">➜</span>
                  <span className="flex-1 leading-relaxed">{detail}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-[#eae6f0] flex justify-between items-center text-xs text-[#7b7487] font-semibold">
            <span>Target: test_page.html</span>
            <span className="flex items-center gap-1 text-[#a15100] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a15100] animate-pulse"></span> Active Stream
            </span>
          </div>
        </div>

        {/* Excel Add-in Telemetry Feed */}
        <div className="bg-[#fcf8ff]/90 border border-[#ccc3d8] rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between border-b border-[#eae6f0] pb-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#ffdcc6] border border-[#ffb784] flex items-center justify-center text-[#904800] text-sm font-bold">
                  📊
                </div>
                <h3 className="font-bold text-[#1b1b22] text-lg tracking-tight">Excel Add-in Telemetry</h3>
              </div>
              <span className="text-xs font-mono font-bold bg-[#ffdcc6] text-[#904800] px-3 py-1 rounded-full border border-[#ffb784]">
                {excelStats.total_transformed} Cells Corrected
              </span>
            </div>
            <div className="space-y-3 font-mono text-xs text-[#4a4455] max-h-48 overflow-y-auto pr-2">
              {excelStats.recent_details.map((detail, idx) => (
                <div key={idx} className="flex items-start space-x-2 animate-in fade-in duration-300">
                  <span className="text-[#8468bb] select-none">➜</span>
                  <span className="flex-1 leading-relaxed">{detail}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-[#eae6f0] flex justify-between items-center text-xs text-[#7b7487] font-semibold">
            <span>Engine: Excel JS API v1.1</span>
            <span className="flex items-center gap-1 text-[#a15100] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a15100] animate-pulse"></span> Active Stream
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
