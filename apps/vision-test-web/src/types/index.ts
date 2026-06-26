export interface AnswerOption {
  id: string;
  label: string;
  hex: string;
}

export interface Question {
  id: string;
  index: number;
  axis: string;
  difficulty: string;
  prompt: string;
  stimulus_hex: string;
  options: AnswerOption[];
  correct_option_id: string;
}

export interface VisionTestConfig {
  test_id: string;
  version: string;
  time_limit_seconds: number;
  questions: Question[];
}

export interface UserAnswer {
  question_id: string;
  selected_option_id: string;
  response_time_ms: number;
}

export interface SubmitVisionTestIn {
  user_id: string;
  test_id: string;
  answers: UserAnswer[];
}

export interface PerceptionScores {
  red: number;
  green: number;
  blue: number;
  yellow: number;
}

export interface RecommendedTransformation {
  from: string;
  to: string;
  reason: string;
}

export interface VisionProfile {
  user_id: string;
  deficiency_type: string;
  severity: string;
  perception_scores: {
    red: number;
    green: number;
    blue: number;
    yellow: number;
  };
  recommended_transformations: Array<{
    from: string;
    to: string;
    reason: string;
  }>;
  ai_explanation?: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreSummary {
  total_questions: number;
  correct_answers: number;
  error_rate: number;
}

export interface SubmitVisionTestOut {
  profile: VisionProfile;
  score_summary: ScoreSummary;
}
