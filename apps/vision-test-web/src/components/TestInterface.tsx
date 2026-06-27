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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#8a4cfc]/10 blur-3xl rounded-full -z-10"></div>
        
        <div className="mb-8 relative z-10">
          <div className="w-24 h-24 bg-[#8a4cfc] shadow-lg shadow-[#8a4cfc]/30 text-white rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold text-gradient-primary mb-6 tracking-tight">
            NeuroLens Vision
          </h1>
          <p className="text-xl text-[#4a4455] font-normal leading-relaxed px-4">
            A quick 2-minute test to map your unique color perception profile.
            This empowers NeuroLens to dynamically adapt digital interfaces specifically for <span className="font-bold text-[#1b1b22]">you</span>.
          </p>
        </div>
        
        <button
          onClick={() => startTest()}
          className="premium-btn premium-btn-primary text-lg px-12 py-5 shadow-xl shadow-[#8a4cfc]/30 hover:shadow-[#8a4cfc]/50 hover:-translate-y-1"
        >
          <span>Start Diagnostic Test</span>
        </button>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col justify-center items-center h-64 glass-panel rounded-3xl p-12 max-w-md mx-auto">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#8a4cfc] blur-xl opacity-30 rounded-full animate-pulse"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8a4cfc] relative z-10"></div>
        </div>
        <div className="text-[#1b1b22] text-xl font-bold tracking-wide">Initializing Neural Engine...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full max-w-lg mx-auto bg-[#ffdad6] border border-[#ba1a1a]/40 rounded-2xl p-8 text-center shadow-xl">
        <h2 className="text-2xl font-bold text-[#93000a] mb-3">Something went wrong</h2>
        <p className="text-[#93000a]/80 mb-8 font-medium">{error}</p>
        <button
          onClick={() => startTest()}
          className="premium-btn bg-[#ba1a1a] text-white hover:bg-[#93000a] shadow-lg shadow-[#ba1a1a]/30"
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
      <div className="flex flex-col justify-center items-center h-64 glass-panel rounded-3xl p-12 max-w-md mx-auto">
        <div className="animate-pulse flex space-x-3 mb-6">
          <div className="w-4 h-4 bg-[#8a4cfc] rounded-full"></div>
          <div className="w-4 h-4 bg-[#8468bb] rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-[#a15100] rounded-full"></div>
        </div>
        <div className="text-[#1b1b22] font-bold text-lg">Analyzing your vision profile with OpenAI...</div>
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
