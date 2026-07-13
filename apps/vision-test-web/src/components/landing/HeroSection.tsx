import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-slate-50 pt-28 md:pt-[140px] pb-20 md:pb-40">
      {/* Background decorations - Light Mode */}
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-teal-400/20 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_100%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-emerald-100 text-emerald-600 font-bold text-sm mb-10 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-emerald-500" />
          Empowering visual independence, everywhere.
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-8xl font-extrabold text-slate-900 tracking-tight mb-6 md:mb-8 leading-tight max-w-5xl mx-auto"
        >
          See the World in a <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Whole New Light.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl text-slate-500 mb-10 md:mb-12 max-w-3xl mx-auto font-medium leading-relaxed"
        >
          Neurolens bridges the gap between vision and reality. Whether you're navigating the grocery store with our mobile app, or analyzing data with our web extension, experience true visual freedom.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-16 md:mb-20"
        >
          <a href="#download" onClick={(e) => { e.preventDefault(); alert("Mobile App APK downloading will be available soon!"); }} className="w-full sm:w-auto justify-center px-6 py-4 md:px-10 md:py-5 bg-slate-900 text-white rounded-full text-lg md:text-xl font-extrabold hover:bg-slate-800 hover:scale-105 transition-all shadow-xl shadow-slate-900/20 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6"><path d="M5 12h14"/><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
            Download Mobile App
          </a>
          <Link to="/select-role" className="w-full sm:w-auto justify-center px-6 py-4 md:px-10 md:py-5 bg-emerald-500 text-white rounded-full text-lg md:text-xl font-extrabold hover:bg-emerald-600 hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3">
            Get Web Extension <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-20 md:mb-32 flex flex-col items-center justify-center gap-3 text-slate-500 text-sm font-medium"
        >
          <div className="flex -space-x-3 shadow-sm">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <p className="text-base text-slate-500">Join 10,000+ professionals browsing with complete clarity.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
          {[
            { icon: Sparkles, title: "Your Digital Guide Dog", desc: "Unsure if that apple is ripe? Just point your phone. Our AI instantly recognizes everyday objects and reads their details aloud.", color: "emerald" },
            { icon: Eye, title: "Browse with Confidence", desc: "No more guessing games on websites. We automatically shift confusing colours into high-contrast shades tailored to your eyes.", color: "teal" },
            { icon: Shield, title: "Connected Care", desc: "Your daily visual struggles shouldn't be a secret from your doctor. We securely sync your data directly to their clinic dashboard.", color: "emerald" }
          ].map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (idx * 0.1) }}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-md p-6 md:p-10 rounded-[32px] border border-slate-100 hover:border-emerald-500/30 transition-colors shadow-xl shadow-slate-200/50"
            >
              <div className={`w-12 h-12 md:w-16 md:h-16 bg-${feat.color}-50 rounded-2xl flex items-center justify-center mb-6 md:mb-8 border border-${feat.color}-100`}>
                <feat.icon className={`w-6 h-6 md:w-8 md:h-8 text-${feat.color}-500`} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">{feat.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed text-base md:text-lg">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
