interface TimerDisplayProps {
  secondsRemaining: number | null
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function TimerDisplay({ secondsRemaining }: TimerDisplayProps) {
  if (secondsRemaining === null) return null

  const isLow = secondsRemaining <= 20

  return (
    <div
      // aria-live announces only when time gets low, not every second —
      // announcing every tick would be unusable with a screen reader.
      aria-live={isLow ? 'polite' : 'off'}
      style={{
        fontFamily: 'Inter, Roboto, system-ui, sans-serif',
        fontSize: 14,
        fontWeight: 700,
        padding: '6px 12px',
        borderRadius: 999,
        background: isLow ? '#f6e2e0' : '#eef0f5',
        color: isLow ? '#7a2222' : '#3a4047',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span aria-hidden>⏱</span>
      {formatTime(secondsRemaining)}
    </div>
  )
}
