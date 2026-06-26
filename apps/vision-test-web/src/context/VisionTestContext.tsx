import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { VisionTestConfig, UserAnswer, SubmitVisionTestOut } from '../types';

interface VisionTestState {
  status: 'idle' | 'loading' | 'testing' | 'submitting' | 'completed' | 'error';
  config: VisionTestConfig | null;
  currentQuestionIndex: number;
  answers: UserAnswer[];
  result: SubmitVisionTestOut | null;
  error: string | null;
  timeRemaining: number;
  userId: string;
}

interface VisionTestContextType extends VisionTestState {
  startTest: (userId?: string) => Promise<void>;
  submitAnswer: (questionId: string, optionId: string, timeTakenMs: number) => void;
  retreatQuestion: () => void;
  finishTest: () => Promise<void>;
}

const VisionTestContext = createContext<VisionTestContextType | undefined>(undefined);

export const useVisionTest = () => {
  const context = useContext(VisionTestContext);
  if (!context) {
    throw new Error('useVisionTest must be used within a VisionTestProvider');
  }
  return context;
};

// Default backend URL, configurable via env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const VisionTestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<VisionTestState>({
    status: 'idle',
    config: null,
    currentQuestionIndex: 0,
    answers: [],
    result: null,
    error: null,
    timeRemaining: 120, // 2 minutes default
    userId: "hackathon_demo_user", // Fixed user ID for hackathon cross-platform sync
  });

  // Timer logic
  useEffect(() => {
    let timer: number;
    if (state.status === 'testing' && state.timeRemaining > 0) {
      timer = window.setInterval(() => {
        setState((prev) => {
          if (prev.timeRemaining <= 1) {
            clearInterval(timer);
            // Auto finish when timer runs out
            setTimeout(() => finishTest(), 0);
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state.status, state.timeRemaining]);

  const startTest = async (userId?: string) => {
    setState((prev) => ({ ...prev, status: 'loading', error: null, userId: userId || prev.userId }));
    try {
      const response = await fetch(`${API_URL}/vision-test/start`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to start test');
      const config: VisionTestConfig = await response.json();
      
      setState((prev) => ({
        ...prev,
        status: 'testing',
        config,
        currentQuestionIndex: 0,
        answers: [],
        timeRemaining: config.time_limit_seconds || 120,
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, status: 'error', error: err instanceof Error ? err.message : 'Unknown error' }));
    }
  };

  const submitAnswer = (questionId: string, optionId: string, timeTakenMs: number) => {
    setState((prev) => {
      const newAnswers = [...prev.answers];
      // Update if already answered this question
      const existingIdx = newAnswers.findIndex((a) => a.question_id === questionId);
      if (existingIdx >= 0) {
        newAnswers[existingIdx] = { question_id: questionId, selected_option_id: optionId, response_time_ms: timeTakenMs };
      } else {
        newAnswers.push({ question_id: questionId, selected_option_id: optionId, response_time_ms: timeTakenMs });
      }

      const nextIndex = prev.currentQuestionIndex + 1;
      return {
        ...prev,
        answers: newAnswers,
        currentQuestionIndex: nextIndex,
      };
    });
  };

  const retreatQuestion = () => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1),
    }));
  };

  const finishTest = async () => {
    // Current state might be stale in a callback, use functional update for safety but we need the latest state
    setState((prev) => {
      if (prev.status === 'submitting') return prev; // prevent double submit
      
      // We must run async task, so we set status first
      const submitData = async (answersToSubmit: UserAnswer[], testId: string, uid: string) => {
        try {
          const response = await fetch(`${API_URL}/vision-test/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: uid,
              test_id: testId,
              answers: answersToSubmit,
            }),
          });
          
          if (!response.ok) throw new Error('Failed to submit test results');
          const result: SubmitVisionTestOut = await response.json();
          
          setState((s) => ({ ...s, status: 'completed', result }));
        } catch (err) {
          setState((s) => ({ ...s, status: 'error', error: err instanceof Error ? err.message : 'Submit failed' }));
        }
      };

      if (prev.config) {
        submitData(prev.answers, prev.config.test_id, prev.userId);
      }
      return { ...prev, status: 'submitting' };
    });
  };

  return (
    <VisionTestContext.Provider
      value={{
        ...state,
        startTest,
        submitAnswer,
        retreatQuestion,
        finishTest,
      }}
    >
      {children}
    </VisionTestContext.Provider>
  );
};
