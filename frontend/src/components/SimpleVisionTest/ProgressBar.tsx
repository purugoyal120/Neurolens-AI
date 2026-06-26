interface ProgressBarProps {
  current: number // 0-indexed
  total: number
}

/**
 * Shows both "Step X/10" text and a percentage-filled bar, per spec.
 * Uses role="progressbar" with proper aria attributes for screen readers,
 * and never relies on color alone to communicate progress (the fill and
 * the text both update together).
 */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const step = Math.min(current + 1, total)
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 13,
          fontWeight: 600,
          color: '#5b6470',
          marginBottom: 8,
          fontFamily: 'Inter, Roboto, system-ui, sans-serif',
        }}
      >
        <span>
          Question {step} of {total}
        </span>
        <span>{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={`Question ${step} of ${total}`}
        style={{
          width: '100%',
          height: 8,
          borderRadius: 999,
          background: '#e7e9ee',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percent}%`,
            background: '#4c4ddc',
            borderRadius: 999,
            transition: 'width 280ms ease',
          }}
        />
      </div>
    </div>
  )
}
