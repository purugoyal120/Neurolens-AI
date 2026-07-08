import React from 'react';
import { Eye, Palette, Zap, Brain, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Eye className="w-6 h-6 text-emerald-500" />,
    title: 'Precise Vision Diagnosis',
    description: 'Our AI engine conducts a highly accurate, interactive test to detect the exact type and severity of your color vision deficiency.'
  },
  {
    icon: <Brain className="w-6 h-6 text-emerald-500" />,
    title: 'Personalized Matrix Generation',
    description: 'We don\'t use generic filters. The AI generates a custom mathematical Daltonization matrix perfectly tuned to your eyes.'
  },
  {
    icon: <Zap className="w-6 h-6 text-emerald-500" />,
    title: 'Instant Browser Sync',
    description: 'One click instantly beams your personalized vision profile directly to our Chrome extension for real-time web adaptation.'
  },
  {
    icon: <Palette className="w-6 h-6 text-emerald-500" />,
    title: 'Smart Color Collision Fix',
    description: 'Our semantic engine uses patterns to disambiguate shifted colors, ensuring you never confuse native blue with shifted red.'
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
    title: 'Doctor & Caregiver Portal',
    description: 'Optometrists can track patient reports, tweak clinical prescriptions, and generate official PDF diagnoses directly from the dashboard.'
  },
  {
    icon: <Sparkles className="w-6 h-6 text-emerald-500" />,
    title: 'Zero Latency Performance',
    description: 'The extension processes DOM nodes locally at 60fps using CSS SVG filters, meaning websites load fast without any lag.'
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Cutting-Edge Technology
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Everything you need to <span className="text-emerald-600">see the web clearly.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Neurolens combines clinical ophthalmology with advanced web technologies to provide an end-to-end accessible experience.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/40 border border-slate-100 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
