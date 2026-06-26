import React from 'react';
import { useVisionTest } from '../context/VisionTestContext';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';
import { ResultScreen } from './ResultScreen';

export const TestInterface: React.FC = () => {
  const { status, config, currentQuestionIndex, error, timeRemaining, startTest, finishTest } = useVisionTest();

  if (status === 'idle') {
    return (
      <div className="w-full max-w-2xl mx-auto glass-panel rounded-3xl p-10 text-center animate-float relative overflow-hidden">
        {/* Glow behind the icon */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full -z-10"></div>
        
        <div className="mb-8 relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_40px_rgba(59,130,246,0.5)] text-white rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-6 tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
            NeuroLens Vision
          </h1>
          <p className="text-xl text-slate-300 font-light leading-relaxed px-4">
            A quick 2-minute test to map your unique color perception profile.
            This empowers NeuroLens to dynamically adapt digital interfaces specifically for <span className="font-semibold text-white">you</span>.
          </p>
        </div>
        
        <button
          onClick={() => startTest()}
          className="relative group px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xl font-bold transition-all duration-300 shadow-[0_10px_40px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_50px_rgba(79,70,229,0.6)] hover:-translate-y-2 overflow-hidden"
        >
          <span className="relative z-10">Start Diagnostic Test</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
        </button>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col justify-center items-center h-64 glass-panel rounded-3xl p-12 max-w-md mx-auto">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 rounded-full animate-pulse-slow"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white relative z-10"></div>
        </div>
        <div className="text-white text-xl font-medium tracking-wide">Initializing Neural Engine...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full max-w-lg mx-auto bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
        <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
        <p className="text-slate-300 mb-6">{error}</p>
        <button
          onClick={() => startTest()}
          className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors border border-red-500/50"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (status === 'completed') {
    return <ResultScreen />;
  }

  if (status === 'submitting') {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-pulse flex space-x-2 mb-6">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
        </div>
        <div className="text-slate-300 font-medium text-lg">Analyzing your vision profile with OpenAI...</div>
      </div>
    );
  }

  // Testing status
  if (!config) return null;

  const currentQuestion = config.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === config.questions.length - 1;

  if (!currentQuestion) {
    // Failsafe: If we are past the last question but status isn't submitting/completed
    if (currentQuestionIndex >= config.questions.length && status === 'testing') {
      setTimeout(() => finishTest(), 0);
    }
    return null;
  }

  return (
    <div className="w-full animate-in fade-in duration-300">
      <ProgressBar 
        current={currentQuestionIndex} 
        total={config.questions.length} 
        timeRemaining={timeRemaining} 
      />
      <QuestionCard 
        key={currentQuestion.id} 
        question={currentQuestion} 
        onNext={() => {
          if (isLastQuestion) {
            finishTest();
          }
        }} 
      />
    </div>
  );
};
