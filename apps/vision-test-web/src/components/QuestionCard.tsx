import React, { useState } from 'react';
import type { Question } from '../types';
import { useVisionTest } from '../context/VisionTestContext';

interface QuestionCardProps {
  question: Question;
  onNext: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onNext }) => {
  const { submitAnswer, retreatQuestion, currentQuestionIndex } = useVisionTest();
  const [startTime] = useState<number>(Date.now());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
      <h2 className="text-2xl font-bold text-center text-slate-100 mb-6">
        {question.prompt}
      </h2>

      {/* Stimulus Color Patch */}
      <div className="flex justify-center mb-10">
        <div
          className="w-48 h-48 rounded-2xl shadow-inner border-4 border-slate-700"
          style={{ backgroundColor: question.stimulus_hex }}
        />
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              handleOptionSelect(option.id);
              // Auto-advance after 300ms for smooth UI transition
              setTimeout(() => {
                const timeTaken = Date.now() - startTime;
                submitAnswer(question.id, option.id, timeTaken);
                onNext();
              }, 300);
            }}
            className={`
              flex items-center p-4 rounded-xl border-2 transition-all duration-200
              ${selectedOption === option.id 
                ? 'border-blue-500 bg-blue-500/10 scale-95' 
                : 'border-slate-600 bg-slate-700 hover:border-slate-500 hover:bg-slate-600'}
            `}
          >
            <div
              className="w-8 h-8 rounded-full shadow-sm mr-4"
              style={{ backgroundColor: option.hex }}
            />
            <span className="text-lg font-medium text-slate-200">{option.label}</span>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700">
        <button
          onClick={retreatQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            currentQuestionIndex === 0
              ? 'text-slate-500 cursor-not-allowed bg-slate-800'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          Retreat
        </button>
      </div>
    </div>
  );
};
