import React, { useState } from 'react';
import { Download, RefreshCw, Activity, Globe, FileSpreadsheet, Zap, Search, Filter } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const ImpactDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { savedReports } = useAuth();

  // Calculate dynamic stats
  const totalTests = savedReports.length;
  const avgAccuracy = totalTests > 0 
    ? Math.round(savedReports.reduce((acc: number, r: any) => acc + (r.accuracy || 0), 0) / totalTests)
    : 0;
  
  const recentActivities = savedReports.slice(0, 5).map((r: any) => ({
    id: r.id.substring(0, 8),
    title: r.profile,
    desc: `Severity: ${r.severity}, Accuracy: ${r.accuracy || 100}%`,
    date: new Date(r.date).toLocaleDateString()
  }));

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
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> ACTIVE
            </span>
          </div>
          <div className="mb-10">
            <h1 className="text-6xl font-black text-slate-900 tracking-tight mb-4">{avgAccuracy}%</h1>
            <p className="text-slate-400 text-xs font-semibold flex items-center gap-2">
              <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded flex items-center font-bold">Average</span> Accuracy from {totalTests} Tests
            </p>
          </div>
          <div className="flex gap-4">
            <button onClick={handleSync} disabled={isSyncing} className="flex-1 bg-blue-200/50 text-blue-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors hover:bg-blue-200/70 disabled:opacity-50 hover:shadow-blue-500/20 hover:shadow-lg">
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
          <motion.div variants={itemVariants} className="dashboard-card-green p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-blue-50 font-medium text-sm">Elements Adapted</h3>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{totalTests > 0 ? totalTests * 14 : 0}</h2>
              <p className="text-blue-100 text-[11px] font-semibold flex items-center gap-1">
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
                <span className="text-blue-500 font-bold">Tests taken</span>
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
                <span className="text-blue-500 font-bold">↑ 8%</span> This week
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
              <h2 className="text-3xl font-bold text-slate-900 mb-2">45,244</h2>
              <p className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                <span className="text-blue-500 font-bold">↑ 4%</span> This week
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
          <div className="flex justify-end gap-4 mb-8">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-2 h-2 rounded-full bg-blue-300"></span> Extension</span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-2 h-2 rounded-full bg-slate-900"></span> Excel</span>
          </div>

          {/* Bar Chart Mockup with Staggered Bars */}
          <div className="flex-1 flex items-end justify-between px-2 gap-2 mt-auto">
            {[
              { h1: '40%', h2: '20%', label: '1AM' },
              { h1: '60%', h2: '30%', label: '2AM' },
              { h1: '25%', h2: '15%', label: '3AM' },
              { h1: '50%', h2: '40%', label: '4AM' },
              { h1: '55%', h2: '45%', label: '5AM' },
              { h1: '35%', h2: '45%', label: '6AM' },
              { h1: '45%', h2: '35%', label: '7AM' },
              { h1: '35%', h2: '50%', label: '8AM' },
            ].map((col, i) => (
              <div key={i} className="flex flex-col items-center gap-3 w-full">
                <div className="w-full bg-transparent flex flex-col justify-end items-center gap-1 h-32">
                  <motion.div 
                    initial={{ height: 0 }} animate={{ height: col.h1 }} transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="w-4 bg-blue-300 rounded-sm"
                  ></motion.div>
                  <motion.div 
                    initial={{ height: 0 }} animate={{ height: col.h2 }} transition={{ duration: 0.8, delay: i * 0.1 + 0.1 }}
                    className="w-4 bg-slate-900 rounded-sm"
                  ></motion.div>
                </div>
                <span className="text-[9px] font-bold text-slate-400">{col.label}</span>
              </div>
            ))}
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
              <input type="text" placeholder="Search logs" className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 w-full sm:w-64 focus:ring-2 focus:ring-blue-500/20 transition-all" />
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
              <th className="py-4 pl-4 w-12"><input type="checkbox" className="rounded border-slate-300 text-blue-500 focus:ring-blue-500 cursor-pointer" /></th>
              <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">LOG ID</th>
              <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">SOURCE ENGINE</th>
              <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">TARGET DETAIL</th>
              <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">STATUS</th>
              <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">TIMESTAMP</th>
              <th className="py-4 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {recentActivities.length > 0 ? recentActivities.map((act: any) => (
              <tr key={act.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                <td className="py-4 pl-4"><input type="checkbox" className="rounded border-slate-300 text-blue-500 focus:ring-blue-500 cursor-pointer" /></td>
                <td className="py-4 text-sm font-semibold text-slate-700">{act.id}</td>
                <td className="py-4 text-sm font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center"><Activity className="w-3 h-3 text-blue-500" /></div>
                  Diagnostic Test
                </td>
                <td className="py-4 text-sm text-slate-500">{act.title} - {act.desc}</td>
                <td className="py-4"><span className="flex items-center gap-1.5 text-xs font-bold text-slate-700"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Completed</span></td>
                <td className="py-4 text-sm font-medium text-slate-400">{act.date}</td>
                <td className="py-4 text-slate-400">...</td>
              </tr>
            )) : (
              <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                <td colSpan={7} className="py-8 text-center text-sm font-semibold text-slate-500">No recent activities found. Take a test!</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </motion.div>

    </motion.div>
  );
};
