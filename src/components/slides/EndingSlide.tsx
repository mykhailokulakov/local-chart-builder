import type { CSSProperties } from 'react'
import type { EndingSlideData } from '../../types/slide'

// ---------------------------------------------------------------------------
// Module-level style constants
// ---------------------------------------------------------------------------

const CONTAINER_STYLE: CSSProperties = {
  // position: relative allows the footnote to anchor to the slide bottom
  position: 'relative',
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
}

const MESSAGE_STYLE: CSSProperties = {
  color: 'var(--slide-fg)',
  fontSize: 'var(--slide-fs-title)',
  fontWeight: 700,
  lineHeight: 1.2,
  margin: 0,
}

const CONTACT_STYLE: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 'var(--slide-fs-body)',
  lineHeight: 1.4,
  margin: '20px 0 0',
}

// position: absolute anchors the footnote to the bottom of the slide frame
// without disturbing the vertical centering of the main content.
// position: fixed is banned for html2canvas; absolute is fully supported.
const FOOTNOTE_STYLE: CSSProperties = {
  position: 'absolute',
  bottom: '6%',
  left: '8%',
  right: '8%',
  color: 'var(--slide-muted)',
  fontSize: 'var(--slide-fs-caption)',
  lineHeight: 1.4,
  opacity: 0.7,
  textAlign: 'center',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface EndingSlideProps {
  data: EndingSlideData
}

export function EndingSlide({ data }: EndingSlideProps) {
  return (
    <div style={CONTAINER_STYLE}>
      <h2 style={MESSAGE_STYLE}>{data.message}</h2>
      {data.contact ? <p style={CONTACT_STYLE}>{data.contact}</p> : null}
      {data.footnote ? <p style={FOOTNOTE_STYLE}>{data.footnote}</p> : null}
    </div>
  )
}
