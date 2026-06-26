interface VisionMapDialProps {
  /** 12 buckets keyed by "0","30",...,"330" -> discrimination score 0-1 */
  perHueDiscrimination: Record<string, number>
  size?: number
  /** When true, renders a quieter version suitable as a progress backdrop */
  muted?: boolean
}

const BUCKET_HUES = Array.from({ length: 12 }, (_, i) => i * 30)

/** Same hue-angle-to-Lab math conceptually as the backend's _lab_from_hue,
 *  but we just need a representative sRGB swatch per bucket for the dial —
 *  approximated directly in HSL since exact perceptual matching isn't the
 *  point here, legibility of the visualization is. */
function hueToColor(hueDeg: number): string {
  return `hsl(${hueDeg}, 55%, 55%)`
}

export function VisionMapDial({ perHueDiscrimination, size = 280, muted = false }: VisionMapDialProps) {
  const center = size / 2
  const outerR = size / 2 - 10
  const innerR = outerR * 0.45

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Your vision map">
      {BUCKET_HUES.map((hue) => {
        const score = perHueDiscrimination[String(hue)] ?? 1
        const radius = innerR + (outerR - innerR) * score
        const startAngle = ((hue - 15) * Math.PI) / 180
        const endAngle = ((hue + 15) * Math.PI) / 180

        const x1 = center + innerR * Math.cos(startAngle)
        const y1 = center + innerR * Math.sin(startAngle)
        const x2 = center + radius * Math.cos(startAngle)
        const y2 = center + radius * Math.sin(startAngle)
        const x3 = center + radius * Math.cos(endAngle)
        const y3 = center + radius * Math.sin(endAngle)
        const x4 = center + innerR * Math.cos(endAngle)
        const y4 = center + innerR * Math.sin(endAngle)

        const path = `M ${x1} ${y1} L ${x2} ${y2} A ${radius} ${radius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`

        return (
          <path
            key={hue}
            d={path}
            fill={hueToColor(hue)}
            opacity={muted ? 0.25 : 0.85}
            stroke="var(--paper)"
            strokeWidth={2}
          />
        )
      })}
      <circle cx={center} cy={center} r={innerR - 2} fill="var(--paper)" />
    </svg>
  )
}
