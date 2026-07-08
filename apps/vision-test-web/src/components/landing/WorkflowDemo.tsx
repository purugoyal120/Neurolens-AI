import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WorkflowDemo: React.FC = () => {
  return (
    <div id="demo" className="py-24 bg-slate-50 relative border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Seamless Integration</h2>
            <p className="text-xl text-slate-500 mb-8 font-medium">
              Neurolens AI acts as a transparent proxy between the browser and the DOM, adapting colors in milliseconds before they ever reach the screen.
            </p>
            
            <ul className="space-y-6 mb-10">
              <li className="flex items-start">
                <CheckCircle2 className="w-6 h-6 text-blue-500 mt-0.5 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Take the Diagnostic Test</h4>
                  <p className="text-slate-500">A quick 2-minute vision test calibrates our AI to your exact perception needs.</p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-6 h-6 text-blue-500 mt-0.5 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Install the Extension</h4>
                  <p className="text-slate-500">One-click install connects your vision profile to every website you visit.</p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-6 h-6 text-blue-500 mt-0.5 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Browse Unhindered</h4>
                  <p className="text-slate-500">Charts, interfaces, and text are automatically recolored for perfect contrast.</p>
                </div>
              </li>
            </ul>

            <Link to="/register" className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Try the Demo Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="relative">
            <div className="dashboard-card rounded-[24px] p-2 bg-white shadow-2xl border border-slate-200">
              <div className="bg-slate-100 rounded-t-xl px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                </div>
                <div className="bg-white rounded px-3 text-xs text-slate-400 ml-4 font-mono w-64 text-left">Neurolens AI.ai/demo</div>
              </div>
              <div className="bg-white rounded-b-xl p-6 relative overflow-hidden h-80 flex flex-col justify-center items-center">
                {/* Mock UI Demo */}
                <div className="w-full max-w-sm flex gap-4 mb-4">
                  <div className="w-1/2 h-32 bg-rose-500 rounded-xl flex items-center justify-center font-bold text-white shadow-sm">Sales</div>
                  <div className="w-1/2 h-32 bg-blue-500 rounded-xl flex items-center justify-center font-bold text-white shadow-sm">Growth</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 mix-blend-color animate-pulse pointer-events-none"></div>
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 text-blue-700 font-bold text-sm shadow-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Neurolens AI Active
                </div>
              </div>
            </div>
            {/* Decorative background for the browser mockup */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-400/10 blur-[80px] rounded-full -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
