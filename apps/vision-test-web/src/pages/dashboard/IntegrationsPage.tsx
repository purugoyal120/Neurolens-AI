import React from 'react';
import { TopNav } from '../../components/layout/TopNav';
import { Puzzle, FileSpreadsheet, Key, Copy, CheckCircle2, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ExtensionSyncCard } from '../../components/dashboard/ExtensionSyncCard';

export const IntegrationsPage: React.FC = () => {
  const { addToast } = useToast();

  const handleCopy = () => {
    addToast('API Key copied to clipboard', 'success');
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
    <div className="flex flex-col h-full relative overflow-hidden pb-6">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-400/10 blur-[80px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
      
      <TopNav />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-6 max-w-6xl mx-auto w-full"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">Integrations Ecosystem</h1>
          <p className="text-slate-500 text-sm font-medium">Connect your Neurolens AI vision profile to browsers, productivity tools, and custom apps.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Browser Extension (Live Sync Component) */}
          <motion.div variants={itemVariants}>
            <ExtensionSyncCard />
          </motion.div>

          {/* Excel Add-in */}
          <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-teal-500/5">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#217346]/10 rounded-full blur-xl -z-10 pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                  <FileSpreadsheet className="w-6 h-6 text-[#217346]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-0.5">Microsoft Excel</h2>
                  <p className="text-[11px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 inline-block">Enterprise Add-in</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
                NOT INSTALLED
              </span>
            </div>
            
            <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
              Instantly re-color financial charts, conditional formatting, and complex data visualizations inside Excel to ensure full accessibility.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => addToast('Excel Add-in successfully authenticated! Syncing data...', 'success')} 
                className="w-full bg-[#217346] hover:bg-[#185c37] text-white rounded-lg font-bold text-sm py-2.5 transition-all shadow-md shadow-[#217346]/20 hover:-translate-y-0.5"
              >
                Sync with Excel Add-in
              </button>
              <div className="bg-white/50 border border-slate-200 rounded-lg p-2.5 text-[11px] font-mono text-slate-600 shadow-inner">
                Endpoint: <span className="text-[#217346] font-bold">GET /api/v1/profile/sync</span><br/>
                Header: <span className="font-bold">x-Neurolens AI-key: nl_prod_8f92x...</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Developer API */}
        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl shadow-slate-900/5">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-900 rounded-lg shadow-md">
                <Key className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Developer API Keys</h2>
            </div>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              Embed Neurolens AI directly into your own React or Next.js applications using our SDK. Your API key provides access to the real-time color transformation engine.
            </p>
          </div>
          
          <div className="w-full lg:w-auto flex-shrink-0 bg-white/50 p-4 rounded-xl border border-slate-200 shadow-inner">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Production Key</label>
            <div className="flex items-center gap-2">
              <code className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-800 font-mono w-full lg:w-64 shadow-sm">
                nl_prod_8f92x...
              </code>
              <button 
                onClick={handleCopy} 
                className="p-2.5 bg-slate-900 rounded-lg hover:bg-emerald-500 text-white transition-colors shadow-md hover:shadow-emerald-500/30"
                title="Copy API Key"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
