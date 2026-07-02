import React from 'react';
import { EyeOff, AlertTriangle, MonitorX } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  return (
    <div className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">The Accessibility Gap</h2>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium">Over 300 million people globally experience some form of color vision deficiency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
            <EyeOff className="w-10 h-10 text-rose-500 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">Loss of Context</h3>
            <p className="text-slate-500 font-medium">Charts, graphs, and warning labels relying solely on color become impossible to interpret.</p>
          </div>
          <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
            <AlertTriangle className="w-10 h-10 text-amber-500 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">Reduced Productivity</h3>
            <p className="text-slate-500 font-medium">Employees struggle with enterprise tools like Excel and dashboards that lack accessible palettes.</p>
          </div>
          <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
            <MonitorX className="w-10 h-10 text-indigo-500 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">Poor UI Compliance</h3>
            <p className="text-slate-500 font-medium">Companies face legal risks and lose customers due to non-WCAG compliant digital experiences.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
