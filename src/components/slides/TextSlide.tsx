import type { CSSProperties } from 'react'
import type { TextSlideData } from '../../types/slide'

// ---------------------------------------------------------------------------
// Module-level style constants
// ---------------------------------------------------------------------------

const CONTAINER_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--slide-bg)',
  fontFamily: 'var(--slide-font)',
  padding: '8%',
  boxSizing: 'border-box',
}

const HEADING_STYLE: CSSProperties = {
  color: 'var(--slide-accent)',
  fontSize: 'var(--slide-fs-heading)',
  fontWeight: 700,
  lineHeight: 1.2,
  margin: 0,
}

const ACCENT_LINE_STYLE: CSSProperties = {
  width: 48,
  height: 3,
  background: 'var(--slide-accent)',
  borderRadius: 2,
  margin: '12px 0 0',
  flexShrink: 0,
}

const BODY_STYLE: CSSProperties = {
  color: 'var(--slide-fg)',
  fontSize: 'var(--slide-fs-body)',
  lineHeight: 1.65,
  margin: '24px 0 0',
  whiteSpace: 'pre-wrap',
  overflow: 'hidden',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TextSlideProps {
  data: TextSlideData
}

export function TextSlide({ data }: TextSlideProps) {
  return (
    <div style={CONTAINER_STYLE}>
      <h2 style={HEADING_STYLE}>{data.heading}</h2>
      <div style={ACCENT_LINE_STYLE} />
      {data.body ? <p style={BODY_STYLE}>{data.body}</p> : null}
    </div>
  )
}
