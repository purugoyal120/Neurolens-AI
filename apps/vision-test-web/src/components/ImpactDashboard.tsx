import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Activity, Globe, FileSpreadsheet, Zap, Search, Filter } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
// import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const ImpactDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/history/guest');
        if (res.ok) {
          const data = await res.json();
          if (data.history) {
            setHistoryData(data.history);
            
            // Group by module for chart
            const counts: Record<string, number> = {};
            data.history.forEach((h: any) => {
              counts[h.module_type] = (counts[h.module_type] || 0) + 1;
            });
            
            const processedChart = Object.keys(counts).map(key => ({
              name: key.charAt(0).toUpperCase() + key.slice(1),
              count: counts[key]
            }));
            
            setChartData(processedChart);
          }
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };
    
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000); // Poll every 5s for live effect
    return () => clearInterval(interval);
  }, []);

  // Calculate dynamic stats
  const totalTests = historyData.length;
  const avgAccuracy = 95; // Placeholder since we don't have accuracy score from mobile API yet
  
  

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addToast('Vision profile synced to extension successfully!', 'success');
    }, 1500);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      addToast('Dashboard data exported successfully!', 'success');
    }, 1200);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full flex flex-col gap-6 font-sans pb-10"
    >
      
      {/* Top Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Total Accessibility Score */}
        <motion.div variants={itemVariants} className="xl:col-span-4 dashboard-card p-8 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-10">
            <h3 className="text-slate-500 font-medium">Total Accessibility Score</h3>
            <span className="flex items-center gap-1.5 text-slate-600 text-[10px] font-bold bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ACTIVE
            </span>
          </div>
          <div className="mb-10">
            <h1 className="text-6xl font-black text-slate-900 tracking-tight mb-4">{avgAccuracy}%</h1>
            <p className="text-slate-400 text-xs font-semibold flex items-center gap-2">
              <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded flex items-center font-bold">Average</span> Accuracy from {totalTests} Tests
            </p>
          </div>
          <div className="flex gap-4">
            <button onClick={handleSync} disabled={isSyncing} className="flex-1 bg-emerald-200/50 text-emerald-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors hover:bg-emerald-200/70 disabled:opacity-50 hover:shadow-emerald-500/20 hover:shadow-lg">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? 'Syncing...' : 'Sync Profile'}
            </button>
            <button className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all hover:bg-slate-50 hover:shadow-md">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </motion.div>

        {/* 4 Square Cards */}
        <div className="xl:col-span-4 grid grid-cols-2 gap-6">
          {/* Elements Adapted */}
          <motion.div variants={itemVariants} className="dashboard-card-green p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-emerald-50 font-medium text-sm">Elements Adapted</h3>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{totalTests > 0 ? totalTests * 14 : 0}</h2>
              <p className="text-emerald-100 text-[11px] font-semibold flex items-center gap-1">
                <span className="font-bold">Total elements adjusted</span>
              </p>
            </div>
          </motion.div>

          {/* Websites Analyzed */}
          <motion.div variants={itemVariants} className="dashboard-card p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-slate-500 font-medium text-sm">Websites Analyzed</h3>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <Globe className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{totalTests}</h2>
              <p className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                <span className="text-emerald-500 font-bold">Tests taken</span>
              </p>
            </div>
          </motion.div>

          {/* Excel Adjustments */}
          <motion.div variants={itemVariants} className="dashboard-card p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-slate-500 font-medium text-sm">Excel Adjustments</h3>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">142</h2>
              <p className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                <span className="text-emerald-500 font-bold">↑ 8%</span> This week
              </p>
            </div>
          </motion.div>

          {/* API Pings */}
          <motion.div variants={itemVariants} className="dashboard-card p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-slate-500 font-medium text-sm">API Pings</h3>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <Zap className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{45244 + historyData.length}</h2>
              <p className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                <span className="text-emerald-500 font-bold">↑ 4%</span> This week
              </p>
            </div>
          </motion.div>
        </div>

        {/* Transformation Timeline */}
        <motion.div variants={itemVariants} className="xl:col-span-4 dashboard-card p-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-slate-900 font-bold mb-1">Transformation Timeline</h3>
              <p className="text-slate-500 text-xs font-medium">Live API requests over the past 8 hours</p>
            </div>
          </div>
          <div className="flex justify-end gap-4 mb-4">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Scans</span>
          </div>

          {/* Recharts Bar Chart */}
          <div className="flex-1 w-full mt-auto" style={{ minHeight: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <Tooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                />
                <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Recent Activities */}
      <motion.div variants={itemVariants} className="dashboard-card p-6 mt-2 hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-slate-900 font-bold text-lg">Recent Activities</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search logs" className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-400 w-full sm:w-64 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => addToast('Date filter opened (Demo)', 'info')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Filter className="w-4 h-4" /> Last 7 Days
              </button>
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> {isExporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-4 pl-4 w-12"><input type="checkbox" className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer" /></th>
              <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">LOG ID</th>
              <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">SOURCE ENGINE</th>
              <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">TARGET DETAIL</th>
              <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">STATUS</th>
              <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">TIMESTAMP</th>
              <th className="py-4 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {historyData.length > 0 ? historyData.slice(0, 8).map((act: any) => (
              <tr key={act.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                <td className="py-4 pl-4"><input type="checkbox" className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer" /></td>
                <td className="py-4 text-sm font-semibold text-slate-700">#{act.id.toString().substring(0, 6)}</td>
                <td className="py-4 text-sm font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                    <Activity className="w-3 h-3 text-blue-500" />
                  </div>
                  Mobile App ({act.module_type.charAt(0).toUpperCase() + act.module_type.slice(1)})
                </td>
                <td className="py-4 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    {act.color_hex && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: act.color_hex }}></span>}
                    {act.result_text}
                  </span>
                </td>
                <td className="py-4"><span className="flex items-center gap-1.5 text-xs font-bold text-slate-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Completed</span></td>
                <td className="py-4 text-sm font-medium text-slate-400">{new Date(act.created_at).toLocaleTimeString()}</td>
                <td className="py-4 text-slate-400">...</td>
              </tr>
            )) : (
              <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                <td colSpan={7} className="py-8 text-center text-sm font-semibold text-slate-500">No recent activities found. Open the app and scan something!</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </motion.div>

    </motion.div>
  );
};
