import React from 'react';
import { useVisionTest } from '../context/VisionTestContext';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';
import { ResultScreen } from './ResultScreen';
import { motion, AnimatePresence } from 'framer-motion';

export const TestInterface: React.FC = () => {
  const { status, config, currentQuestionIndex, error, timeRemaining, startTest, finishTest } = useVisionTest();

  if (status === 'idle') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto dashboard-card rounded-[32px] p-6 md:p-12 text-center relative overflow-hidden shadow-2xl"
      >
        {/* Glow behind the icon */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-400/20 blur-[80px] rounded-full -z-10 animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-400/10 blur-[60px] rounded-full -z-10 pointer-events-none"></div>
        
        <div className="mb-10 relative z-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-28 h-28 bg-blue-500 shadow-2xl shadow-blue-500/40 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-400"
          >
            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </motion.div>
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            Neurolens AI Diagnostic
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed px-4">
            A highly calibrated 2-minute test to map your unique colour perception matrix. 
            This unlocks personalized UI adaptations across all your digital interfaces.
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => startTest()}
          className="premium-btn text-lg px-12 py-5 shadow-2xl shadow-slate-900/30"
        >
          <span className="font-extrabold tracking-wide">Initialize Test Sequence</span>
        </motion.button>
      </motion.div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col justify-center items-center h-80 dashboard-card rounded-[32px] p-12 max-w-md mx-auto shadow-2xl">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 rounded-full animate-pulse"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 relative z-10"></div>
        </div>
        <div className="text-slate-800 text-xl font-extrabold tracking-wide">Calibrating Engine...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full max-w-lg mx-auto bg-[#ffdad6] border border-[#ba1a1a]/40 rounded-[32px] p-10 text-center shadow-2xl">
        <h2 className="text-2xl font-bold text-[#93000a] mb-3">Diagnostic Interrupted</h2>
        <p className="text-[#93000a]/80 mb-8 font-medium">{error}</p>
        <button
          onClick={() => startTest()}
          className="premium-btn bg-[#ba1a1a] text-white hover:bg-[#93000a] shadow-lg shadow-[#ba1a1a]/30 px-10 py-4"
        >
          Restart Diagnostic
        </button>
      </div>
    );
  }

  if (status === 'completed') {
    return <ResultScreen />;
  }

  if (status === 'submitting') {
    return (
      <div className="flex flex-col justify-center items-center h-80 dashboard-card rounded-[32px] p-12 max-w-md mx-auto shadow-2xl">
        <div className="animate-pulse flex space-x-4 mb-8">
          <div className="w-5 h-5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
          <div className="w-5 h-5 bg-indigo-500 rounded-full animate-bounce shadow-lg shadow-indigo-500/50"></div>
          <div className="w-5 h-5 bg-blue-300 rounded-full shadow-lg shadow-blue-300/50"></div>
        </div>
        <div className="text-slate-800 font-extrabold text-xl text-center leading-tight">
          Processing neural map<br/>via OpenAI...
        </div>
      </div>
    );
  }

  // Testing status
  if (!config) return null;

  const currentQuestion = config.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === config.questions.length - 1;

  if (!currentQuestion) {
    if (currentQuestionIndex >= config.questions.length && status === 'testing') {
      setTimeout(() => finishTest(), 0);
    }
    return null;
  }

  return (
    <div className="w-full">
      <ProgressBar 
        current={currentQuestionIndex} 
        total={config.questions.length} 
        timeRemaining={timeRemaining} 
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <QuestionCard 
            question={currentQuestion} 
            onNext={() => {
              if (isLastQuestion) {
                finishTest();
              }
            }} 
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
