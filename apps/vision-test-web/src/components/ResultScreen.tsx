import React, { useState } from 'react';
import { useVisionTest } from '../context/VisionTestContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity, Brain, Fingerprint, Eye, ArrowRight, LayoutDashboard, FileText, RotateCcw } from 'lucide-react';

export const ResultScreen: React.FC = () => {
  const { result, resetTest } = useVisionTest();
  const navigate = useNavigate();
  const [activePlaygroundTab, setActivePlaygroundTab] = useState<'analytics' | 'trading' | 'devops'>('analytics');
  const [isScanning, setIsScanning] = useState(false);

  if (!result) return null;
  const { profile, score_summary } = result;

  const correctCount = (score_summary as any)?.correct_count ?? (score_summary as any)?.correct_answers ?? 0;
  const totalQuestions = (score_summary as any)?.total_questions ?? 10;
  const percentAccuracy = profile.percent_accuracy ?? (score_summary ? Math.round(correctCount / totalQuestions * 100) : 85);

  const deficiencyType = profile.deficiency_name || profile.clinical_diagnosis || (percentAccuracy === 100 ? 'Normal Colour Vision' : 'Personalized AI Diagnosis');
  const severity = profile.severity || (percentAccuracy === 100 ? 'None' : percentAccuracy >= 76 ? 'Mild' : percentAccuracy >= 40 ? 'Moderate' : 'Severe');
  
  const aiExplanation = profile.ai_explanation || `Based on your test responses, we noticed you experience overlapping contrast with red, green, and earthy brown shades. Our core philosophy is simple: you should never have to rely on colour alone to make critical decisions. To solve this, Neurolens AI dynamically transforms problematic reds and greens into high-contrast alternatives while immediately attaching clear meaning tags.`;

  const meaningBasedTransformations = (profile.meaning_based_transformations && profile.meaning_based_transformations.length > 0) ? profile.meaning_based_transformations : [
    {
      original_color_name: "Problematic Red (#E74C3C)",
      transformed_color_hex: "#3498DB",
      meaning_label: "Critical Alert [High-Contrast Blue + ⚠]"
    },
    {
      original_color_name: "Problematic Green (#2ECC40)",
      transformed_color_hex: "#F39C12",
      meaning_label: "Successful [Vibrant Amber + 📈]"
    }
  ];

  const getSeverityColor = (sev: string) => {
    switch(sev.toLowerCase()) {
      case 'none': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'mild': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'moderate': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'severe': return 'text-rose-700 bg-rose-100 border-rose-200';
      default: return 'text-blue-700 bg-blue-100 border-blue-200';
    }
  };

  const handleTabChange = (tab: 'analytics' | 'trading' | 'devops') => {
    setActivePlaygroundTab(tab);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  return (
    <div id="result-report-content" className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-900 font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Executive Summary Header */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 md:p-12 relative overflow-hidden">
        {/* Subtle premium background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-3 uppercase tracking-widest text-xs">
              <ShieldCheck className="w-4 h-4" /> Clinical Diagnostic Report
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">Neurolens Matrix</h1>
            <p className="text-indigo-200/80 font-medium text-lg flex items-center gap-2">
              <Fingerprint className="w-4 h-4" /> Patient ID: NL-8F92A1 • Generated Automatically
            </p>
          </div>
          
          <div className="flex flex-col gap-3 items-end">
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/20"
            >
              <LayoutDashboard className="w-5 h-5" /> Go to Dashboard
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 relative z-10">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-indigo-300 text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4" /> Primary Diagnosis
            </div>
            <div className="text-2xl font-bold text-white leading-tight">{deficiencyType}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-indigo-300 text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" /> Clinical Severity
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-white capitalize">{severity}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getSeverityColor(severity)}`}>
                {percentAccuracy}% Match
              </span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-indigo-300 text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
              <Fingerprint className="w-4 h-4" /> Profile Status
            </div>
            <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
              Active & Calibrated
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-12 bg-slate-50 relative">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10">
          {/* 2. Vision Assessment */}
          <div className="mb-14">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3 tracking-tight">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                <Eye className="w-5 h-5" />
              </div>
              Cognitive Vision Assessment
            </h2>
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] leading-relaxed text-slate-700 text-lg font-medium">
              {aiExplanation}
            </div>
          </div>

          {/* 3. Systematic Treatment Plan */}
          <div className="mb-14">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3 tracking-tight">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              Adaptation Matrix (Treatment Plan)
            </h2>
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-50/80 p-5 border-b border-slate-100 font-black text-slate-500 text-xs tracking-wider uppercase">
                <div>Detected Problem</div>
                <div className="hidden md:block">System Action</div>
                <div>Accessible Output</div>
              </div>
              {meaningBasedTransformations.map((t: any, idx: number) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 p-6 border-b border-slate-100 last:border-0 items-center gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="font-bold text-slate-800 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: t.safe_hex || t.transformed_color_hex }}></div>
                    {t.original_color_name}
                  </div>
                  <div className="hidden md:flex items-center text-indigo-500 font-bold gap-2 text-sm uppercase tracking-wide">
                    <ArrowRight className="w-4 h-4" /> Converts to
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold border shadow-sm transition-transform hover:scale-[1.02]"
                         style={{ backgroundColor: `${t.transformed_color_hex}15`, borderColor: `${t.transformed_color_hex}40`, color: t.transformed_color_hex }}>
                      {t.meaning_label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Interactive Simulation */}
          <div>
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3 tracking-tight">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              Live Simulation Playground
            </h2>
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                {['analytics', 'trading', 'devops'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab as any)}
                    className={`px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap border ${
                      activePlaygroundTab === tab
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} Dashboard
                  </button>
                ))}
              </div>

              <div className="relative bg-slate-950 rounded-2xl h-[400px] overflow-hidden border border-slate-800 shadow-inner">
                {/* Subtle playground background grid */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                
                {isScanning && (
                  <div className="absolute inset-0 bg-slate-900/80 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-[0_0_40px_rgba(79,70,229,0.5)] border border-indigo-500">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Applying {deficiencyType} Filters...
                    </div>
                  </div>
                )}
                
                <div className="p-8 h-full flex flex-col justify-center relative z-10">
                  {activePlaygroundTab === 'analytics' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {meaningBasedTransformations.slice(0, 3).map((t: any, idx: number) => {
                        const isGreen = t.original_color_name.toLowerCase().includes('green');
                        const defaultBg = isGreen ? 'bg-emerald-500' : 'bg-rose-500';
                        const defaultLabel = isGreen ? 'Normal: Green' : 'Normal: Red';
                        
                        return (
                          <div key={idx} className="h-32 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 relative overflow-hidden group shadow-2xl transition-all hover:border-slate-600">
                            <div className={`absolute top-4 right-4 ${defaultBg} text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full shadow-lg`}>
                              {defaultLabel}
                            </div>
                            <div 
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-white font-black text-sm text-center p-4"
                              style={{ backgroundColor: t.transformed_color_hex }}
                            >
                              {t.meaning_label}
                            </div>
                          </div>
                        );
                      })}
                      <div className="h-32 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl flex items-center justify-center text-slate-500 font-bold text-center px-6">
                        Hover over panels to reveal AI tags
                      </div>
                    </div>
                  )}
                  {activePlaygroundTab === 'trading' && (
                    <div className="flex justify-center items-center h-full text-slate-500 font-medium">
                      Trading charts simulation loaded... Hover to see Safe Colours.
                    </div>
                  )}
                  {activePlaygroundTab === 'devops' && (
                    <div className="flex justify-center items-center h-full text-slate-500 font-medium">
                      DevOps terminal simulation loaded... Server statuses tagged.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons (Hidden from PDF) */}
          <div data-html2canvas-ignore="true" className="mt-16 flex flex-col sm:flex-row gap-4 justify-center items-center border-t border-slate-200/60 pt-10 pb-6 relative z-10">
            <button
              onClick={() => resetTest()}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-colors shadow-sm hover:shadow-md w-full sm:w-auto"
            >
              <RotateCcw className="w-5 h-5 text-slate-400" /> Retake Test
            </button>
            
            <button
              onClick={() => {
                import('../utils/pdfGenerator').then(({ generatePDFReport }) => {
                  generatePDFReport('result-report-content', 'Neurolens_Diagnostic_Report.pdf');
                });
              }}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_25px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <FileText className="w-5 h-5" /> Download PDF Report
            </button>
            
            <button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <ShieldCheck className="w-5 h-5" /> Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
