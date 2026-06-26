import { useEffect, useRef } from 'react'
import type { AnswerOption, UserAnswer, VisionTestQuestion } from '../../types/visionTest'

interface QuestionCardProps {
  question: VisionTestQuestion
  selectedAnswer: UserAnswer | undefined
  onSelect: (optionId: string) => void
}

/**
 * Renders the color patch + answer options for one question.
 *
 * Accessibility:
 * - The patch itself has an aria-label describing it as an unnamed color
 *   swatch (we deliberately don't put the color name in the DOM anywhere
 *   near it — that would give the answer away to a screen reader user,
 *   which defeats the point of the test for someone who is, say, blind
 *   AND wants to test for a family member, or just auditing the page).
 * - Options are real <button> elements in a roving-tabindex-free native
 *   tab order, so Tab/Shift+Tab and Enter/Space all work for free.
 * - Number keys 1-5 select the corresponding option, mirroring common
 *   accessible quiz UI patterns, and arrow keys move focus between options.
 * - The selected option gets aria-pressed, not just a CSS class, so
 *   assistive tech can announce the current selection.
 */
export function QuestionCard({ question, selectedAnswer, onSelect }: QuestionCardProps) {
  const optionRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // Focus the first option (or the previously selected one) whenever the
  // question changes, so keyboard users land somewhere useful immediately.
  useEffect(() => {
    const targetId = selectedAnswer?.selected_option_id ?? question.options[0]?.id
    if (targetId) {
      optionRefs.current.get(targetId)?.focus()
    }
    // Only re-run when the question itself changes, not on every selection,
    // or focus would keep jumping back after the user picks an answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const options = question.options
    if (e.key >= '1' && e.key <= '9') {
      const idx = Number(e.key) - 1
      if (idx < options.length) {
        onSelect(options[idx].id)
        optionRefs.current.get(options[idx].id)?.focus()
      }
      return
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = options[(index + 1) % options.length]
      optionRefs.current.get(next.id)?.focus()
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = options[(index - 1 + options.length) % options.length]
      optionRefs.current.get(prev.id)?.focus()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
      <p
        style={{
          fontFamily: 'Inter, Roboto, system-ui, sans-serif',
          fontSize: 18,
          fontWeight: 600,
          color: '#15191e',
          margin: 0,
          textAlign: 'center',
        }}
      >
        {question.prompt}
      </p>

      <div
        role="img"
        aria-label="Color swatch to identify"
        style={{
          width: 160,
          height: 160,
          borderRadius: 20,
          background: question.stimulus_hex,
          boxShadow: '0 1px 2px rgba(21,25,30,0.06), 0 8px 24px rgba(21,25,30,0.10)',
        }}
      />

      <div
        role="group"
        aria-label="Answer choices"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          width: '100%',
          maxWidth: 480,
        }}
      >
        {question.options.map((opt: AnswerOption, index: number) => {
          const isSelected = selectedAnswer?.selected_option_id === opt.id
          return (
            <button
              key={opt.id}
              ref={(el) => {
                if (el) optionRefs.current.set(opt.id, el)
                else optionRefs.current.delete(opt.id)
              }}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(opt.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 12,
                border: isSelected ? '2px solid #4c4ddc' : '1.5px solid #d8d2c2',
                background: isSelected ? '#e3e3fb' : 'white',
                fontFamily: 'Inter, Roboto, system-ui, sans-serif',
                fontSize: 15,
                fontWeight: 600,
                color: '#15191e',
                cursor: 'pointer',
                outlineOffset: 2,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: opt.hex,
                  border: '1px solid rgba(0,0,0,0.08)',
                  flexShrink: 0,
                }}
              />
              <span>{opt.label}</span>
              {/* visually-hidden hint so a screen reader announces the
                  number shortcut without cluttering the visible label */}
              <span
                style={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  overflow: 'hidden',
                  clip: 'rect(0 0 0 0)',
                }}
              >
                {` (press ${index + 1})`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
