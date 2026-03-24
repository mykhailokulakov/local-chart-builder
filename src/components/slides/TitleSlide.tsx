import type { CSSProperties } from 'react'
import type { TitleSlideData } from '../../types/slide'

// ---------------------------------------------------------------------------
// Module-level style constants
//
// Colours use CSS custom properties injected by Canvas onto the slide frame
// (--slide-bg, --slide-fg, --slide-accent, --slide-muted, --slide-font).
// Font sizes use --slide-fs-* which Canvas computes as a fraction of slideH,
// so text scales correctly at every preview size and at PDF export resolution.
// No position: fixed, no calc() — html2canvas compatibility is preserved.
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

const ACCENT_LINE_STYLE: CSSProperties = {
  width: 64,
  height: 4,
  background: 'var(--slide-accent)',
  borderRadius: 2,
  flexShrink: 0,
}

const HEADING_STYLE: CSSProperties = {
  color: 'var(--slide-fg)',
  fontSize: 'var(--slide-fs-title)',
  fontWeight: 700,
  lineHeight: 1.2,
  margin: '20px 0 0',
}

const SUBHEADING_STYLE: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 'var(--slide-fs-heading)',
  fontWeight: 400,
  lineHeight: 1.35,
  margin: '10px 0 0',
}

const SPACER_STYLE: CSSProperties = { flex: 1 }

const FOOTER_STYLE: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: 8,
  borderTop: '1px solid var(--slide-surface)',
}

const FOOTER_TEXT_STYLE: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 'var(--slide-fs-caption)',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TitleSlideProps {
  data: TitleSlideData
}

export function TitleSlide({ data }: TitleSlideProps) {
  const hasFooter = data.author || data.date
  return (
    <div style={CONTAINER_STYLE}>
      <div style={ACCENT_LINE_STYLE} />
      <h1 style={HEADING_STYLE}>{data.heading}</h1>
      {data.subheading ? <p style={SUBHEADING_STYLE}>{data.subheading}</p> : null}
      <div style={SPACER_STYLE} />
      {hasFooter ? (
        <div style={FOOTER_STYLE}>
          <span style={FOOTER_TEXT_STYLE}>{data.author ?? ''}</span>
          <span style={FOOTER_TEXT_STYLE}>{data.date ?? ''}</span>
        </div>
      ) : null}
    </div>
  )
}
