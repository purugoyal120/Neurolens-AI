import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Stethoscope, ArrowRight } from 'lucide-react';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-3 group z-20">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
          <span className="text-white font-extrabold text-xl">N</span>
        </div>
        <span className="text-xl font-extrabold text-slate-900 tracking-tight">Neurolens AI</span>
      </Link>

      <div className="max-w-4xl w-full z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            How would you like to use <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Neurolens</span>?
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium">
            Select your role to get a personalized experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Patient Card */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/onboarding')}
            className="group relative bg-white p-6 md:p-10 rounded-[32px] border-2 border-slate-100 hover:border-emerald-400 shadow-xl shadow-slate-200/50 text-left transition-all overflow-hidden flex flex-col h-full"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
              <ArrowRight className="w-6 h-6 text-emerald-500" />
            </div>
            
            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 md:mb-8 border border-emerald-100 group-hover:bg-emerald-500 transition-colors duration-300">
              <User className="w-8 h-8 md:w-10 md:h-10 text-emerald-500 group-hover:text-white transition-colors duration-300" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">I am a Patient</h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8 flex-grow">
              Take our AI-powered 2-minute vision test to discover your unique color profile and fix hard-to-read websites instantly.
            </p>
            
            <div className="text-emerald-600 font-bold flex items-center gap-2">
              Start Free Vision Test <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>

          {/* Doctor Card */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/register?role=doctor')}
            className="group relative bg-white p-6 md:p-10 rounded-[32px] border-2 border-slate-100 hover:border-blue-400 shadow-xl shadow-slate-200/50 text-left transition-all overflow-hidden flex flex-col h-full"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
              <ArrowRight className="w-6 h-6 text-blue-500" />
            </div>
            
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 md:mb-8 border border-blue-100 group-hover:bg-blue-500 transition-colors duration-300">
              <Stethoscope className="w-8 h-8 md:w-10 md:h-10 text-blue-500 group-hover:text-white transition-colors duration-300" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">I am a Doctor</h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8 flex-grow">
              Access the clinical dashboard to manage patient reports, track vision therapy progress, and analyze mass data.
            </p>
            
            <div className="text-blue-600 font-bold flex items-center gap-2">
              Create Clinic Account <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
