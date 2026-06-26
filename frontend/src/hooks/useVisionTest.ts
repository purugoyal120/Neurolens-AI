import { useCallback, useEffect, useRef, useState } from 'react'
import { visionApi } from '../api/visionApi'
import type { ProfileSummaryOut, TestBatteryOut, TrialOut, TrialResponseIn } from '../types/vision'

type TestPhase = 'loading' | 'running' | 'submitting' | 'done' | 'error'

interface UseVisionTestResult {
  phase: TestPhase
  trials: TrialOut[]
  currentIndex: number
  currentTrial: TrialOut | null
  progress: number // 0-1
  responses: TrialResponseIn[]
  result: ProfileSummaryOut | null
  error: string | null
  answer: (trialId: string, value: string) => void
  retake: () => void
}

export function useVisionTest(userId: string): UseVisionTestResult {
  const [phase, setPhase] = useState<TestPhase>('loading')
  const [battery, setBattery] = useState<TestBatteryOut | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<TrialResponseIn[]>([])
  const [result, setResult] = useState<ProfileSummaryOut | null>(null)
  const [error, setError] = useState<string | null>(null)
  const trialStartedAt = useRef<number>(Date.now())

  const load = useCallback(() => {
    setPhase('loading')
    setError(null)
    setCurrentIndex(0)
    setResponses([])
    setResult(null)
    visionApi
      .getTestBattery()
      .then((data) => {
        setBattery(data)
        trialStartedAt.current = Date.now()
        setPhase('running')
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not load the test.')
        setPhase('error')
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const trials = battery?.trials ?? []
  const currentTrial = trials[currentIndex] ?? null

  const submitAll = useCallback(
    (finalResponses: TrialResponseIn[]) => {
      if (!battery) return
      setPhase('submitting')
      visionApi
        .submitTestResults({
          user_id: userId,
          test_version: battery.test_version,
          responses: finalResponses,
        })
        .then((summary) => {
          setResult(summary)
          setPhase('done')
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Could not submit your results.')
          setPhase('error')
        })
    },
    [battery, userId],
  )

  const answer = useCallback(
    (trialId: string, value: string) => {
      if (!currentTrial || currentTrial.id !== trialId) return
      const responseTimeMs = Date.now() - trialStartedAt.current
      const next: TrialResponseIn = { trial_id: trialId, answer: value, response_time_ms: responseTimeMs }
      const updated = [...responses, next]
      setResponses(updated)

      if (currentIndex + 1 >= trials.length) {
        submitAll(updated)
      } else {
        setCurrentIndex((i) => i + 1)
        trialStartedAt.current = Date.now()
      }
    },
    [currentIndex, currentTrial, responses, submitAll, trials.length],
  )

  const progress = trials.length > 0 ? currentIndex / trials.length : 0

  return {
    phase,
    trials,
    currentIndex,
    currentTrial,
    progress,
    responses,
    result,
    error,
    answer,
    retake: load,
  }
}
