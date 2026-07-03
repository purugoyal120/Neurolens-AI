import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { WorkflowDemo } from '../components/landing/WorkflowDemo';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Simple Top Nav for Landing */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-extrabold text-2xl">N</span>
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Neurolens AI</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#demo" className="text-base font-semibold text-slate-600 hover:text-emerald-600 transition-colors">How it Works</a>
            <a href="#features" className="text-base font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Features</a>
            <Link to="/pricing" className="text-base font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-base font-bold text-slate-700 hover:text-slate-900 transition-colors">Sign In</Link>
            <Link to="/onboarding" className="px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-colors shadow-md">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <HeroSection />
        <ProblemSection />
        <WorkflowDemo />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm font-medium">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-white font-extrabold text-lg">Neurolens AI</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-6">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Terms</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
