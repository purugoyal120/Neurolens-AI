import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { visionTestApi } from '../api/visionTestApi'
import type {
  SubmitVisionTestResponse,
  UserAnswer,
  VisionTestConfig,
  VisionTestQuestion,
} from '../types/visionTest'

type Phase = 'loading' | 'in_progress' | 'submitting' | 'complete' | 'timed_out' | 'error'

interface VisionTestState {
  phase: Phase
  config: VisionTestConfig | null
  currentIndex: number
  currentQuestion: VisionTestQuestion | null
  answers: Map<string, UserAnswer> // question_id -> answer, so "Retreat" preserves prior choices
  secondsRemaining: number | null
  result: SubmitVisionTestResponse | null
  error: string | null
}

interface VisionTestActions {
  selectAnswer: (optionId: string) => void
  goNext: () => void
  goBack: () => void
  restart: () => void
  /** True once every question has a saved answer — gates the final submit. */
  canSubmitNow: boolean
  progressFraction: number // 0-1
}

const VisionTestContext = createContext<(VisionTestState & VisionTestActions) | null>(null)

export function VisionTestProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [config, setConfig] = useState<VisionTestConfig | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, UserAnswer>>(new Map())
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null)
  const [result, setResult] = useState<SubmitVisionTestResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const questionShownAt = useRef<number>(Date.now())
  const timerRef = useRef<number | null>(null)

  const load = useCallback(() => {
    setPhase('loading')
    setError(null)
    setCurrentIndex(0)
    setAnswers(new Map())
    setResult(null)
    visionTestApi
      .startTest()
      .then((cfg) => {
        setConfig(cfg)
        setSecondsRemaining(cfg.time_limit_seconds)
        questionShownAt.current = Date.now()
        setPhase('in_progress')
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not start the test.')
        setPhase('error')
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const submit = useCallback(
    (finalAnswers: Map<string, UserAnswer>) => {
      if (!config) return
      setPhase('submitting')
      visionTestApi
        .submitTest({
          user_id: userId,
          test_id: config.test_id,
          answers: Array.from(finalAnswers.values()),
        })
        .then((res) => {
          setResult(res)
          setPhase('complete')
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Could not submit your answers.')
          setPhase('error')
        })
    },
    [config, userId],
  )

  // 2-minute countdown. Auto-submits whatever was answered if time runs out,
  // rather than silently discarding the user's progress.
  useEffect(() => {
    if (phase !== 'in_progress' || secondsRemaining === null) return undefined

    timerRef.current = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null) return prev
        if (prev <= 1) {
          window.clearInterval(timerRef.current ?? undefined)
          setPhase('timed_out')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
    }
  }, [phase, secondsRemaining === null])

  // When the timer expires, submit whatever has been answered so far.
  useEffect(() => {
    if (phase === 'timed_out') {
      submit(answers)
    }
  }, [phase, answers, submit])

  const questions = config?.questions ?? []
  const currentQuestion = questions[currentIndex] ?? null

  const selectAnswer = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return
      const responseTimeMs = Date.now() - questionShownAt.current
      setAnswers((prev) => {
        const next = new Map(prev)
        next.set(currentQuestion.id, {
          question_id: currentQuestion.id,
          selected_option_id: optionId,
          response_time_ms: responseTimeMs,
        })
        return next
      })
    },
    [currentQuestion],
  )

  const goNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      submit(answers)
      return
    }
    setCurrentIndex((i) => i + 1)
    questionShownAt.current = Date.now()
  }, [answers, currentIndex, questions.length, submit])

  const goBack = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1))
    questionShownAt.current = Date.now()
  }, [])

  const canSubmitNow = questions.length > 0 && questions.every((q) => answers.has(q.id))
  const progressFraction = questions.length > 0 ? currentIndex / questions.length : 0

  const value = useMemo(
    () => ({
      phase,
      config,
      currentIndex,
      currentQuestion,
      answers,
      secondsRemaining,
      result,
      error,
      selectAnswer,
      goNext,
      goBack,
      restart: load,
      canSubmitNow,
      progressFraction,
    }),
    [
      phase,
      config,
      currentIndex,
      currentQuestion,
      answers,
      secondsRemaining,
      result,
      error,
      selectAnswer,
      goNext,
      goBack,
      load,
      canSubmitNow,
      progressFraction,
    ],
  )

  return <VisionTestContext.Provider value={value}>{children}</VisionTestContext.Provider>
}

export function useVisionTestContext() {
  const ctx = useContext(VisionTestContext)
  if (!ctx) {
    throw new Error('useVisionTestContext must be used within a VisionTestProvider')
  }
  return ctx
}
