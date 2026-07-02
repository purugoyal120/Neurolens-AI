import React, { useState } from 'react';
import { TopNav } from '../../components/layout/TopNav';
import { Eye, Zap, Save, RefreshCw, ShieldCheck, Lock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export const SettingsPage: React.FC = () => {
  const { addToast } = useToast();
  const [toggles, setToggles] = useState({
    autoAdapt: true,
    daltonizeImages: true,
    zeroLatency: true,
    hipaaMode: false,
    localProcessing: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const toggleSetting = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addToast('Preferences & Security settings saved', 'success');
    }, 800);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f6f8] pb-10">
      <TopNav />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Vision Profile Settings</h1>
        <p className="text-slate-500 text-sm font-medium">Calibrate your AI engine parameters and high-security preferences.</p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Active Profile Summary */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          <div className="dashboard-card p-6 border-t-4 border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Active Calibration</h3>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                <Eye className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Deuteranopia</h2>
                <p className="text-sm font-semibold text-emerald-600">Severity: Moderate (64%)</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-500">Red Shift</span>
                  <span className="text-slate-900">+42%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: '42%' }} transition={{ duration: 1, delay: 0.5 }}
                    className="bg-rose-400 h-1.5 rounded-full" 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-500">Green Compensation</span>
                  <span className="text-slate-900">+85%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1, delay: 0.7 }}
                    className="bg-emerald-400 h-1.5 rounded-full" 
                  />
                </div>
              </div>
            </div>

            <button className="w-full py-3 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Recalibrate Profile
            </button>
          </div>
        </motion.div>

        {/* Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Security & Privacy Settings */}
          <motion.div variants={itemVariants} className="dashboard-card p-0 overflow-hidden border border-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800">Enterprise Security & Privacy</h3>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-200/50 px-2.5 py-1 rounded-full">
                <Lock className="w-3 h-3" /> HIGH SECURITY
              </span>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Toggle 1: E2E */}
              <div className="flex items-center justify-between opacity-80 cursor-not-allowed">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                    End-to-End Encryption <Lock className="w-3 h-3 text-slate-400" />
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">Vision profiles are AES-256 encrypted. Cannot be disabled.</p>
                </div>
                <button disabled className="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent bg-emerald-500">
                  <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 translate-x-5" />
                </button>
              </div>

              {/* Toggle 2: HIPAA */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">HIPAA Compliance Mode</h4>
                  <p className="text-xs text-slate-500 font-medium">Anonymize all diagnostic telemetry and strip PII from logs.</p>
                </div>
                <button 
                  onClick={() => toggleSetting('hipaaMode')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${toggles.hipaaMode ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${toggles.hipaaMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Toggle 3: Local Processing */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Local Processing Only</h4>
                  <p className="text-xs text-slate-500 font-medium">Prevent DOM mutation logs and images from leaving the browser.</p>
                </div>
                <button 
                  onClick={() => toggleSetting('localProcessing')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${toggles.localProcessing ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${toggles.localProcessing ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Engine Settings */}
          <motion.div variants={itemVariants} className="dashboard-card p-0 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-800">Transformation Engine</h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Auto-Adapt Websites</h4>
                  <p className="text-xs text-slate-500 font-medium">Automatically mutate DOM colors on page load without prompt.</p>
                </div>
                <button 
                  onClick={() => toggleSetting('autoAdapt')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${toggles.autoAdapt ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${toggles.autoAdapt ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">AI Image Daltonization</h4>
                  <p className="text-xs text-slate-500 font-medium">Use WebGL shaders to fix color clashes inside images and videos.</p>
                </div>
                <button 
                  onClick={() => toggleSetting('daltonizeImages')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${toggles.daltonizeImages ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${toggles.daltonizeImages ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-end pt-2">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-slate-900 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 text-sm transition-all duration-300 disabled:opacity-50 shadow-lg shadow-slate-900/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
