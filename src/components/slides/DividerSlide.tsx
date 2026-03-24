import type { CSSProperties } from 'react'
import type { DividerSlideData } from '../../types/slide'

// ---------------------------------------------------------------------------
// Module-level style constants
// ---------------------------------------------------------------------------

const CONTAINER_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--slide-bg)',
  fontFamily: 'var(--slide-font)',
  padding: '8%',
  boxSizing: 'border-box',
  textAlign: 'center',
  gap: 16,
}

const ACCENT_LINE_STYLE: CSSProperties = {
  width: 80,
  height: 3,
  background: 'var(--slide-accent)',
  borderRadius: 2,
  flexShrink: 0,
}

const LABEL_STYLE: CSSProperties = {
  color: 'var(--slide-fg)',
  fontSize: 'var(--slide-fs-title)',
  fontWeight: 700,
  lineHeight: 1.2,
  margin: 0,
}

const DESCRIPTION_STYLE: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 'var(--slide-fs-body)',
  fontWeight: 400,
  lineHeight: 1.4,
  margin: 0,
  maxWidth: '70%',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DividerSlideProps {
  data: DividerSlideData
}

export function DividerSlide({ data }: DividerSlideProps) {
  return (
    <div style={CONTAINER_STYLE}>
      <div style={ACCENT_LINE_STYLE} />
      <h2 style={LABEL_STYLE}>{data.label}</h2>
      {data.description ? <p style={DESCRIPTION_STYLE}>{data.description}</p> : null}
    </div>
  )
}
