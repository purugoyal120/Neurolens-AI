import React, { useState, useRef, useEffect } from 'react';
import { TopNav } from '../../components/layout/TopNav';
import { Settings2, Upload, Maximize2, SplitSquareHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

export const SimulatorPage: React.FC = () => {
  const { addToast } = useToast();
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [activeProfile, setActiveProfile] = useState('deuteranopia');
  const [activeImage, setActiveImage] = useState('chart'); // 'chart' or 'website'

  const images = {
    chart: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
    website: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200"
  };

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let clientX;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as MouseEvent).clientX;
    }
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPos(percent);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: true });
      window.addEventListener('touchend', handleDragEnd);
      window.addEventListener('touchcancel', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
    };
  }, [isDragging]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden pb-8">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-400/10 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse"></div>

      <TopNav />
      
      {/* SVG Filters for Simulation */}
      <svg className="hidden">
        <defs>
          {/* Simulate Deuteranopia (Green Blind) */}
          <filter id="sim-deuteranopia">
            <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0"/>
          </filter>
          {/* Neurolens AI Fix for Deuteranopia (Daltonization shift: green to blue) */}
          <filter id="fix-deuteranopia">
            <feColorMatrix type="matrix" values="1, 0, 0, 0, 0, 0, 1, 0.5, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0"/>
          </filter>
        </defs>
      </svg>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-6 max-w-6xl mx-auto w-full flex flex-col h-full"
      >
        <motion.div variants={itemVariants} className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1.5 tracking-tight flex items-center gap-2">
              <SplitSquareHorizontal className="w-6 h-6 text-purple-600" /> Live Vision Simulator
            </h1>
            <p className="text-slate-500 text-sm font-medium">Experience exactly how a user sees your site, and how Neurolens AI fixes it in real-time.</p>
          </div>
          <button 
            onClick={() => addToast('Upload feature coming soon!', 'info')}
            className="premium-btn px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Upload Image
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          
          {/* Controls Sidebar */}
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
            <div className="glass-panel p-5 rounded-2xl shadow-lg shadow-slate-200/50">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5" /> Simulation Engine
              </h3>
              
              <div className="space-y-3 mb-6">
                <label className="block text-[11px] font-bold text-slate-700">Vision Profile</label>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setActiveProfile('deuteranopia')}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeProfile === 'deuteranopia' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Deuteranopia (Green-Blind)
                  </button>
                  <button 
                    onClick={() => setActiveProfile('protanopia')}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeProfile === 'protanopia' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 opacity-50 cursor-not-allowed'}`}
                    disabled
                  >
                    Protanopia (Red-Blind)
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-slate-700">Demo Image</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveImage('chart')}
                    className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all ${activeImage === 'chart' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Chart
                  </button>
                  <button 
                    onClick={() => setActiveImage('website')}
                    className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all ${activeImage === 'website' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
              <h4 className="text-sm font-bold text-purple-900 mb-2">How it works</h4>
              <p className="text-xs text-purple-700/80 leading-relaxed font-medium">
                The left side shows the image passed through a color-blindness simulation filter. Notice how reds and greens blend together. The right side applies the Neurolens AI Daltonization matrix, shifting problematic frequencies to ensure high contrast.
              </p>
            </div>
          </motion.div>

          {/* Interactive Split Viewer */}
          <motion.div variants={itemVariants} className="lg:col-span-3 h-full min-h-[500px]">
            <div className="glass-panel h-full rounded-2xl overflow-hidden shadow-xl shadow-purple-900/10 relative p-1 flex flex-col">
              
              {/* Header Badges */}
              <div className="absolute top-4 left-4 z-20 flex justify-between w-[calc(100%-32px)] pointer-events-none">
                <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Simulation (Color-Blind View)
                </span>
                <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Neurolens AI Fix Applied
                </span>
              </div>

              {/* Slider Container */}
              <div 
                ref={containerRef}
                className="relative w-full h-full rounded-xl overflow-hidden cursor-ew-resize flex-1 bg-slate-900"
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                onMouseLeave={handleDragEnd}
              >
                {/* Right Side (Fixed View) */}
                <img 
                  src={images[activeImage as keyof typeof images]} 
                  alt="Fixed View"
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  draggable={false}
                  style={{ filter: 'url(#fix-deuteranopia)' }}
                />

                {/* Left Side (Simulated View) using clip-path */}
                <img 
                  src={images[activeImage as keyof typeof images]} 
                  alt="Simulated View"
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  draggable={false}
                  style={{ 
                    clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                    filter: 'url(#sim-deuteranopia) grayscale(20%)' // Added slight grayscale to emphasize muddiness for demo
                  }}
                />

                {/* Slider Handle */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 flex items-center justify-center cursor-ew-resize hover:w-1.5 transition-all"
                  style={{ left: `calc(${sliderPos}% - 2px)` }}
                >
                  <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-200">
                    <div className="flex gap-0.5">
                      <div className="w-0.5 h-3 bg-slate-400 rounded-full"></div>
                      <div className="w-0.5 h-3 bg-slate-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Instructions */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur text-slate-600 text-[10px] font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
                <Maximize2 className="w-3 h-3" /> Drag slider to compare
              </div>

            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};
