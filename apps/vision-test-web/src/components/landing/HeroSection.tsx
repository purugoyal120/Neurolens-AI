import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Shield, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-slate-900 pt-[140px] pb-40 text-white">
      {/* Background decorations - Dark Mode */}
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-teal-500/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_100%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/50 backdrop-blur-md border border-slate-700 text-emerald-400 font-bold text-sm mb-10 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          The future of digital accessibility is here
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-extrabold text-white tracking-tight mb-8 leading-tight max-w-5xl mx-auto"
        >
          Beyond Colors. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Beyond Barriers.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto font-medium leading-relaxed"
        >
          Neurolens is an intelligent browser engine that instantly translates confusing colors on websites and dashboards into clear, high-contrast visuals tailored to your exact eyes.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
        >
          <Link to="/onboarding" className="px-10 py-5 bg-emerald-500 text-slate-900 rounded-full text-xl font-extrabold hover:bg-emerald-400 hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3">
            Take Diagnostic Test <ArrowRight className="w-6 h-6" />
          </Link>
          <a href="#demo" className="px-10 py-5 bg-slate-800 text-white rounded-full text-xl font-bold hover:bg-slate-700 transition-all border border-slate-700 flex items-center gap-3">
            See How It Works
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-32 flex flex-col items-center justify-center gap-3 text-slate-400 text-sm font-medium"
        >
          <div className="flex -space-x-3 shadow-sm">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <p className="text-base">Join 10,000+ professionals browsing with complete clarity.</p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
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
              className="bg-slate-800/50 backdrop-blur-md p-10 rounded-[32px] border border-slate-700 hover:border-emerald-500/30 transition-colors"
            >
              <div className={`w-16 h-16 bg-${feat.color}-500/10 rounded-2xl flex items-center justify-center mb-8 border border-${feat.color}-500/20`}>
                <feat.icon className={`w-8 h-8 text-${feat.color}-400`} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feat.title}</h3>
              <p className="text-slate-400 font-medium leading-relaxed text-lg">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
