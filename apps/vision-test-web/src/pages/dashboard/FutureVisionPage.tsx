import React from 'react';
import { TopNav } from '../../components/layout/TopNav';
import { motion } from 'framer-motion';
import { Smartphone, Camera, Mic, MapPin, Eye, Car, Coins, Pill } from 'lucide-react';

const features = [
  {
    icon: <Camera className="w-6 h-6 text-emerald-500" />,
    title: "AI Scene Understanding",
    desc: "Real-time environment description using advanced vision models.",
    color: "emerald"
  },
  {
    icon: <Mic className="w-6 h-6 text-blue-500" />,
    title: "Voice Navigation",
    desc: "Conversational AI assistant guiding you safely through streets.",
    color: "blue"
  },
  {
    icon: <Car className="w-6 h-6 text-rose-500" />,
    title: "Traffic & Obstacles",
    desc: "Immediate alerts for traffic signals and physical hazards.",
    color: "rose"
  },
  {
    icon: <Pill className="w-6 h-6 text-purple-500" />,
    title: "Medicine Reader",
    desc: "OCR scanner to read out prescriptions and medicine details.",
    color: "purple"
  },
  {
    icon: <Coins className="w-6 h-6 text-amber-500" />,
    title: "Currency Detection",
    desc: "Instantly identifies and speaks out currency denominations.",
    color: "amber"
  },
  {
    icon: <MapPin className="w-6 h-6 text-sky-500" />,
    title: "Public Transit Assist",
    desc: "Reads bus numbers and train details dynamically.",
    color: "sky"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const FutureVisionPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-full pb-12">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-400/10 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <TopNav />

      <div className="px-6 max-w-6xl mx-auto w-full flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-8 mb-16 relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold mb-6 shadow-sm border border-emerald-200">
            <Smartphone className="w-4 h-4" />
            Phase 2 Roadmap: The "Super App"
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Neurolens <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Mobile & AR</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
            While our digital platform transforms the web, our upcoming Mobile and AR Glasses ecosystem will transform the physical world for 2.2 Billion people.
          </p>
        </motion.div>

        {/* Core Capabilities Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {features.map((feature, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 shadow-sm"
            >
              {/* Card Glow Effect */}
              <div className={`absolute -right-12 -top-12 w-32 h-32 bg-${feature.color}-400/10 rounded-full blur-2xl group-hover:bg-${feature.color}-400/20 transition-colors duration-500`}></div>
              
              <div className={`w-12 h-12 rounded-2xl bg-${feature.color}-50 border border-${feature.color}-100 flex items-center justify-center shadow-inner mb-5 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pitch Strategy Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl shadow-slate-200/50"
        >
          {/* Internal Grid pattern for aesthetic */}
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #e2e8f0 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold mb-4 uppercase tracking-widest text-xs">
                <Eye className="w-4 h-4" /> Market Potential
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 leading-tight">
                From Digital to <br/> Real-World Independence
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                Solving web accessibility is just Phase 1. By integrating real-time Computer Vision (YOLO/GPT-4V) with Smartphone Cameras and AR Wearables, Neurolens AI will become a daily companion for the visually impaired, low-vision, and elderly communities globally.
              </p>
              <button className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-slate-900/20">
                View Investment Pitch Deck
              </button>
            </div>
            
            {/* Abstract Mobile Representation */}
            <div className="flex justify-center md:justify-end relative">
              <div className="w-64 h-96 border-[8px] border-slate-800 bg-slate-950 rounded-[40px] p-4 relative shadow-2xl overflow-hidden flex flex-col">
                <div className="w-24 h-6 bg-slate-800 rounded-full absolute top-2 left-1/2 -translate-x-1/2 z-20"></div>
                
                {/* Simulated AR View */}
                <div className="flex-1 bg-slate-900 rounded-2xl relative overflow-hidden border border-slate-800">
                   <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center"></div>
                   
                   {/* Bounding Box Simulation */}
                   <div className="absolute top-1/4 left-1/4 w-1/2 h-1/3 border-2 border-emerald-500 bg-emerald-500/10 rounded-lg">
                      <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 absolute -top-5 left-[-2px] rounded-t">Traffic Signal: Green</div>
                   </div>

                   {/* Voice Assistant Wave */}
                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: [8, 20, 8] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                          className="w-1 bg-emerald-400 rounded-full"
                        />
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
