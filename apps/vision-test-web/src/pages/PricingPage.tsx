import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Zap, Building2, ChevronRight, Eye } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden relative">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#10b981]/10 blur-[120px] rounded-full mix-blend-multiply"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-[#6b4fa0]/10 blur-[150px] rounded-full mix-blend-multiply"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">Neurolens AI</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
            <Link to="/onboarding" className="px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-colors shadow-md hover:shadow-xl hover:-translate-y-0.5 duration-300">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 mb-6 text-sm font-bold uppercase tracking-widest shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>Simple, Transparent Pricing</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Invest in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">Clear Vision</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Whether you're exploring your own color perception or managing a clinical practice, we have a plan tailored for your needs.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-16 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-150">
          <div className="bg-white p-1.5 rounded-full border border-slate-200 shadow-sm flex items-center">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${!isAnnual ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${isAnnual ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Annually <span className={isAnnual ? 'bg-white/20 px-2 py-0.5 rounded-full text-xs' : 'bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs'}>Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* PATIENT TIER (FREE) */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 border border-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative group flex flex-col">
            <div className="mb-8">
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Patient Basic</h3>
              <p className="text-sm text-slate-500 font-medium h-10">Discover your unique color vision profile.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-slate-900">$0</span>
                <span className="text-slate-500 font-medium">/forever</span>
              </div>
            </div>
            
            <Link to="/register?role=patient" className="w-full py-4 px-6 rounded-xl bg-slate-100 text-slate-700 font-bold text-center mb-8 hover:bg-slate-200 transition-colors">
              Get Started
            </Link>

            <div className="space-y-4 flex-1">
              <p className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">What's included</p>
              {[
                '1 Free Clinical-Grade Diagnostic Test',
                'Personalized AI Vision Profile',
                'Basic Color Adaptation Simulator',
                'Export Report as PDF',
                'Community Support'
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DOCTOR / CLINIC TIER (PRO) */}
          <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-700 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-2 relative group flex flex-col transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-current" />
              Most Popular
            </div>
            
            <div className="mb-8 mt-2">
              <h3 className="text-xl font-extrabold text-white mb-2">Clinic Pro</h3>
              <p className="text-sm text-slate-400 font-medium h-10">Advanced patient management for clinical practices.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white">${isAnnual ? '39' : '49'}</span>
                <span className="text-slate-400 font-medium">/mo per doctor</span>
              </div>
            </div>
            
            <Link to="/register?role=doctor" className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold text-center mb-8 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all">
              Start 14-Day Free Trial
            </Link>

            <div className="space-y-4 flex-1">
              <p className="text-sm font-bold text-white uppercase tracking-wider mb-4">Everything in Basic, plus:</p>
              {[
                'Unlimited Patient Diagnostics',
                'Dedicated Clinical Dashboard',
                'White-label PDF Reports (Your Logo)',
                'Advanced AI Treatment Explanations',
                'Patient History & Progress Tracking',
                'Priority 24/7 Support'
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-blue-400" />
                  </div>
                  <span className="text-sm text-slate-300 font-medium leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ENTERPRISE TIER */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 border border-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative group flex flex-col">
            <div className="mb-8">
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Hospital Enterprise</h3>
              <p className="text-sm text-slate-500 font-medium h-10">Custom deployment for large healthcare networks.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-slate-900">Custom</span>
              </div>
            </div>
            
            <button className="w-full py-4 px-6 rounded-xl bg-white border-2 border-slate-200 text-slate-900 font-bold text-center mb-8 hover:border-slate-900 transition-colors flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4" /> Contact Sales
            </button>

            <div className="space-y-4 flex-1">
              <p className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Everything in Pro, plus:</p>
              {[
                'API Access for EHR Integration',
                'Custom Machine Learning Models',
                'SSO (SAML / OAuth2)',
                'Dedicated Technical Account Manager',
                'On-Premise Deployment Options',
                'Custom HIPAA BAA'
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* FAQ Teaser or Trust Banner */}
        <div className="mt-32 max-w-4xl mx-auto bg-gradient-to-r from-blue-900 to-slate-900 rounded-[2rem] p-10 md:p-14 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full"></div>
          <div className="relative z-10">
            <Zap className="w-12 h-12 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to transform visual accessibility?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of clinics and thousands of patients already using Neurolens AI to see the digital world clearly.
            </p>
            <Link to="/onboarding" className="inline-flex items-center justify-center px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/50 hover:scale-105 group">
              Start Your Free Test
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-200/50 py-10 text-center relative z-10">
        <p className="text-slate-500 font-medium text-sm">© 2026 Neurolens AI Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};
