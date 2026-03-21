import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import type { Slide } from '../../types/slide'
import { SLIDE_TYPE_COLORS } from '../../utils/constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SlidePreviewProps {
  slide: Slide
}

// ---------------------------------------------------------------------------
// Module-level constants
// ---------------------------------------------------------------------------

const CONTAINER_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: 8,
}

const LABEL_STYLE: CSSProperties = {
  color: '#fff',
  fontSize: 24,
  fontWeight: 600,
  letterSpacing: 1,
  textTransform: 'uppercase',
  opacity: 0.9,
}

const SUBTITLE_STYLE: CSSProperties = {
  color: '#fff',
  fontSize: 14,
  opacity: 0.7,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveSubtitle(slide: Slide): string {
  switch (slide.data.type) {
    case 'title':
      return slide.data.heading || ''
    case 'divider':
      return slide.data.label || ''
    case 'text':
      return slide.data.heading || ''
    case 'ending':
      return slide.data.message || ''
    case 'chart':
      return slide.data.title ?? ''
  }
}

function resolveBackgroundColor(type: string): string {
  return SLIDE_TYPE_COLORS[type] ?? '#888'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SlidePreview({ slide }: SlidePreviewProps) {
  const { t } = useTranslation()
  const subtitle = resolveSubtitle(slide)
  const backgroundColor = resolveBackgroundColor(slide.type)

  return (
    <div style={{ ...CONTAINER_STYLE, backgroundColor }}>
      <div style={LABEL_STYLE}>{t(`slides.type.${slide.type}`)}</div>
      {subtitle ? <div style={SUBTITLE_STYLE}>{subtitle}</div> : null}
    </div>
  )
}
