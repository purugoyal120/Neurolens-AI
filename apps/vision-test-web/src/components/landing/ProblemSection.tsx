import React from 'react';
import { EyeOff, AlertTriangle, MonitorX } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  return (
    <div className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">The Hidden Struggle of 300 Million People</h2>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium">Color vision deficiency isn't just about mixing up red and green. It's a daily barrier to independence, productivity, and safety.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
            <EyeOff className="w-10 h-10 text-rose-500 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">"Which pill is the red one?"</h3>
            <p className="text-slate-500 font-medium">Simple tasks like taking the right medication, matching an outfit, or buying fresh groceries turn into stressful guessing games.</p>
          </div>
          <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
            <MonitorX className="w-10 h-10 text-indigo-500 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">"I can't read this chart."</h3>
            <p className="text-slate-500 font-medium">Professionals constantly struggle with enterprise tools, Excel sheets, and dashboards that rely entirely on color-coded data.</p>
          </div>
          <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
            <AlertTriangle className="w-10 h-10 text-amber-500 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">"How bad is my vision?"</h3>
            <p className="text-slate-500 font-medium">Doctors only see patients once a year. They lack the real-time data to understand how CVD affects their patients' daily lives.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
