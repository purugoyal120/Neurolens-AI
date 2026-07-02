import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-[#f8fafc] pt-[120px] pb-32">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-emerald-400/20 blur-[120px] rounded-full pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-teal-400/20 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-emerald-100 text-emerald-600 font-bold text-sm mb-8 shadow-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Built for true digital accessibility
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight max-w-5xl mx-auto"
        >
          Never guess between <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-600">red</span> and <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-600">green</span> again.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-500 mb-10 max-w-3xl mx-auto font-medium leading-relaxed"
        >
          Neurolens is a smart browser extension that instantly translates confusing colors on websites, financial charts, and dashboards into clear, high-contrast visuals tailored to your exact eyes.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20"
        >
          <Link to="/onboarding" className="premium-btn px-10 py-5 text-lg flex items-center gap-2">
            Take Diagnostic Test <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#demo" className="premium-btn-secondary px-10 py-5 font-bold text-lg flex items-center gap-2">
            See How It Works
          </a>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
          {[
            { icon: Eye, title: "Smart Contrast", desc: "Automatically detects tricky colors on charts or dashboards and shifts them to high-contrast shades.", color: "emerald" },
            { icon: Zap, title: "Instant Meaning", desc: "We don't just change colors—we add explicit text tags like [Warning] so you never have to guess.", color: "teal" },
            { icon: Shield, title: "Private & Fast", desc: "Runs directly in your browser without tracking your personal data or slowing down your computer.", color: "emerald" }
          ].map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (idx * 0.1) }}
              whileHover={{ y: -5 }}
              className="glass-panel p-8 rounded-[32px] shadow-xl shadow-slate-200/50"
            >
              <div className={`w-14 h-14 bg-${feat.color}-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
                <feat.icon className={`w-7 h-7 text-${feat.color}-600`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
