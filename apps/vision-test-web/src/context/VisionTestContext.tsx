import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { VisionTestConfig, UserAnswer, SubmitVisionTestOut } from '../types';
import { useAuth } from './AuthContext';

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
  const { setActiveReport, setActiveProfile, saveReport } = useAuth();
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
      console.warn("Backend unavailable. Using mock test data for demo.");
      // Fallback for Vercel demo
      const mockConfig: VisionTestConfig = {
        test_id: "mock_test_full",
        version: "1.2",
        time_limit_seconds: 60,
        questions: [
          {
            id: "q1", index: 0, axis: "red_green", difficulty: "basic",
            prompt: "Which color matches the displayed patch above?", stimulus_hex: "#E74C3C",
            options: [{ id: "q1_a", label: "Red", hex: "#E74C3C" }, { id: "q1_b", label: "Green", hex: "#2ECC40" }, { id: "q1_c", label: "Orange", hex: "#E67E22" }, { id: "q1_d", label: "Brown", hex: "#8B5E3C" }],
            correct_option_id: "q1_a"
          },
          {
            id: "q2", index: 1, axis: "red_green", difficulty: "basic",
            prompt: "Select the exact color category for this status indicator:", stimulus_hex: "#2ECC40",
            options: [{ id: "q2_a", label: "Red", hex: "#E74C3C" }, { id: "q2_b", label: "Green", hex: "#2ECC40" }, { id: "q2_c", label: "Yellow", hex: "#F1C40F" }, { id: "q2_d", label: "Gray", hex: "#95A5A6" }],
            correct_option_id: "q2_b"
          },
          {
            id: "q3", index: 2, axis: "red_green", difficulty: "basic",
            prompt: "How would you identify this deep shade?", stimulus_hex: "#8B5E3C",
            options: [{ id: "q3_a", label: "Brown", hex: "#8B5E3C" }, { id: "q3_b", label: "Red", hex: "#C0392B" }, { id: "q3_c", label: "Green", hex: "#27AE60" }, { id: "q3_d", label: "Purple", hex: "#8E44AD" }],
            correct_option_id: "q3_a"
          },
          {
            id: "q4", index: 3, axis: "blue_yellow", difficulty: "basic",
            prompt: "Choose the correct primary color tone:", stimulus_hex: "#3498DB",
            options: [{ id: "q4_a", label: "Yellow", hex: "#F1C40F" }, { id: "q4_b", label: "Blue", hex: "#3498DB" }, { id: "q4_c", label: "Purple", hex: "#8E44AD" }, { id: "q4_d", label: "Gray", hex: "#95A5A6" }],
            correct_option_id: "q4_b"
          },
          {
            id: "q5", index: 4, axis: "blue_yellow", difficulty: "basic",
            prompt: "Which hue best describes this bright patch?", stimulus_hex: "#F1C40F",
            options: [{ id: "q5_a", label: "Blue", hex: "#3498DB" }, { id: "q5_b", label: "Yellow", hex: "#F1C40F" }, { id: "q5_c", label: "Orange", hex: "#E67E22" }, { id: "q5_d", label: "White", hex: "#ECF0F1" }],
            correct_option_id: "q5_b"
          },
          {
            id: "q6", index: 5, axis: "blue_yellow", difficulty: "basic",
            prompt: "Identify this deep background color:", stimulus_hex: "#2980B9",
            options: [{ id: "q6_a", label: "Yellow", hex: "#F4D03F" }, { id: "q6_b", label: "Green", hex: "#27AE60" }, { id: "q6_c", label: "Blue", hex: "#2980B9" }, { id: "q6_d", label: "Purple", hex: "#8E44AD" }],
            correct_option_id: "q6_c"
          },
          {
            id: "q7", index: 6, axis: "mixed", difficulty: "intermediate",
            prompt: "This mixed shade sits between green and blue. What does it look like to you?", stimulus_hex: "#16A085",
            options: [{ id: "q7_a", label: "Blue", hex: "#2980B9" }, { id: "q7_b", label: "Teal/Green", hex: "#16A085" }, { id: "q7_c", label: "Purple", hex: "#8E44AD" }, { id: "q7_d", label: "Gray", hex: "#7F8C8D" }],
            correct_option_id: "q7_b"
          }
        ]
      };
      
      const activeState = {
        status: 'testing' as const,
        config: mockConfig,
        currentQuestionIndex: 0,
        answers: [],
        timeRemaining: 120,
      };
      setState((prev) => ({ ...prev, ...activeState }));
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

  function finishTest() {
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
          
          // SYNC WITH AUTH CONTEXT
          if (result && result.profile) {
            setActiveReport({
              deficiency_type: result.profile.deficiency_type || 'None',
              severity: result.profile.severity || 'Unknown',
              clinical_diagnosis: result.profile.clinical_diagnosis || 'Standard Mode',
              accuracy: result.profile.percent_accuracy || 0
            });
            setActiveProfile(result.profile.clinical_diagnosis || 'Standard Mode');
            saveReport({
              profile: result.profile.clinical_diagnosis || 'Standard Mode',
              severity: result.profile.severity || 'Unknown',
              accuracy: result.profile.percent_accuracy || 0,
              description: result.profile.ai_explanation || 'Detailed AI diagnosis generated.',
              rawProfile: result.profile
            });
          }
        } catch (err) {
          console.warn("Backend unavailable. Using mock test results.");
          const mockResult: SubmitVisionTestOut = {
            profile: {
              user_id: uid,
              deficiency_type: "deutan",
              deficiency_name: "Deuteranopia",
              clinical_diagnosis: "Deuteranopia (Green-Blindness)",
              severity: "moderate",
              color_confusion_status: "Green and Brown overlap heavily",
              percent_accuracy: 66,
              perception_scores: { red: 80, green: 40, blue: 95, yellow: 90 },
              ai_explanation: "Based on your test responses, we noticed you experience overlapping contrast with red, green, and earthy brown shades. Neurolens AI dynamically transforms these problematic colors into high-contrast alternatives.",
              meaning_based_transformations: [
                 {
                   target_type: "Problematic Green",
                   appended_label: "[Successful / On Track 📈]",
                   safe_hex: "#F39C12",
                   original_color_name: "🟢 Problematic Green (#2ECC40)",
                   transformed_color_hex: "#F39C12",
                   meaning_label: "Successful / On Track [Vibrant Amber + 📈]",
                   explanation: "Green easily blends with earthy browns in your vision profile. We shift it to Vibrant Amber and append explicit meaning."
                 }
              ],
              recommended_transformations: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            score_summary: {
              total_questions: 7,
              correct_answers: 3,
              error_rate: 0.57
            }
          };
          setState((s) => ({ ...s, status: 'completed', result: mockResult }));

          // SYNC WITH AUTH CONTEXT
          // We wrap these side effects in a short timeout to run them outside the synchronous setState cycle.
          // This prevents React Strict Mode from running these side effects twice.
          setTimeout(() => {
            setActiveReport({
              deficiency_type: mockResult.profile.deficiency_type || 'None',
              severity: mockResult.profile.severity || 'Unknown',
              clinical_diagnosis: mockResult.profile.clinical_diagnosis || 'Standard Mode',
              accuracy: mockResult.profile.percent_accuracy || 0
            });
            setActiveProfile(mockResult.profile.clinical_diagnosis || 'Standard Mode');
            saveReport({
              profile: mockResult.profile.clinical_diagnosis || 'Standard Mode',
              severity: mockResult.profile.severity || 'Unknown',
              accuracy: mockResult.profile.percent_accuracy || 0,
              description: mockResult.profile.ai_explanation || 'Based on your test responses, we noticed overlapping contrast. Neurolens AI dynamically transforms these problematic colors.',
              rawProfile: mockResult.profile
            });
          }, 0);
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
