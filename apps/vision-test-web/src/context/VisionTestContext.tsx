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
  resetTest: () => Promise<void>;
}

const VisionTestContext = createContext<VisionTestContextType | undefined>(undefined);

export const useVisionTest = () => {
  const context = useContext(VisionTestContext);
  if (!context) {
    throw new Error('useVisionTest must be used within a VisionTestProvider');
  }
  return context;
};

const getApiBase = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port.startsWith('517')) {
    return `http://${window.location.hostname}:8000/api`;
  }
  return `${window.location.origin}/api`;
};
const API_URL = import.meta.env.VITE_API_URL || getApiBase();

export const VisionTestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<VisionTestState>({
    status: 'idle',
    config: null,
    currentQuestionIndex: 0,
    answers: [],
    result: null,
    error: null,
    timeRemaining: 120,
    userId: "hackathon_demo_user",
  });

  // Timer logic
  useEffect(() => {
    let timer: number;
    if (state.status === 'testing' && state.timeRemaining > 0) {
      timer = window.setInterval(() => {
        setState((prev) => {
          if (prev.timeRemaining <= 1) {
            clearInterval(timer);
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
    const nextState = { status: 'loading' as const, error: null, userId: userId || state.userId };
    setState((prev) => ({ ...prev, ...nextState }));

    try {
      const response = await fetch(`${API_URL}/vision-test/start`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to start test');
      const config: VisionTestConfig = await response.json();
      
      const activeState = {
        status: 'testing' as const,
        config,
        currentQuestionIndex: 0,
        answers: [],
        timeRemaining: config.time_limit_seconds || 120,
      };
      setState((prev) => ({ ...prev, ...activeState }));
    } catch (err) {
      const errState = { status: 'error' as const, error: err instanceof Error ? err.message : 'Unknown error' };
      setState((prev) => ({ ...prev, ...errState }));
    }
  };

  const submitAnswer = (questionId: string, optionId: string, timeTakenMs: number) => {
    setState((prev) => {
      if (!prev.config || prev.status === 'submitting') return prev;

      const newAnswers = [...prev.answers];
      const existingIdx = newAnswers.findIndex((a) => a.question_id === questionId);
      if (existingIdx >= 0) {
        newAnswers[existingIdx] = { question_id: questionId, selected_option_id: optionId, response_time_ms: timeTakenMs };
      } else {
        newAnswers.push({ question_id: questionId, selected_option_id: optionId, response_time_ms: timeTakenMs });
      }

      const nextIndex = prev.currentQuestionIndex + 1;

      if (nextIndex >= prev.config.questions.length) {
        const submitData = async (answersToSubmit: UserAnswer[], testId: string, uid: string) => {
          try {
            const response = await fetch(`${API_URL}/vision-test/submit`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: uid, test_id: testId, answers: answersToSubmit }),
            });
            if (!response.ok) throw new Error('Failed to submit test results');
            const result: SubmitVisionTestOut = await response.json();
            setState((s) => ({ ...s, status: 'completed', result }));
          } catch (err) {
            setState((s) => ({ ...s, status: 'error', error: err instanceof Error ? err.message : 'Submit failed' }));
          }
        };

        submitData(newAnswers, prev.config.test_id, prev.userId);
        return {
          ...prev,
          answers: newAnswers,
          currentQuestionIndex: nextIndex,
          status: 'submitting',
        };
      }

      return {
        ...prev,
        answers: newAnswers,
        currentQuestionIndex: nextIndex,
      };
    });
  };

  const retreatQuestion = () => {
    setState((prev) => {
      const nextIndex = Math.max(0, prev.currentQuestionIndex - 1);
      return { ...prev, currentQuestionIndex: nextIndex };
    });
  };

  const finishTest = async () => {
    setState((prev) => {
      if (!prev.config || prev.status === 'submitting' || prev.status === 'completed') return prev;
      
      const submitData = async (answersToSubmit: UserAnswer[], testId: string, uid: string) => {
        try {
          const response = await fetch(`${API_URL}/vision-test/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: uid, test_id: testId, answers: answersToSubmit }),
          });
          if (!response.ok) throw new Error('Failed to submit test results');
          const result: SubmitVisionTestOut = await response.json();
          setState((s) => ({ ...s, status: 'completed', result }));
        } catch (err) {
          setState((s) => ({ ...s, status: 'error', error: err instanceof Error ? err.message : 'Submit failed' }));
        }
      };

      submitData(prev.answers, prev.config.test_id, prev.userId);
      return { ...prev, status: 'submitting' };
    });
  };

  const resetTest = async () => {
    const idleState = {
      status: 'idle' as const,
      config: null,
      currentQuestionIndex: 0,
      answers: [],
      result: null,
      error: null,
      timeRemaining: 120,
    };
    setState((prev) => ({ ...prev, ...idleState }));
  };

  return (
    <VisionTestContext.Provider
      value={{
        ...state,
        startTest,
        submitAnswer,
        retreatQuestion,
        finishTest,
        resetTest,
      } as any}
    >
      {children}
    </VisionTestContext.Provider>
  );
};
