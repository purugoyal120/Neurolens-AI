// Types for the Vision Profile Test Module (simple 10-question version).
// These mirror backend/app/schemas/vision_test.py field-for-field — keep
// them in sync manually (see docs/roadmap.md for a future codegen step).

/** The four broad categories every question tests perception of. */
export type ColorCategory = 'red' | 'green' | 'blue' | 'yellow' | 'orange' | 'purple' | 'brown' | 'gray'

export type QuestionDifficulty = 'basic' | 'intermediate' | 'real_world'

export type QuestionAxis = 'red_green' | 'blue_yellow' | 'mixed' | 'real_world'

/** One answer option shown as a button (color name + swatch). */
export interface AnswerOption {
  id: string
  label: string
  hex: string
}

/** One question in the 10-question battery. */
export interface VisionTestQuestion {
  id: string
  index: number // 1-10, display order
  axis: QuestionAxis
  difficulty: QuestionDifficulty
  prompt: string
  /** The color patch shown to the user. */
  stimulus_hex: string
  /** 4-5 answer choices, in display order. Exactly one is correct. */
  options: AnswerOption[]
  /** Which option.id is correct — sent to the client so scoring CAN happen
   *  client-side for instant per-question feedback if desired, but the
   *  authoritative vision-profile scoring always happens server-side in
   *  /api/vision-test/submit. Never trust only the client's own scoring. */
  correct_option_id: string
}

export interface VisionTestConfig {
  test_id: string
  version: string
  time_limit_seconds: number // 120 = 2 minutes
  questions: VisionTestQuestion[]
}

/** One submitted answer for one question. */
export interface UserAnswer {
  question_id: string
  selected_option_id: string
  response_time_ms: number
}

export interface SubmitVisionTestRequest {
  user_id: string
  test_id: string
  answers: UserAnswer[]
}

export type DeficiencyType = 'red-green' | 'blue-yellow' | 'none' | 'unknown'
export type Severity = 'none' | 'mild' | 'moderate' | 'severe'

export interface PerceptionScores {
  red: number
  green: number
  blue: number
  yellow: number
}

export interface ColorTransformation {
  from: string
  to: string
  reason: string
}

/** The Vision Map — exact shape requested in the spec. */
export interface VisionProfile {
  user_id: string
  deficiency_type: DeficiencyType
  severity: Severity
  perception_scores: PerceptionScores
  recommended_transformations: ColorTransformation[]
  created_at: string
  updated_at: string
}

export interface SubmitVisionTestResponse {
  profile: VisionProfile
  score_summary: {
    total_questions: number
    correct_count: number
    accuracy: number
  }
}
