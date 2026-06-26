import type { ProfileSummaryOut } from '../../types/vision'
import { VisionMapDial } from './VisionMapDial'

interface ResultsScreenProps {
  result: ProfileSummaryOut
  onRetake: () => void
}

const STRATEGY_COPY: Record<string, string> = {
  none: 'No transformation needed — interfaces will look the way they already do.',
  shift_hue: 'We\u2019ll shift problematic colors toward hues you discriminate well.',
  increase_saturation: 'We\u2019ll boost saturation in your weak zones to keep colors distinguishable.',
  icon_replacement: 'We\u2019ll attach icons and patterns to color-coded meaning, so nothing depends on color alone.',
  combined: 'We\u2019ll combine color shifting with icon backup for the zones that need it most.',
}

export function ResultsScreen({ result, onRetake }: ResultsScreenProps) {
  const { vision_map: vm } = result

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, maxWidth: 520 }}>
      <VisionMapDial perHueDiscrimination={vm.per_hue_discrimination} />

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: '0 0 8px' }}>
          {result.headline}
        </h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          {result.description}
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
        <StatTile label="Severity" value={result.severity_label} />
        <StatTile label="Confidence" value={`${Math.round(vm.confidence * 100)}%`} />
      </div>

      <div
        style={{
          width: '100%',
          padding: 16,
          borderRadius: 'var(--radius-md)',
          background: 'var(--accent-soft)',
          fontSize: 14,
          color: 'var(--ink)',
        }}
      >
        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--accent)' }}>
          Strategy
        </strong>
        <p style={{ margin: '6px 0 0' }}>{STRATEGY_COPY[vm.recommended_strategy] ?? STRATEGY_COPY.combined}</p>
      </div>

      <p style={{ fontSize: 12, color: 'var(--ink-soft)', textAlign: 'center', lineHeight: 1.5 }}>
        This is a screening estimate, not a clinical diagnosis. For a confirmed diagnosis, see an
        eye care professional.
      </p>

      <button
        onClick={onRetake}
        style={{
          padding: '10px 20px',
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--line)',
          background: 'white',
          color: 'var(--ink)',
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

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--line)',
        background: 'white',
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, textTransform: 'capitalize' }}>{value}</div>
    </div>
  )
}
