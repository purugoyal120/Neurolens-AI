import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  timeRemaining: number;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, timeRemaining }) => {
  const percentage = Math.max(0, Math.min(100, (current / total) * 100));
  const isLowTime = timeRemaining < 30;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex justify-between items-end mb-2">
        <div className="text-sm font-bold text-[#4a4455]">
          Question {current + 1} of {total}
        </div>
        <div className={`text-sm font-bold ${isLowTime ? 'text-[#ba1a1a] animate-pulse' : 'text-[#4a4455]'}`}>
          ⏱ {formatTime(timeRemaining)}
        </div>
      </div>
      <div className="h-3 w-full bg-[#eae6f0] rounded-full overflow-hidden border border-[#ccc3d8]">
        <div
          className="h-full bg-[#8a4cfc] rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
