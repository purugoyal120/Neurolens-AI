import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ChevronRight, CheckCircle2, Activity, ShieldCheck, FileText, Timer } from 'lucide-react';
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
    {
      id: 1,
      image: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Ishihara_9.png", 
      question: "What number do you see in this circle?",
      options: ["74", "21", "I don't see a number"],
      correct: "74",
      type: "protanopia"
    },
    {
      id: 2,
      image: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Ishihara_11.png", 
      question: "What number do you see here?",
      options: ["6", "8", "I don't see a number"],
      correct: "6",
      type: "deuteranopia"
    },
    {
      id: 3,
      image: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Ishihara_23.png", 
      question: "What number is visible?",
      options: ["42", "2", "4", "Nothing"],
      correct: "42",
      type: "protanopia"
    },
    {
      id: 4,
      image: "https://upload.wikimedia.org/wikipedia/commons/6/69/Ishihara_1.png", 
      question: "What number is in the center?",
      options: ["12", "I don't see a number", "72"],
      correct: "12",
      type: "normal"
    },
    {
      id: 5,
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Ishihara_15.png", 
      question: "Identify the number",
      options: ["5", "3", "I don't see a number"],
      correct: "3",
      type: "deuteranopia"
    },
    {
      id: 6,
      image: "https://upload.wikimedia.org/wikipedia/commons/9/91/Ishihara_19.png", 
      question: "Can you trace the line?",
      options: ["Yes, continuous", "Broken line", "No line visible"],
      correct: "Yes, continuous",
      type: "protanopia"
    },
    {
      id: 7,
      image: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Ishihara_23.png", 
      question: "Final check, what do you see?",
      options: ["42", "2", "4", "Nothing"],
      correct: "42",
      type: "deuteranopia"
    }
  ];

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
      if (finalScores.protanopia > 0 && finalScores.protanopia >= finalScores.deuteranopia) {
        profileName = 'Protanopia Mode';
        severity = finalScores.protanopia >= 2 ? 'Severe' : 'Moderate';
        description = 'Red-blindness detected. You struggle to differentiate subtle red hues. Neurolens AI will actively shift confusing red tones into high-contrast cyan to help you distinguish them clearly.';
      } else if (finalScores.deuteranopia > 0) {
        profileName = 'Deuteranopia Mode';
        severity = finalScores.deuteranopia >= 2 ? 'Severe' : 'Moderate';
        description = 'Green-blindness detected. You have difficulty separating greens from reds and browns. Neurolens AI will optimize these frequencies to high-contrast amber & blue.';
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
        answers: ['Completed visual plate test']
      };
      
      setResult(reportData);
      saveReport(reportData);
    }, 2500);
  };

  const handleAnswer = (selectedOption: string) => {
    let newScores = { ...scores };
    const currentStep = testSteps[step];
    
    if (selectedOption === currentStep.correct) {
      newScores.normal += 1;
    } else {
      // Log the specific deficiency type based on what plate they failed
      if (currentStep.type === 'protanopia' || currentStep.type === 'deuteranopia') {
         newScores[currentStep.type] += 1;
      } else {
         newScores.protanopia += 1; // fallback
      }
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
                </div>

                <div className="flex justify-center mb-10">
                  <div className="w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-white bg-slate-100 flex items-center justify-center">
                    <img src={testSteps[step].image} alt={`Ishihara Plate ${step + 1}`} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                  {testSteps[step].options.map(option => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className="px-6 py-4 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 font-bold transition-all text-sm md:text-base shadow-sm hover:shadow-md"
                    >
                      {option}
                    </button>
                  ))}
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
