import React, { useState } from 'react';
import type { Question } from '../types';
import { useVisionTest } from '../context/VisionTestContext';
import { motion } from 'framer-motion';

interface QuestionCardProps {
  question: Question;
  onNext: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onNext }) => {
  const { submitAnswer, retreatQuestion, currentQuestionIndex } = useVisionTest();
  const [startTime] = useState<number>(() => Date.now());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  return (
    <div className="w-full max-w-3xl mx-auto dashboard-card rounded-[32px] shadow-2xl p-6 md:p-10 border border-white/60 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div 
        className="absolute inset-0 opacity-10 blur-3xl rounded-[32px] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: question.stimulus_hex }}
      />
      
      <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-8 tracking-tight relative z-10">
        {question.prompt}
      </h2>

      {/* Stimulus Color Patch */}
      <div className="flex justify-center mb-12 relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-40 h-40 md:w-56 md:h-56 rounded-[32px] shadow-inner border-[6px] border-white/80 backdrop-blur-sm relative"
          style={{ backgroundColor: question.stimulus_hex }}
        >
          {/* Inner ring for depth */}
          <div className="absolute inset-0 rounded-[26px] shadow-[inset_0_4px_12px_rgba(0,0,0,0.1)]"></div>
        </motion.div>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10 relative z-10">
        {question.options.map((option, idx) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              handleOptionSelect(option.id);
              setTimeout(() => {
                const timeTaken = Date.now() - startTime;
                submitAnswer(question.id, option.id, timeTaken);
                onNext();
              }, 400);
            }}
            className={`
              flex items-center p-4 md:p-5 rounded-2xl border-2 transition-all duration-300
              ${selectedOption === option.id 
                ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 shadow-lg shadow-emerald-500/20' 
                : 'border-slate-200 bg-white/80 hover:border-emerald-400 hover:bg-white text-slate-800 shadow-sm'}
            `}
          >
            <div
              className="w-10 h-10 rounded-full shadow-inner mr-5 border-2 border-white/50"
              style={{ backgroundColor: option.hex }}
            />
            <span className="text-lg md:text-xl font-bold">{option.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-100 relative z-10">
        <button
          onClick={retreatQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-8 py-3 rounded-full font-bold transition-all ${
            currentQuestionIndex === 0
              ? 'border border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50'
              : 'premium-btn-secondary'
          }`}
        >
          <span>← Previous</span>
        </button>
      </div>
    </div>
  );
};
