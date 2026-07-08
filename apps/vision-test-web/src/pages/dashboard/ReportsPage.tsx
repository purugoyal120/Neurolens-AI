import React, { useState } from 'react';
import { TopNav } from '../../components/layout/TopNav';
import { Download, TrendingUp, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export const ReportsPage: React.FC = () => {
  const { addToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      addToast('CSV Export downloaded successfully!', 'success');
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
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden pb-8">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-400/5 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse"></div>

      <TopNav />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-6 max-w-6xl mx-auto w-full"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">Reports & Analytics</h1>
            <p className="text-slate-500 text-sm font-medium">Detailed breakdown of accessibility adaptations across your organization.</p>
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="premium-btn px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Metric 1 */}
          <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-emerald-500/5">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -z-10"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-500 font-bold text-xs tracking-wide uppercase">Most Active Profile</h3>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-inner">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1.5">Deuteranopia</h2>
            <p className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full text-[11px] inline-block shadow-sm">64% of total adaptations</p>
          </motion.div>

          {/* Metric 2 */}
          <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-rose-500/5">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/10 rounded-full blur-xl -z-10"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-500 font-bold text-xs tracking-wide uppercase">Critical Contrasts Fixed</h3>
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shadow-inner">
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1.5">124,592</h2>
            <p className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 14% vs last month
            </p>
          </motion.div>

          {/* Metric 3 */}
          <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-blue-500/5">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -z-10"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-500 font-bold text-xs tracking-wide uppercase">Enterprise WCAG Score</h3>
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1.5">AA Compliant</h2>
            <p className="text-blue-600 font-bold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full text-[11px] inline-block shadow-sm">Across 12 internal tools</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Profile Distribution */}
          <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl shadow-lg shadow-slate-200/50">
            <h3 className="text-slate-900 font-bold mb-6 text-base">Vision Profiles Distribution</h3>
            <div className="space-y-5">
              {[
                { name: 'Deuteranopia (Green-Blind)', percent: 64, color: 'emerald' },
                { name: 'Protanopia (Red-Blind)', percent: 22, color: 'rose' },
                { name: 'Tritanopia (Blue-Blind)', percent: 10, color: 'blue' },
                { name: 'Achromatopsia (Total)', percent: 4, color: 'slate' }
              ].map((profile, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-700">{profile.name}</span>
                    <span className={`text-${profile.color}-600 bg-${profile.color}-50 px-1.5 py-0.5 rounded`}>{profile.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 shadow-inner overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${profile.percent}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                      className={`bg-${profile.color}-500 h-2 rounded-full`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Sites Table */}
          <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl shadow-lg shadow-slate-200/50">
            <h3 className="text-slate-900 font-bold mb-5 text-base">Most Adapted Domains</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 pl-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Domain</th>
                    <th className="pb-3 pr-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Elements Fixed</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold text-slate-700">
                  <tr className="border-b border-slate-50 hover:bg-white/50 transition-colors">
                    <td className="py-3 pl-3 flex items-center gap-3 text-xs">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-sm">J</div>
                      jira.atlassian.com
                    </td>
                    <td className="py-3 pr-3 text-right text-xs">45,201</td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-white/50 transition-colors">
                    <td className="py-3 pl-3 flex items-center gap-3 text-xs">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-sm">E</div>
                      excel.office.com
                    </td>
                    <td className="py-3 pr-3 text-right text-emerald-600 text-xs font-bold">32,940</td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-white/50 transition-colors">
                    <td className="py-3 pl-3 flex items-center gap-3 text-xs">
                      <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">G</div>
                      github.com
                    </td>
                    <td className="py-3 pr-3 text-right text-xs">18,520</td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-3 pl-3 flex items-center gap-3 text-xs">
                      <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold shadow-sm">S</div>
                      salesforce.com
                    </td>
                    <td className="py-3 pr-3 text-right text-xs">12,105</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
