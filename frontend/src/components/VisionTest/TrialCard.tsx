import type { TrialOut } from '../../types/vision'

interface TrialCardProps {
  trial: TrialOut
  onAnswer: (trialId: string, value: string) => void
}

const SWATCH_SIZE = 140

export function TrialCard({ trial, onAnswer }: TrialCardProps) {
  if (trial.type === 'identification') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--ink-soft)', margin: 0 }}>
          {trial.prompt}
        </p>
        <div
          style={{
            width: SWATCH_SIZE,
            height: SWATCH_SIZE,
            borderRadius: 'var(--radius-lg)',
            background: trial.stimuli[0].hex,
            boxShadow: 'var(--shadow-card)',
          }}
          aria-hidden
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 420 }}>
          {trial.options.map((opt) => (
            <button
              key={opt}
              onClick={() => onAnswer(trial.id, opt)}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--line)',
                background: 'white',
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // discrimination / control / calibration: two swatches, same-or-different
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--ink-soft)', margin: 0 }}>
        {trial.prompt}
      </p>
      <div style={{ display: 'flex', gap: 16 }}>
        {trial.stimuli.map((s) => (
          <div
            key={s.id}
            style={{
              width: SWATCH_SIZE,
              height: SWATCH_SIZE,
              borderRadius: 'var(--radius-lg)',
              background: s.hex,
              boxShadow: 'var(--shadow-card)',
            }}
            aria-hidden
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14 }}>
        <button
          onClick={() => onAnswer(trial.id, 'same')}
          style={primaryButtonStyle('outline')}
        >
          Same color
        </button>
        <button
          onClick={() => onAnswer(trial.id, 'different')}
          style={primaryButtonStyle('filled')}
        >
          Different colors
        </button>
      </div>
    </div>
  )
}

function primaryButtonStyle(variant: 'filled' | 'outline'): React.CSSProperties {
  if (variant === 'filled') {
    return {
      padding: '12px 24px',
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid var(--accent)',
      background: 'var(--accent)',
      color: 'white',
      fontSize: 15,
      fontWeight: 700,
      cursor: 'pointer',
    }
  }
  return {
    padding: '12px 24px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--line)',
    background: 'white',
    color: 'var(--ink)',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  }
}
