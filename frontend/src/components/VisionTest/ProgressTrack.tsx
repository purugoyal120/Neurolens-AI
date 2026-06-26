interface ProgressTrackProps {
  total: number
  currentIndex: number
}

export function ProgressTrack({ total, currentIndex }: ProgressTrackProps) {
  return (
    <div
      style={{ display: 'flex', gap: 6, alignItems: 'center' }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={currentIndex}
      aria-label={`Trial ${currentIndex + 1} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < currentIndex
        const isCurrent = i === currentIndex
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 4,
              background: isDone ? 'var(--ink)' : isCurrent ? 'var(--accent)' : 'var(--line)',
              transform: isCurrent ? 'scaleY(1.5)' : 'none',
              transition: 'all 200ms ease',
            }}
          />
        )
      })}
    </div>
  )
}
