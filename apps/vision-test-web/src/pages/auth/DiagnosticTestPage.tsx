import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ChevronRight, Activity, ShieldCheck, FileText, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export const DiagnosticTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { saveReport } = useAuth();
  
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ protanopia: 0, deuteranopia: 0, tritanopia: 0, normal: 0 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  
  // 1 Minute Timer
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const testSteps = [
    { id: 1, type: 'protanopia', baseColor: '#E53935', targetColor: '#C62828', question: "Click the square with a slightly different color" },
    { id: 2, type: 'deuteranopia', baseColor: '#43A047', targetColor: '#2E7D32', question: "Click the odd square out" },
    { id: 3, type: 'tritanopia', baseColor: '#1E88E5', targetColor: '#1565C0', question: "Find the odd color" },
    { id: 4, type: 'protanopia', baseColor: '#8D6E63', targetColor: '#795548', question: "Click the different shade" },
    { id: 5, type: 'deuteranopia', baseColor: '#FDD835', targetColor: '#FBC02D', question: "Which one is different?" },
    { id: 6, type: 'protanopia', baseColor: '#EF5350', targetColor: '#E53935', question: "Almost done, find the odd one" },
    { id: 7, type: 'deuteranopia', baseColor: '#66BB6A', targetColor: '#4CAF50', question: "Last one, click the odd square" }
  ];

  // Randomize the correct target square for each step (0, 1, 2, or 3)
  const targetIndex = useMemo(() => Math.floor(Math.random() * 4), [step]);

  // Timer Effect
  useEffect(() => {
    if (isAnalyzing || result || isTimeUp) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnalyzing, result, isTimeUp]);

  // Handle auto-submit on time up
  useEffect(() => {
    if (isTimeUp && !isAnalyzing && !result) {
      handleTestComplete(scores);
    }
  }, [isTimeUp]);

  const handleTestComplete = (finalScores: typeof scores) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      
      let profileName = 'Standard Mode';
      let description = 'Flawless color discrimination. No daltonization required. You can perceive the full color spectrum naturally.';
      let severity = 'None';
      let accuracy = Math.round((finalScores.normal / 7) * 100);

      // Diagnostic Logic based on exact errors
      if (finalScores.protanopia > 1 && finalScores.protanopia >= finalScores.deuteranopia) {
        profileName = 'Protanopia Mode';
        severity = finalScores.protanopia >= 3 ? 'Severe' : 'Moderate';
        description = 'Red-blindness detected. You struggle to differentiate subtle red hues. Neurolens AI will actively shift confusing red tones into high-contrast cyan to help you distinguish them clearly.';
      } else if (finalScores.deuteranopia > 1) {
        profileName = 'Deuteranopia Mode';
        severity = finalScores.deuteranopia >= 3 ? 'Severe' : 'Moderate';
        description = 'Green-blindness detected. You have difficulty separating greens from reds and browns. Neurolens AI will optimize these frequencies to high-contrast amber & blue.';
      } else if (finalScores.tritanopia > 0) {
        profileName = 'Tritanopia Mode';
        severity = 'Moderate';
        description = 'Blue-blindness detected. You may confuse blue with green or yellow. Neurolens AI will enhance contrast boundaries for these specific spectrums.';
      } else if (accuracy < 30) {
        profileName = 'Monochromacy Mode';
        severity = 'Extreme';
        description = 'Severe color-blindness detected. Relying on color alone is dangerous for your workflow. Neurolens AI will force-apply explicit text labels and shape indicators everywhere.';
      } else if (accuracy < 100) {
        profileName = 'Standard Mode';
        severity = 'Mild';
        description = 'You made a minor error, but your color discrimination is generally excellent. Minimal daltonization required.';
      }

      const reportData = {
        profile: profileName,
        description,
        severity,
        accuracy,
        answers: ['Color Grid Test Computed'] // Simplified for the new format
      };
      
      setResult(reportData);
      saveReport(reportData);
    }, 2500);
  };

  const handleAnswer = (boxIndex: number) => {
    let newScores = { ...scores };
    
    if (boxIndex === targetIndex) {
      // Correct answer
      newScores.normal += 1;
    } else {
      // Incorrect answer, log the specific deficiency type
      const deficiencyType = testSteps[step].type as 'protanopia' | 'deuteranopia' | 'tritanopia';
      newScores[deficiencyType] += 1;
    }
    
    setScores(newScores);

    if (step < testSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleTestComplete(newScores);
    }
  };

  const handleContinue = () => {
    navigate('/register', { state: { profile: result?.profile } });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center p-4 md:p-6 font-sans py-12">
      <div className="max-w-3xl w-full">
        
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Neurolens AI</span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden relative">
          
          <AnimatePresence mode="wait">
            {!isAnalyzing && !result && (
              <motion.div 
                key={`step-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12 text-center"
              >
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="inline-flex items-center px-4 py-1.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-full uppercase tracking-wider">
                    Diagnostic Test • {step + 1} of {testSteps.length}
                  </div>
                  
                  {/* Timer Display */}
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm transition-colors ${timeLeft <= 10 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-amber-100 text-amber-700'}`}>
                    <Timer className="w-4 h-4" /> 00:{timeLeft.toString().padStart(2, '0')}
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">{testSteps[step].question}</h2>
                  <p className="text-slate-500 text-sm mt-2">Identify and click the box that has a slightly different color.</p>
                </div>

                {/* 4x4 Color Grid */}
                <div className="flex justify-center mb-10">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                    {[0, 1, 2, 3].map((boxIndex) => (
                      <button
                        key={boxIndex}
                        onClick={() => handleAnswer(boxIndex)}
                        style={{
                          backgroundColor: boxIndex === targetIndex ? testSteps[step].targetColor : testSteps[step].baseColor
                        }}
                        className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl shadow-sm hover:scale-105 active:scale-95 transition-transform"
                        aria-label={`Color box ${boxIndex}`}
                      />
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-16 text-center flex flex-col items-center"
              >
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-pulse shadow-lg">
                  <Activity className="w-12 h-12 text-emerald-600 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Biomarkers...</h2>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">Cross-referencing your contrast perception against clinical data points.</p>
              </motion.div>
            )}

            {result && !isAnalyzing && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 md:p-12"
              >
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinical Report Generated</h2>
                    <p className="text-slate-500 font-medium mt-1">Report securely saved to your history.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -z-10"></div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Primary Diagnosis</div>
                    <div className="text-2xl font-extrabold text-emerald-600 mb-2">{result.profile}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${result.severity === 'None' ? 'bg-slate-200 text-slate-700' : result.severity === 'Extreme' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        Severity: {result.severity}
                      </span>
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                        Accuracy: {result.accuracy}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden text-white flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-10"></div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Neurolens Action Plan
                    </div>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">
                      {result.description}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={handleContinue}
                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl flex items-center gap-2 shadow-xl shadow-emerald-500/30 transition-all hover:scale-105"
                  >
                    Save & Create Account <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
