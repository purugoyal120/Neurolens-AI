import { useVisionTest } from '../../hooks/useVisionTest'
import { ProgressTrack } from './ProgressTrack'
import { ResultsScreen } from './ResultsScreen'
import { TrialCard } from './TrialCard'

interface VisionTestProps {
  userId: string
}

export function VisionTest({ userId }: VisionTestProps) {
  const { phase, trials, currentIndex, currentTrial, result, error, answer, retake } = useVisionTest(userId)

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 20px',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: 36 }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: 'var(--accent)',
            margin: 0,
          }}
        >
          NeuroLens AI
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, margin: '6px 0 0' }}>
          Your Vision Profile
        </h1>
      </header>

      <div
        style={{
          width: '100%',
          maxWidth: 560,
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: 420,
          justifyContent: 'center',
        }}
      >
        {phase === 'loading' && <StatusMessage text="Preparing your test…" />}

        {phase === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <StatusMessage text={error ?? 'Something went wrong.'} isError />
            <button onClick={retake} style={retryButtonStyle}>
              Try again
            </button>
          </div>
        )}

        {phase === 'running' && currentTrial && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 36 }}>
            <ProgressTrack total={trials.length} currentIndex={currentIndex} />
            <TrialCard trial={currentTrial} onAnswer={answer} />
          </div>
        )}

        {phase === 'submitting' && <StatusMessage text="Building your vision map…" />}

        {phase === 'done' && result && <ResultsScreen result={result} onRetake={retake} />}
      </div>

      <p style={{ marginTop: 24, fontSize: 13, color: 'var(--ink-soft)' }}>
        Takes about 2 minutes · 12 quick questions
      </p>
    </div>
  )
}

function StatusMessage({ text, isError = false }: { text: string; isError?: boolean }) {
  return (
    <p
      style={{
        fontSize: 15,
        color: isError ? 'var(--critical-ink)' : 'var(--ink-soft)',
        textAlign: 'center',
      }}
    >
      {text}
    </p>
  )
}

const retryButtonStyle: React.CSSProperties = {
  marginTop: 16,
  padding: '10px 20px',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--accent)',
  background: 'var(--accent)',
  color: 'white',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
}
