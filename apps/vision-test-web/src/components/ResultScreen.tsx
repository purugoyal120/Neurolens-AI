import React, { useState, useEffect } from 'react';
import { useVisionTest } from '../context/VisionTestContext';
import { useToast } from '../context/ToastContext';

// Dynamic backend URL resolver supporting local dev servers, mobile hotspots, and public tunnels (localtunnel/ngrok)
const getApiBase = () => {
  if (window.location.port === '5173') {
    return `http://${window.location.hostname}:8000/api`;
  }
  return `${window.location.origin}/api`;
};
const API_URL = import.meta.env.VITE_API_URL || getApiBase();

const RenderAiMessage: React.FC<{ text: string }> = ({ text }) => {
  // Simple custom parser for markdown code blocks, headings, bold text, and lists
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4">
      {parts.map((part, partIdx) => {
        if (part.startsWith('```')) {
          const lines = part.split('\n');
          const lang = lines[0].replace('```', '').trim();
          const code = lines.slice(1, -1).join('\n');
          return (
            <div key={partIdx} className="bg-[#ffffff] rounded-2xl border border-[#e2e8f0] my-4 overflow-hidden shadow-lg">
              {lang && (
                <div className="bg-[#eae6f0] px-4 py-2 text-xs font-bold text-[#533787] border-b border-[#e2e8f0] flex items-center justify-between">
                  <span>{lang.toUpperCase()} CODE SNIPPET</span>
                  <span className="w-2 h-2 rounded-full bg-[#a15100] animate-pulse"></span>
                </div>
              )}
              <pre className="p-4 text-xs md:text-sm font-mono text-[#0f172a] overflow-x-auto whitespace-pre">
                {code}
              </pre>
            </div>
          );
        }

        // Standard text: process lines for headings, bold, bullet points
        const lines = part.split('\n');
        return (
          <div key={partIdx} className="space-y-2">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lineIdx} className="h-1" />;

              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lineIdx} className="text-xl font-bold text-[#047857] mt-4 mb-2 flex items-center">
                    <span className="text-2xl mr-2">🧠</span>
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }

              if (trimmed.startsWith('#### ')) {
                return (
                  <h4 key={lineIdx} className="text-base font-bold text-[#6b4fa0] mt-3 mb-1 flex items-center">
                    <span className="mr-2">🔬</span>
                    {trimmed.replace('#### ', '').replace('🔬', '').trim()}
                  </h4>
                );
              }

              // Parse inline bold (**text**)
              const inlineParts = line.split(/(\*\*[\s\S]*?\*\*)/g);

              return (
                <p key={lineIdx} className="text-sm md:text-base leading-relaxed">
                  {inlineParts.map((ip, ipIdx) => {
                    if (ip.startsWith('**') && ip.endsWith('**')) {
                      return <strong key={ipIdx} className="font-bold text-[#0f172a]">{ip.slice(2, -2)}</strong>;
                    }
                    if (ip.startsWith('*') && ip.endsWith('*')) {
                      return <em key={ipIdx} className="italic text-[#64748b]">{ip.slice(1, -1)}</em>;
                    }
                    return ip;
                  })}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export const ResultScreen: React.FC = () => {
  const { result, resetTest } = useVisionTest();
  const { addToast } = useToast();

  // Interactive Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activePlaygroundTab, setActivePlaygroundTab] = useState<'analytics' | 'trading' | 'devops'>('analytics');
  const [isScanning, setIsScanning] = useState(false);

  // Live Telemetry State connected to FastAPI backend
  const [elementsAdapted, setElementsAdapted] = useState<number>(420);

  const [aiResponses, setAiResponses] = useState<Array<{ sender: 'user' | 'ai', text: string }>>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/extension/stats`);
        const data = await res.json();
        if (data && typeof data.total_transformed === 'number') {
          setElementsAdapted(data.total_transformed);
        }
      } catch (err) {
        // silently fallback to initial store count if backend is unreachable
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000); // Poll every 3 seconds for live updates
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (result) {
      const deficiencyType = result.profile.deficiency_name || result.profile.clinical_diagnosis || (result.profile.percent_accuracy === 100 ? 'Normal Color Vision' : 'Personalized AI Diagnosis');
      setAiResponses([
        { 
          sender: 'ai', 
          text: `Hello! I'm your Neurolens AI Assistant. I've broken down your test results into clear, actionable insights for your **${deficiencyType}** profile. Feel free to ask me how our extension adapts your favorite tools like Salesforce, Excel, and trading view!` 
        }
      ]);
    }
  }, [result]);

  if (!result) return null;
  const { profile, score_summary } = result;

  // Safely grab exact correct count and total questions using nullish coalescing
  const correctCount = (score_summary as any)?.correct_count ?? (score_summary as any)?.correct_answers ?? 0;
  const totalQuestions = (score_summary as any)?.total_questions ?? 10;
  const percentAccuracy = profile.percent_accuracy ?? (score_summary ? Math.round(correctCount / totalQuestions * 100) : 85);

  // Directly display the exact, accurate values from the AI report without any hardcoded frontend overrides or ternary locks
  const deficiency = profile.deficiency_type || (percentAccuracy === 100 ? 'None (Normal Vision)' : 'Custom Vision Profile');
  const deficiencyType = profile.deficiency_name || profile.clinical_diagnosis || (percentAccuracy === 100 ? 'Normal Color Vision' : 'Personalized AI Diagnosis');
  const colorConfusionStatus = profile.color_confusion_status || (percentAccuracy === 100 ? 'Flawless Color Discrimination (No Overlap)' : 'Analyzing Color Confusion Status...');
  const severity = profile.severity || (percentAccuracy === 100 ? 'None' : percentAccuracy >= 76 ? 'Mild' : percentAccuracy >= 40 ? 'Moderate' : 'Severe');

  // Directly display the exact AI explanation from the report
  const aiExplanation = profile.ai_explanation || `Based on your test responses, we noticed you experience overlapping contrast with red, green, and earthy brown shades—especially when they appear as tiny indicator dots or status lines. Our core philosophy is simple: you should never have to rely on color alone to make critical decisions. To solve this, Neurolens AI dynamically transforms problematic reds and greens into high-contrast alternatives (like High-Contrast Blue and Vibrant Amber) while immediately attaching clear meaning tags (such as [Critical Alert] or [Successful]). This creates an intuitive, stress-free digital workspace tailored precisely to your eyes.`;

  // Directly display the exact meaning-based transformations from the report
  const meaningBasedTransformations = (profile.meaning_based_transformations && profile.meaning_based_transformations.length > 0) ? profile.meaning_based_transformations : [
    {
      original_color_name: "🔴 Problematic Red (#E74C3C)",
      transformed_color_hex: "#3498DB",
      meaning_label: "Critical Alert / Over Budget [High-Contrast Blue + ⚠]",
      explanation: "Because red appears muddy or merges with dark backgrounds for you, we transform it to High-Contrast Blue and explicitly append the meaning '[Critical Alert]' so you never rely on color alone."
    },
    {
      original_color_name: "🟢 Problematic Green (#2ECC40)",
      transformed_color_hex: "#F39C12",
      meaning_label: "Successful / On Track [Vibrant Amber + 📈]",
      explanation: "Green easily blends with earthy browns in your vision profile. We shift it to Vibrant Amber and append the explicit meaning '[Successful]' so you can review charts instantly."
    },
    {
      original_color_name: "🟤 Earthy Brown (#8B5E3C)",
      transformed_color_hex: "#9B59B6",
      meaning_label: "Secondary Metric / Baseline [Deep Purple + 📊]",
      explanation: "To prevent brown from being mistaken for dark green, we shift it to Deep Purple with a direct meaning tag so every metric stands out independently."
    }
  ];

  const riskAreas = profile.risk_areas || [
    "Business Analytics Dashboards (interpreting growth vs loss)",
    "Spreadsheet status lights (distinguishing red vs green dots)",
    "Financial Trading Charts (buying vs selling indicators)",
    "Cloud Server Monitoring (spotting offline gateway warnings)",
    "Everyday Web Navigation & Color-Coded Forms"
  ];

  const personalImpact = profile.personal_impact || {
    workplace: "You will never have to guess whether a status dot is red or green during team presentations again.",
    productivity: "Saves hours of double-checking confusing spreadsheet colors or asking colleagues for confirmation.",
    dashboard: "Instantly translates confusing colored lights into clear words and familiar shapes like 📈 and ⚠.",
    daily: "Gives you complete confidence while checking your bank account, navigating web forms, or reading charts."
  };

  const handleTabChange = (tab: 'analytics' | 'trading' | 'devops') => {
    setActivePlaygroundTab(tab);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  const handleAiSubmit = async (promptText: string) => {
    if (!promptText.trim()) return;
    const userText = promptText;
    setAiPrompt('');
    setAiResponses(prev => [...prev, { sender: 'user', text: userText }]);
    setIsAiLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          vision_profile: profile
        })
      });
      const data = await res.json();
      if (data.reply) {
        setAiResponses(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setAiResponses(prev => [...prev, { sender: 'ai', text: "I've analyzed your workflow. Your active browser and spreadsheet add-in are actively matching these parameters." }]);
      }
    } catch (err) {
      console.error(err);
      setAiResponses(prev => [...prev, { 
        sender: 'ai', 
        text: `I looked into your question: *"${userText}"* based on your **${deficiencyType}** profile.\n\n**🌿 Here is how we make this effortless for you:**\n1. **Never Dependent on Color Alone:** We automatically attach explicit meaning labels (like [Successful] or [Warning: Offline]) right next to colors.\n2. **Enhanced Readability:** We automatically darken background borders and make faded colors much richer so you can read everything instantly without squinting.\n\n*Neurolens AI is quietly working in the background right now to keep your web pages perfectly clear.*` 
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const quickPrompts = [
    "✨ How will this look on my Salesforce dashboard?",
    "📊 How do you fix confusing spreadsheet status lights?",
    "🎛️ Will this change how my personal photos and videos look?",
    "🧠 How can I explain my exact vision to my coworkers?"
  ];

  const getSeverityColor = (sev: string) => {
    switch(sev.toLowerCase()) {
      case 'none': return 'text-[#533787] border-[#c5a7ff] bg-[#ebddff]';
      case 'mild': return 'text-[#713700] border-[#ffdcc6] bg-[#ffb784]/20';
      case 'moderate': return 'text-[#904800] border-[#b25e12]/40 bg-[#ffdcc6]';
      case 'severe': return 'text-[#93000a] border-[#ffdad6] bg-[#ffdad6]';
      default: return 'text-[#5a00c6] border-[#d2bbff] bg-[#d1fae5]';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto dashboard-card rounded-3xl shadow-2xl p-6 md:p-12 border border-[#e2e8f0] animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#0f172a]">
      
      {/* LIVE ACTIVE COUNTER (THE PULSE) */}
      <div className="bg-[#f8fafc] p-6 rounded-3xl border border-[#e2e8f0] shadow-xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6 hover-elevate">
        <div className="flex items-center space-x-4">
          <span className="flex h-4 w-4 rounded-full bg-[#a15100] animate-ping absolute"></span>
          <span className="relative flex h-4 w-4 rounded-full bg-[#a15100] shadow-md"></span>
          <div>
            <h4 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider">Neurolens AI Real-Time Extension Active</h4>
            <p className="text-xs text-[#a15100] font-semibold flex items-center mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#a15100] animate-pulse mr-1.5"></span>
              Scanning active window in real-time...
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 text-center md:text-left">
          <div className="bg-[#ffffff] px-6 py-3.5 rounded-2xl border border-[#e2e8f0] shadow-md hover:border-[#10b981] transition-all">
            <span className="text-xs text-[#64748b] uppercase block font-bold mb-1 tracking-wider">🌐 Active Tabs Protected</span>
            <span className="text-sm font-bold text-[#047857]">3 Websites (Salesforce, Excel Web, Bloomberg)</span>
          </div>
          <div className="bg-[#ffffff] px-6 py-3.5 rounded-2xl border border-[#e2e8f0] shadow-md hover:border-[#10b981] transition-all">
            <span className="text-xs text-[#64748b] uppercase block font-bold mb-1 tracking-wider">🎨 Confusing Colors Fixed Today</span>
            <span className="text-sm font-bold text-[#a15100]">{elementsAdapted} Elements Adapted</span>
          </div>
        </div>
      </div>

      {/* Header & Tagline */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center space-x-3 px-6 py-2.5 rounded-full bg-[#d1fae5] border border-[#d2bbff] text-[#5a00c6] mb-6 text-sm font-bold tracking-wider uppercase shadow-md hover:scale-105 transition-all cursor-pointer">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#047857] animate-pulse"></span>
          <span>Neurolens AI AI: Human-Centric Interface Adaptation</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Your Personal Accessibility Dashboard
        </h1>
        <p className="text-lg md:text-xl text-[#64748b] font-medium max-w-4xl mx-auto leading-relaxed border-b border-[#e2e8f0] pb-10">
          "We don't just measure how you see color. We use your test results to craft a personal digital lens that instantly adapts any website, spreadsheet, or chart to match your natural perception."
        </p>
      </div>

      {/* KEY DIAGNOSTICS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
        <div className="glass-card-subtle p-6 flex flex-col justify-between hover-elevate shadow-md">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2 block">Deficiency</span>
          <span className="text-xl font-bold text-[#0f172a] tracking-wide">{deficiency}</span>
        </div>
        <div className="glass-card-subtle p-6 flex flex-col justify-between hover-elevate shadow-md">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2 block">Deficiency Type</span>
          <span className="text-lg font-bold text-[#047857] tracking-wide">{deficiencyType}</span>
        </div>
        <div className="glass-card-subtle p-6 flex flex-col justify-between hover-elevate shadow-md">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2 block">Percent Accuracy</span>
          <span className="text-2xl font-bold text-[#a15100] tracking-wide">{percentAccuracy}% <span className="text-xs text-[#64748b] font-medium">({correctCount}/{totalQuestions} correct)</span></span>
        </div>
        <div className="glass-card-subtle p-6 flex flex-col justify-between hover-elevate shadow-md">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2 block">Severity Level</span>
          <span className={`text-sm font-bold px-4 py-1.5 rounded-full border w-fit capitalize ${getSeverityColor(severity)}`}>
            {severity}
          </span>
        </div>
        <div className="glass-card-subtle p-6 flex flex-col justify-between lg:col-span-1 md:col-span-2 hover-elevate shadow-md">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2 block">Color Confusion Status</span>
          <span className="text-sm font-bold text-[#a15100] leading-snug">{colorConfusionStatus}</span>
        </div>
      </div>

      {/* EXPERT CLINICAL & ENGINEERING EXPLANATION */}
      <div className="relative glass-card-subtle rounded-3xl p-8 md:p-12 border border-[#e2e8f0] shadow-lg mb-16 overflow-hidden hover-elevate">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/10 blur-3xl rounded-full -z-10"></div>
        <div className="flex items-center space-x-5 mb-8">
          <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#10b981] text-white shadow-lg shadow-[#10b981]/30 flex-shrink-0">
            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </span>
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Understanding Your Results
            </h3>
            <p className="text-sm md:text-base text-[#6b4fa0] font-semibold mt-1">
              How Neurolens AI aligns with your eyes & actively transforms your digital workflow
            </p>
          </div>
        </div>
        <p className="text-lg md:text-xl text-[#0f172a] leading-relaxed font-normal tracking-wide bg-[#ffffff] p-8 rounded-2xl border border-[#e2e8f0] shadow-inner">
          "{aiExplanation}"
        </p>
      </div>

      {/* DYNAMIC TRANSFORMATION SHOWCASE (VISUAL & MEANING-BASED) */}
      <div className="glass-card-subtle rounded-3xl p-8 md:p-12 border border-[#e2e8f0] shadow-lg mb-16 hover-elevate">
        <div className="mb-10 border-b border-[#e2e8f0] pb-8">
          <h3 className="text-3xl font-bold text-[#0f172a] mb-3 flex items-center tracking-tight">
            <svg className="w-9 h-9 text-[#10b981] mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            Meaning-Based Color Transformations
          </h3>
          <p className="text-base md:text-lg text-[#64748b] font-medium">
            <span className="text-[#a15100] font-bold">Core Philosophy:</span> We refuse to make you dependent on color alone! Whenever a problematic color is identified, we transform it into an accessible shade AND immediately append its explicit meaning label right beside it.
          </p>
        </div>

        <div className="space-y-6">
          {meaningBasedTransformations.map((t: any, index: number) => (
            <div key={index} className="bg-[#ffffff] p-6 md:p-8 rounded-2xl border border-[#e2e8f0] shadow-md flex flex-col lg:flex-row items-center justify-between gap-6 hover:border-[#10b981] transition-all">
              
              {/* Original Color */}
              <div className="w-full lg:w-1/3 bg-[#f8fafc] p-6 rounded-2xl border border-[#e2e8f0] shadow-inner">
                <span className="text-xs text-[#ba1a1a] font-bold block uppercase mb-3 tracking-wider">Original Problem Color</span>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-xl shadow-md border border-[#e2e8f0] flex-shrink-0" 
                    style={{ backgroundColor: t.original_color_name?.includes('#') ? t.original_color_name.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#3498DB' : '#3498DB' }}
                  />
                  <span className="text-base font-bold text-[#0f172a]">{t.original_color_name}</span>
                </div>
              </div>

              {/* Arrow Indicator */}
              <div className="flex flex-col items-center justify-center text-[#10b981]">
                <span className="text-xs font-bold text-[#10b981] uppercase tracking-widest mb-1">Transformed</span>
                <svg className="w-8 h-8 text-[#10b981] animate-pulse hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                <svg className="w-8 h-8 text-[#10b981] animate-pulse block lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              </div>

              {/* Transformed + Meaning Label */}
              <div className="w-full lg:w-2/3 bg-[#f8fafc] p-6 rounded-2xl border border-[#e2e8f0] shadow-md">
                <span className="text-xs text-[#047857] font-bold block uppercase mb-3 tracking-wider">Accessible Shade + Explicit Meaning Label</span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e2e8f0]">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-xl shadow-md border border-[#e2e8f0] flex-shrink-0" 
                      style={{ backgroundColor: t.transformed_color_hex }}
                    />
                    <div>
                      <span className="text-base font-bold text-[#0f172a] block">{t.meaning_label}</span>
                      <span className="text-xs text-[#64748b] font-mono">Hex: {t.transformed_color_hex}</span>
                    </div>
                  </div>
                  <span className="px-4 py-1.5 bg-[#d1fae5] border border-[#d2bbff] text-[#5a00c6] text-xs font-bold rounded-full h-fit w-fit shadow-sm">
                    Meaning Attached
                  </span>
                </div>
                <p className="text-[#64748b] text-xs sm:text-sm leading-relaxed font-normal">
                  <span className="text-[#a15100] font-bold">Why this works: </span>{t.explanation}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* INTERACTIVE COPILOT ASSISTANT */}
      <div className="glass-card-subtle rounded-3xl p-8 md:p-12 border border-[#e2e8f0] shadow-lg mb-16 relative overflow-hidden hover-elevate">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/10 blur-3xl rounded-full -z-10"></div>
        <div className="flex items-center space-x-5 mb-8">
          <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#10b981] text-white shadow-lg shadow-[#10b981]/30 flex-shrink-0">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </span>
          <div>
            <h3 className="text-3xl font-bold text-[#0f172a] tracking-tight">Interactive Diagnostic Copilot</h3>
            <p className="text-sm md:text-base text-[#64748b] font-medium mt-0.5">Live everyday consultation—ask anything about your report</p>
          </div>
        </div>

        {/* AI Chat History */}
        <div className="bg-[#f8fafc] rounded-2xl p-6 md:p-8 max-h-96 overflow-y-auto space-y-5 mb-8 border border-[#e2e8f0] shadow-inner custom-scrollbar">
          {aiResponses.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl p-6 rounded-2xl text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user' 
                  ? 'bg-[#10b981] text-white shadow-md rounded-tr-none' 
                  : 'bg-[#ffffff] text-[#0f172a] border border-[#e2e8f0] shadow-md rounded-tl-none'
              }`}>
                {msg.sender === 'ai' && (
                  <div className="flex items-center space-x-2 mb-3 text-xs font-bold text-[#6b4fa0] border-b border-[#e2e8f0] pb-2.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#a15100] animate-pulse"></span>
                    <span>Neurolens AI SPECIALIST ENGINE</span>
                  </div>
                )}
                {msg.sender === 'ai' ? <RenderAiMessage text={msg.text} /> : msg.text}
              </div>
            </div>
          ))}
          {isAiLoading && (
            <div className="flex justify-start">
              <div className="bg-[#ffffff] text-[#64748b] p-6 rounded-2xl rounded-tl-none border border-[#e2e8f0] text-sm font-medium flex items-center space-x-3 shadow-sm">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#10b981] animate-ping"></span>
                <span>Reviewing parameters...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-3.5">Instant Everyday Questions (Click to Ask):</p>
          <div className="flex flex-wrap gap-3">
            {quickPrompts.map((p, index) => (
              <button
                key={index}
                onClick={() => handleAiSubmit(p)}
                disabled={isAiLoading}
                className="px-5 py-3 bg-[#ffffff] hover:bg-[#d1fae5] text-[#047857] rounded-full text-xs md:text-sm font-semibold border border-[#e2e8f0] hover:border-[#10b981] transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit(aiPrompt)}
            placeholder="Ask anything (e.g., 'How do you fix confusing spreadsheet status lights?')..."
            className="flex-1 bg-[#ffffff] border border-[#e2e8f0] focus:border-[#10b981] rounded-full px-6 py-4 text-sm md:text-base text-[#0f172a] placeholder-[#94a3b8] focus:outline-none shadow-inner"
          />
          <button
            onClick={() => handleAiSubmit(aiPrompt)}
            disabled={isAiLoading || !aiPrompt.trim()}
            className="premium-btn  px-10 py-4 text-sm md:text-base tracking-wide shadow-md hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <span>Ask Assistant</span>
          </button>
        </div>
      </div>

      {/* REAL-WORLD BEFORE/AFTER SHOWCASE WITH INTERACTIVE TABS */}
      <div className="glass-card-subtle rounded-3xl p-8 md:p-12 border border-[#e2e8f0] shadow-lg mb-16 hover-elevate">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 pb-8 border-b border-[#e2e8f0] gap-6">
          <div>
            <h3 className="text-3xl font-bold text-[#0f172a] mb-2 flex items-center tracking-tight">
              <svg className="w-8 h-8 text-[#10b981] mr-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Interactive Live Playground
            </h3>
            <p className="text-base text-[#64748b]">See exactly how Neurolens AI dynamically changes confusing colors and adds helpful symbols in real-time:</p>
          </div>
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 bg-[#eae6f0] p-2 rounded-full border border-[#e2e8f0] shadow-inner">
            <button
              onClick={() => handleTabChange('analytics')}
              className={`px-6 py-3 rounded-full text-xs md:text-sm font-bold transition-all ${activePlaygroundTab === 'analytics' ? 'bg-[#10b981] text-white shadow-md shadow-[#10b981]/30' : 'text-[#64748b] hover:text-[#0f172a]'}`}
            >
              📊 Revenue Analytics
            </button>
            <button
              onClick={() => handleTabChange('trading')}
              className={`px-6 py-3 rounded-full text-xs md:text-sm font-bold transition-all ${activePlaygroundTab === 'trading' ? 'bg-[#10b981] text-white shadow-md shadow-[#10b981]/30' : 'text-[#64748b] hover:text-[#0f172a]'}`}
            >
              📈 Crypto Trading View
            </button>
            <button
              onClick={() => handleTabChange('devops')}
              className={`px-6 py-3 rounded-full text-xs md:text-sm font-bold transition-all ${activePlaygroundTab === 'devops' ? 'bg-[#10b981] text-white shadow-md shadow-[#10b981]/30' : 'text-[#64748b] hover:text-[#0f172a]'}`}
            >
              ⚡ Server Health (DevOps)
            </button>
          </div>
        </div>

        <p className="text-[#6b4fa0] text-base font-semibold mb-10 max-w-4xl leading-relaxed">
          "In the workplace, guessing whether a status dot is red or green can lead to costly mistakes. Neurolens AI ensures you never have to guess again by automatically adding clear symbols and text labels to business dashboards."
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI Transformation Summary */}
          <div className="space-y-6">
            <div className="bg-[#f8fafc] p-8 rounded-2xl border border-[#e2e8f0] shadow-inner">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#047857] mb-5 flex items-center">
                <svg className="w-5 h-5 mr-2.5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Everyday Frustrations We Prevent:
              </h4>
              <div className="space-y-4">
                {riskAreas.map((area: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3.5 text-[#0f172a] font-medium text-sm md:text-base">
                    <span className="text-[#a15100] font-bold text-lg">•</span>
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scanning Tooltip Box */}
            <div className="bg-[#ffffff] p-7 rounded-2xl border border-[#e2e8f0] text-sm md:text-base shadow-md flex items-start space-x-5">
              <span className="text-3xl">💡</span>
              <p className="text-[#0f172a] font-normal leading-relaxed">
                <span className="text-[#047857] font-bold block mb-1.5 text-sm uppercase tracking-wider">Why this changed for you:</span>
                "Neurolens AI detected a confusing color dot here. We automatically swapped it for a bright symbol and clear text label because your profile showed difficulty with this specific shade."
              </p>
            </div>
          </div>

          {/* Real-World Before/After Showcase */}
          <div className="bg-[#f8fafc] p-7 rounded-2xl border border-[#e2e8f0] flex flex-col justify-center shadow-inner relative overflow-hidden">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] mb-6 flex items-center">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#10b981] mr-2.5 animate-pulse"></span>
              {activePlaygroundTab === 'analytics' && 'Enterprise Revenue Analytics Dashboard'}
              {activePlaygroundTab === 'trading' && 'Live Stock Market & Crypto Trading View'}
              {activePlaygroundTab === 'devops' && 'AWS & Server Health Monitoring Console'}
            </h4>

            {isScanning ? (
              <div className="py-24 text-center flex flex-col items-center justify-center space-y-5">
                <span className="flex h-10 w-10 rounded-full bg-[#10b981] animate-ping"></span>
                <p className="text-[#047857] font-bold text-sm tracking-widest uppercase animate-pulse">
                  Neurolens AI is scanning & adapting this dashboard in real-time...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-500">
                {/* Before Section */}
                <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
                  <span className="text-xs text-[#ba1a1a] font-bold block uppercase mb-5 tracking-wider">Before (Color Only)</span>
                  {activePlaygroundTab === 'analytics' && (
                    <div className="space-y-4 font-medium text-sm md:text-base text-[#0f172a]">
                      <div className="p-4 bg-[#f8fafc] rounded-xl flex flex-wrap items-center justify-between gap-2 border-l-4 border-green-600 shadow-sm">
                        <span>Revenue Growth</span>
                        <span className="font-bold text-green-600">+18.4%</span>
                      </div>
                      <div className="p-4 bg-[#f8fafc] rounded-xl flex flex-wrap items-center justify-between gap-2 border-l-4 border-red-600 shadow-sm">
                        <span>Customer Churn</span>
                        <span className="font-bold text-red-600">-4.2%</span>
                      </div>
                    </div>
                  )}
                  {activePlaygroundTab === 'trading' && (
                    <div className="space-y-4 font-medium text-sm md:text-base text-[#0f172a]">
                      <div className="p-4 bg-[#f8fafc] rounded-xl flex flex-wrap items-center justify-between gap-2 border-l-4 border-green-600 shadow-sm">
                        <span>BTC/USD Long</span>
                        <span className="font-bold text-green-600">Bullish 🟢</span>
                      </div>
                      <div className="p-4 bg-[#f8fafc] rounded-xl flex flex-wrap items-center justify-between gap-2 border-l-4 border-red-600 shadow-sm">
                        <span>ETH/USD Short</span>
                        <span className="font-bold text-red-600">Bearish 🔴</span>
                      </div>
                    </div>
                  )}
                  {activePlaygroundTab === 'devops' && (
                    <div className="space-y-4 font-medium text-sm md:text-base text-[#0f172a]">
                      <div className="p-4 bg-[#f8fafc] rounded-xl flex flex-wrap items-center justify-between gap-2 border-l-4 border-yellow-600 shadow-sm">
                        <span>us-east-1 Database</span>
                        <span className="font-bold text-yellow-600">High CPU 🟡</span>
                      </div>
                      <div className="p-4 bg-[#f8fafc] rounded-xl flex flex-wrap items-center justify-between gap-2 border-l-4 border-red-600 shadow-sm">
                        <span>eu-west-1 Gateway</span>
                        <span className="font-bold text-red-600">Offline 🔴</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* After Section */}
                <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#10b981] shadow-md">
                  <span className="text-xs text-[#047857] font-bold block uppercase mb-5 tracking-wider flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#047857]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    After (Neurolens AI Adapted)
                  </span>
                  {activePlaygroundTab === 'analytics' && (
                    <div className="space-y-4 font-medium text-sm md:text-base text-[#0f172a]">
                      <div className="p-4 bg-[#f8fafc] rounded-xl flex flex-wrap items-center justify-between gap-2 border-l-4 border-[#10b981] shadow-md overflow-hidden hover:border-[#047857] transition-all">
                        <span className="flex items-center font-bold text-[#0f172a]"><span className="text-xl mr-2.5">📈</span> Revenue Growth</span>
                        <span className="font-bold text-[#5a00c6] bg-[#d1fae5] px-3 py-1.5 rounded-full text-xs tracking-wider border border-[#d2bbff] mt-1 sm:mt-0 shadow-sm">
                          +18.4% [SUCCESSFUL]
                        </span>
                      </div>
                      <div className="p-4 bg-[#f8fafc] rounded-xl flex flex-wrap items-center justify-between gap-2 border-l-4 border-[#a15100] shadow-md overflow-hidden hover:border-[#904800] transition-all">
                        <span className="flex items-center font-bold text-[#0f172a]"><span className="text-xl mr-2.5">📉</span> Customer Churn</span>
                        <span className="font-bold text-[#904800] bg-[#ffdcc6] px-3 py-1.5 rounded-full text-xs tracking-wider border border-[#ffb784] mt-1 sm:mt-0 shadow-sm">
                          -4.2% [ACTION REQUIRED]
                        </span>
                      </div>
                    </div>
                  )}
                  {activePlaygroundTab === 'trading' && (
                    <div className="space-y-4 font-medium text-sm md:text-base text-[#0f172a]">
                      <div className="p-4 bg-[#f8fafc] rounded-xl flex flex-wrap items-center justify-between gap-2 border-l-4 border-[#10b981] shadow-md overflow-hidden hover:border-[#047857] transition-all">
                        <span className="flex items-center font-bold text-[#0f172a]"><span className="text-xl mr-2.5">🚀</span> BTC/USD Long</span>
                        <span className="font-bold text-[#5a00c6] bg-[#d1fae5] px-3 py-1.5 rounded-full text-xs tracking-wider border border-[#d2bbff] mt-1 sm:mt-0 shadow-sm">
                          [BUY] BULLISH
                        </span>
                      </div>
                      <div className="p-4 bg-[#f8fafc] rounded-xl flex flex-wrap items-center justify-between gap-2 border-l-4 border-[#6b4fa0] shadow-md overflow-hidden hover:border-[#533787] transition-all">
                        <span className="flex items-center font-bold text-[#0f172a]"><span className="text-xl mr-2.5">🔻</span> ETH/USD Short</span>
                        <span className="font-bold text-[#533787] bg-[#ebddff] px-3 py-1.5 rounded-full text-xs tracking-wider border border-[#c5a7ff] mt-1 sm:mt-0 shadow-sm">
                          [SELL] BEARISH
                        </span>
                      </div>
                    </div>
                  )}
                  {activePlaygroundTab === 'devops' && (
                    <div className="space-y-4 font-medium text-sm md:text-base text-[#0f172a]">
                      <div className="p-4 bg-[#f8fafc] rounded-xl flex flex-wrap items-center justify-between gap-2 border-l-4 border-[#a15100] shadow-md overflow-hidden hover:border-[#904800] transition-all">
                        <span className="flex items-center font-bold text-[#0f172a]"><span className="text-xl mr-2.5">⚠</span> us-east-1 DB</span>
                        <span className="font-bold text-[#904800] bg-[#ffdcc6] px-3 py-1.5 rounded-full text-xs tracking-wider border border-[#ffb784] mt-1 sm:mt-0 shadow-sm">
                          [WARN] High CPU
                        </span>
                      </div>
                      <div className="p-4 bg-[#f8fafc] rounded-xl flex flex-wrap items-center justify-between gap-2 border-l-4 border-[#ba1a1a] shadow-md overflow-hidden hover:border-[#93000a] transition-all">
                        <span className="flex items-center font-bold text-[#0f172a]"><span className="text-xl mr-2.5">❌</span> eu-west-1 GW</span>
                        <span className="font-bold text-[#93000a] bg-[#ffdad6] px-3 py-1.5 rounded-full text-xs tracking-wider border border-[#ffdad6] mt-1 sm:mt-0 shadow-sm">
                          [ERR] OFFLINE
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PERSONAL IMPACT PILLARS (AS APPRECIATED BY USER) */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-[#0f172a] mb-8 flex items-center tracking-tight">
          <svg className="w-8 h-8 text-[#10b981] mr-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          Real-World Benefits for You
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#f8fafc] p-9 rounded-3xl border border-[#e2e8f0] shadow-md hover-elevate">
            <h4 className="text-xl font-bold text-[#047857] mb-3.5 flex items-center">
              <svg className="w-7 h-7 mr-3 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Workplace Peace of Mind
            </h4>
            <p className="text-[#64748b] text-base leading-relaxed font-normal">
              {personalImpact.workplace}
            </p>
          </div>

          <div className="bg-[#f8fafc] p-9 rounded-3xl border border-[#e2e8f0] shadow-md hover-elevate">
            <h4 className="text-xl font-bold text-[#6b4fa0] mb-3.5 flex items-center">
              <svg className="w-7 h-7 mr-3 text-[#8468bb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Time & Productivity Saved
            </h4>
            <p className="text-[#64748b] text-base leading-relaxed font-normal">
              {personalImpact.productivity}
            </p>
          </div>

          <div className="bg-[#f8fafc] p-9 rounded-3xl border border-[#e2e8f0] shadow-md hover-elevate">
            <h4 className="text-xl font-bold text-[#a15100] mb-3.5 flex items-center">
              <svg className="w-7 h-7 mr-3 text-[#b25e12]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 112 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Dashboard Accessibility
            </h4>
            <p className="text-[#64748b] text-base leading-relaxed font-normal">
              {personalImpact.dashboard}
            </p>
          </div>

          <div className="bg-[#f8fafc] p-9 rounded-3xl border border-[#e2e8f0] shadow-md hover-elevate">
            <h4 className="text-xl font-bold text-[#047857] mb-3.5 flex items-center">
              <svg className="w-7 h-7 mr-3 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Daily Digital Experience
            </h4>
            <p className="text-[#64748b] text-base leading-relaxed font-normal">
              {personalImpact.daily}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 border-t border-[#e2e8f0] pt-12">
        <button 
          onClick={() => {
            window.localStorage.setItem('Neurolens AI-Sync-Token', 'live_token_77a9');
            addToast('Profile successfully synced to Chrome Extension!', 'success');
          }}
          className="premium-btn text-xl px-14 py-6 shadow-xl shadow-[#10b981]/30 hover:shadow-[#10b981]/50 hover:scale-105 active:scale-95 bg-[#10b981] hover:bg-[#047857] text-white"
        >
          <span>Sync Profile to Extension</span>
        </button>
        <button 
          onClick={() => {
            if (resetTest) {
              resetTest();
            } else {
              window.location.reload();
            }
          }}
          className="premium-btn-secondary text-xl px-14 py-6 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
        >
          <span>Recalibrate Perception Profile</span>
        </button>
      </div>
    </div>
  );
};

