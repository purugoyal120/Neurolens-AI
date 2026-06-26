import type { SubmitVisionTestResponse } from '../../types/visionTest'

interface ResultScreenProps {
  result: SubmitVisionTestResponse
  onRestart: () => void
}

const SEVERITY_COPY: Record<string, string> = {
  none: 'No deficiency detected in this screening.',
  mild: 'A mild difference was detected — most colors should look fine.',
  moderate: 'A moderate difference was detected — some color pairs are hard to tell apart.',
  severe: 'A significant difference was detected — color alone likely isn\u2019t a reliable signal for you.',
}

export function ResultScreen({ result, onRestart }: ResultScreenProps) {
  const { profile, score_summary } = result
  const scores = profile.perception_scores

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
        maxWidth: 520,
        fontFamily: 'Inter, Roboto, system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 26, margin: '0 0 8px', color: '#15191e' }}>
          Your Vision Profile is ready!
        </h1>
        <p style={{ color: '#5b6470', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          {SEVERITY_COPY[profile.severity] ?? SEVERITY_COPY.none}
        </p>
      </div>

      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        <StatTile label="Deficiency type" value={profile.deficiency_type.replace('-', ' ')} />
        <StatTile label="Severity" value={profile.severity} />
        <StatTile
          label="Accuracy"
          value={`${Math.round(score_summary.accuracy * 100)}% (${score_summary.correct_count}/${score_summary.total_questions})`}
        />
        <StatTile label="User" value={profile.user_id} />
      </div>

      <PerceptionScoreBars scores={scores} />

      {profile.recommended_transformations.length > 0 && (
        <div style={{ width: '100%' }}>
          <h2
            style={{
              fontSize: 13,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              color: '#4c4ddc',
              margin: '0 0 10px',
            }}
          >
            Recommended color transformations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {profile.recommended_transformations.map((t, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #d8d2c2',
                  background: 'white',
                  fontSize: 13,
                }}
              >
                <Swatch hex={t.from} />
                <span aria-hidden style={{ color: '#5b6470' }}>
                  →
                </span>
                <Swatch hex={t.to} />
                <span style={{ color: '#3a4047', marginLeft: 4 }}>{t.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontSize: 12, color: '#5b6470', textAlign: 'center', lineHeight: 1.5 }}>
        This is a quick screening, not a clinical diagnosis. For a confirmed diagnosis, see an eye
        care professional.
      </p>

      <button
        onClick={onRestart}
        style={{
          padding: '10px 20px',
          borderRadius: 10,
          border: '1.5px solid #d8d2c2',
          background: 'white',
          color: '#15191e',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Retake the test
      </button>
    </div>
  )
}

function Swatch({ hex }: { hex: string }) {
  return (
    <span
      aria-hidden
      style={{
        width: 18,
        height: 18,
        borderRadius: 5,
        background: hex,
        border: '1px solid rgba(0,0,0,0.1)',
        display: 'inline-block',
      }}
    />
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid #d8d2c2',
        background: 'white',
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: '#5b6470' }}>
        {label}
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, marginTop: 4, textTransform: 'capitalize', color: '#15191e' }}>
        {value}
      </div>
    </div>
  )
}

function PerceptionScoreBars({ scores }: { scores: SubmitVisionTestResponse['profile']['perception_scores'] }) {
  const entries: Array<{ key: keyof typeof scores; label: string; color: string }> = [
    { key: 'red', label: 'Red', color: '#c0392b' },
    { key: 'green', label: 'Green', color: '#27ae60' },
    { key: 'blue', label: 'Blue', color: '#2980b9' },
    { key: 'yellow', label: 'Yellow', color: '#d4ac0d' },
  ]

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h2 style={{ fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', color: '#4c4ddc', margin: 0 }}>
        Perception scores
      </h2>
      {entries.map(({ key, label, color }) => {
        const value = scores[key]
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 56, fontSize: 13, color: '#3a4047' }}>{label}</span>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(value * 100)}
              aria-label={`${label} perception score`}
              style={{ flex: 1, height: 8, borderRadius: 999, background: '#e7e9ee', overflow: 'hidden' }}
            >
              <div style={{ height: '100%', width: `${value * 100}%`, background: color, borderRadius: 999 }} />
            </div>
            <span style={{ width: 40, fontSize: 13, fontWeight: 700, textAlign: 'right', color: '#15191e' }}>
              {Math.round(value * 100)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}
