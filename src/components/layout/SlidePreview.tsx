import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import type { Slide } from '../../types/slide'

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
  background: 'var(--slide-bg)',
  fontFamily: 'var(--slide-font)',
}

const LABEL_STYLE: CSSProperties = {
  color: 'var(--slide-accent)',
  fontSize: 24,
  fontWeight: 600,
  letterSpacing: 1,
  textTransform: 'uppercase',
  opacity: 0.9,
}

const SUBTITLE_STYLE: CSSProperties = {
  color: 'var(--slide-fg)',
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SlidePreview({ slide }: SlidePreviewProps) {
  const { t } = useTranslation()
  const subtitle = resolveSubtitle(slide)

  return (
    <div style={CONTAINER_STYLE}>
      <div style={LABEL_STYLE}>{t(`slides.type.${slide.type}`)}</div>
      {subtitle ? <div style={SUBTITLE_STYLE}>{subtitle}</div> : null}
    </div>
  )
}
