// Mirrors backend/app/schemas/test.py and profile.py.
// Keep these in sync manually for now (see docs/roadmap.md for codegen plan).

export type TrialType = 'discrimination' | 'identification' | 'control' | 'calibration'

export interface StimulusOut {
  id: string
  hex: string
}

export interface TrialOut {
  id: string
  type: TrialType
  stimuli: StimulusOut[]
  options: string[]
  prompt: string
}

export interface TestBatteryOut {
  test_version: string
  trials: TrialOut[]
}

export interface TrialResponseIn {
  trial_id: string
  answer: string
  response_time_ms: number
}

export interface SubmitTestIn {
  user_id: string
  responses: TrialResponseIn[]
  test_version: string
}

export type CvdType = 'protan' | 'deutan' | 'tritan' | 'none' | 'unknown'

export type RecommendedStrategy =
  | 'shift_hue'
  | 'increase_saturation'
  | 'icon_replacement'
  | 'combined'
  | 'none'

export interface VisionMapOut {
  user_id: string
  cvd_type: CvdType
  severity: number
  confidence: number
  confusion_axis: { hue_a_deg: number; hue_b_deg: number }
  per_hue_discrimination: Record<string, number>
  recommended_strategy: RecommendedStrategy
  test_version: string
  created_at: string
}

export interface ProfileSummaryOut {
  headline: string
  description: string
  severity_label: string
  vision_map: VisionMapOut
}
