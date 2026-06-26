import { VisionTestProvider, useVisionTestContext } from '../../context/VisionTestContext'
import { ProgressBar } from './ProgressBar'
import { QuestionCard } from './QuestionCard'
import { ResultScreen } from './ResultScreen'
import { TimerDisplay } from './TimerDisplay'

interface TestInterfaceProps {
  userId: string
  /** Show the 2-minute countdown timer. Defaults on, can be turned off per spec ("optional"). */
  showTimer?: boolean
}

export function TestInterface({ userId, showTimer = true }: TestInterfaceProps) {
  return (
    <VisionTestProvider userId={userId}>
      <TestInterfaceBody showTimer={showTimer} />
    </VisionTestProvider>
  )
}

function TestInterfaceBody({ showTimer }: { showTimer: boolean }) {
  const {
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
    restart,
  } = useVisionTestContext()

  const totalQuestions = config?.questions.length ?? 0
  const isFirstQuestion = currentIndex === 0
  const isLastQuestion = currentIndex === totalQuestions - 1
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : undefined

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 20px',
        fontFamily: 'Inter, Roboto, system-ui, sans-serif',
        background: '#f7f4ee',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: 28 }}>
        <p
          style={{
            fontSize: 12,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: '#4c4ddc',
            margin: 0,
            fontWeight: 700,
          }}
        >
          NeuroLens AI
        </p>
        <h1 style={{ fontSize: 28, margin: '6px 0 0', color: '#15191e' }}>Vision Profile Test</h1>
      </header>

      <div
        style={{
          width: '100%',
          maxWidth: 600,
          background: 'white',
          borderRadius: 18,
          boxShadow: '0 1px 2px rgba(21,25,30,0.06), 0 8px 24px rgba(21,25,30,0.08)',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          minHeight: 460,
        }}
      >
        {phase === 'loading' && <CenteredMessage text="Preparing your test…" />}

        {phase === 'error' && (
          <CenteredMessage text={error ?? 'Something went wrong.'} isError onRetry={restart} />
        )}

        {(phase === 'in_progress' || phase === 'submitting') && currentQuestion && config && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <ProgressBar current={currentIndex} total={totalQuestions} />
              </div>
              {showTimer && <TimerDisplay secondsRemaining={secondsRemaining} />}
            </div>

            <QuestionCard question={currentQuestion} selectedAnswer={currentAnswer} onSelect={selectAnswer} />

            <nav
              aria-label="Test navigation"
              style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}
            >
              <button
                type="button"
                onClick={goBack}
                disabled={isFirstQuestion || phase === 'submitting'}
                style={navButtonStyle('secondary', isFirstQuestion)}
              >
                Retreat
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!currentAnswer || phase === 'submitting'}
                style={navButtonStyle('primary', !currentAnswer)}
              >
                {phase === 'submitting'
                  ? 'Submitting…'
                  : isLastQuestion
                    ? 'Finish'
                    : 'Next'}
              </button>
            </nav>
          </>
        )}

        {phase === 'complete' && result && <ResultScreen result={result} onRestart={restart} />}
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: '#5b6470' }}>
        Takes about 2 minutes · {totalQuestions || 10} quick questions
      </p>
    </div>
  )
}

function navButtonStyle(variant: 'primary' | 'secondary', disabled: boolean): React.CSSProperties {
  if (variant === 'primary') {
    return {
      padding: '12px 28px',
      borderRadius: 10,
      border: '1.5px solid #4c4ddc',
      background: disabled ? '#b9baf1' : '#4c4ddc',
      borderColor: disabled ? '#b9baf1' : '#4c4ddc',
      color: 'white',
      fontSize: 15,
      fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }
  }
  return {
    padding: '12px 28px',
    borderRadius: 10,
    border: '1.5px solid #d8d2c2',
    background: 'white',
    color: disabled ? '#b8bcc4' : '#15191e',
    fontSize: 15,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
}

function CenteredMessage({
  text,
  isError = false,
  onRetry,
}: {
  text: string
  isError?: boolean
  onRetry?: () => void
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        textAlign: 'center',
      }}
      role={isError ? 'alert' : 'status'}
    >
      <p style={{ fontSize: 15, color: isError ? '#7a2222' : '#5b6470', margin: 0 }}>{text}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: '1.5px solid #4c4ddc',
            background: '#4c4ddc',
            color: 'white',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      )}
    </div>
  )
}
