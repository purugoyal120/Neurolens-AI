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
        <div className="text-sm font-medium text-slate-300">
          Question {current + 1} of {total}
        </div>
        <div className={`text-sm font-bold ${isLowTime ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
          ⏱ {formatTime(timeRemaining)}
        </div>
      </div>
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
