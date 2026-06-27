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
    <div className="w-full max-w-2xl mx-auto glass-panel rounded-3xl shadow-xl p-8 border border-[#ccc3d8]">
      <h2 className="text-2xl font-bold text-center text-[#1b1b22] mb-6">
        {question.prompt}
      </h2>

      {/* Stimulus Color Patch */}
      <div className="flex justify-center mb-10">
        <div
          className="w-48 h-48 rounded-3xl shadow-inner border-4 border-[#ccc3d8]"
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
              flex items-center p-4 rounded-2xl border-2 transition-all duration-200
              ${selectedOption === option.id 
                ? 'border-[#8a4cfc] bg-[#eaddff] text-[#25005a] scale-95 shadow-md shadow-[#8a4cfc]/20' 
                : 'border-[#ccc3d8] bg-[#fcf8ff] hover:border-[#8a4cfc] hover:bg-[#f6f2fc] text-[#1b1b22]'}
            `}
          >
            <div
              className="w-8 h-8 rounded-full shadow-sm mr-4 border border-[#ccc3d8]"
              style={{ backgroundColor: option.hex }}
            />
            <span className="text-lg font-bold">{option.label}</span>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#ccc3d8]">
        <button
          onClick={retreatQuestion}
          disabled={currentQuestionIndex === 0}
          className={`premium-btn ${
            currentQuestionIndex === 0
              ? 'border border-[#dcd8e2] text-[#7b7487] cursor-not-allowed bg-[#f0ecf6]'
              : 'premium-btn-secondary'
          }`}
        >
          <span>Retreat</span>
        </button>
      </div>
    </div>
  );
};
