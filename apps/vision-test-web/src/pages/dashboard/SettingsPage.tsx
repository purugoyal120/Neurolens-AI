import React, { useState } from 'react';
import { TopNav } from '../../components/layout/TopNav';
import { Zap, Save, RefreshCw, ShieldCheck, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNotification } from '../../context/NotificationContext';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export const SettingsPage: React.FC = () => {
  const { addToast } = useToast();
  const { addNotification } = useNotification();
  const { user, role, activeReport } = useAuth();
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
      addNotification({
        title: 'Settings Updated',
        message: 'Your profile and security preferences have been successfully updated.',
        type: 'info'
      });
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">My Profile</h1>
        <p className="text-slate-500 text-sm font-medium">View your details and manage your AI engine parameters & security.</p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-3xl mx-auto w-full space-y-6"
      >
        {/* Settings Column */}
        <div className="space-y-6">
          
          {/* Premium Profile Card */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl shadow-blue-900/5 transition-all hover:shadow-2xl hover:shadow-blue-900/10">
            {/* Background Decorative Gradients */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="px-8 pt-20 pb-8 relative z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-6">
                {/* Avatar with Ring */}
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-white p-1.5 shadow-lg">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center text-blue-600 border border-blue-100/50">
                      <span className="text-4xl font-extrabold tracking-tighter">{user?.name?.charAt(0) || 'U'}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-sm" title="Active"></div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user?.name || 'Guest User'}</h2>
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 text-sm mt-1.5 font-medium">
                        <Mail className="w-4 h-4 text-blue-500" /> {user?.email || 'user@neurolens.ai'}
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200/60 px-4 py-2 rounded-2xl shadow-sm">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700 text-xs font-bold uppercase tracking-widest">
                        {role === 'doctor' ? 'Clinician Pro' : 'Pro Plan Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats / Diagnosis Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center items-center sm:items-start">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Active Diagnosis</div>
                  <div className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    {activeReport?.clinical_diagnosis || 'Standard Vision'}
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center items-center sm:items-start">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Severity Level</div>
                  <div className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-rose-500"></span>
                    {activeReport?.severity || 'None Detected'}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center items-center sm:items-start">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Simulation Accuracy</div>
                  <div className="font-extrabold text-blue-600 text-lg">
                    {activeReport?.accuracy ? `${activeReport.accuracy}%` : '100%'} Optimal
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <h3 className="text-lg font-bold text-slate-800 pt-4 pb-2 border-b border-slate-200">Account Settings</h3>
          
          {/* Security & Privacy Settings */}
          <motion.div variants={itemVariants} className="dashboard-card p-0 overflow-hidden border border-blue-100 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800">Enterprise Security & Privacy</h3>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-200/50 px-2.5 py-1 rounded-full">
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
                <button disabled className="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent bg-blue-500">
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
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${toggles.hipaaMode ? 'bg-blue-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-200'}`}
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
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${toggles.localProcessing ? 'bg-blue-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-200'}`}
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
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${toggles.autoAdapt ? 'bg-blue-500' : 'bg-slate-200'}`}
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
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${toggles.daltonizeImages ? 'bg-blue-500' : 'bg-slate-200'}`}
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
              className="bg-slate-900 hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 text-sm transition-all duration-300 disabled:opacity-50 shadow-lg shadow-slate-900/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
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
