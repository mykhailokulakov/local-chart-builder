import type { CSSProperties } from 'react'
import type {
  Slide,
  TitleSlideData,
  EndingSlideData,
  TextSlideData,
  DividerSlideData,
} from '../../types/slide'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SlidePreviewProps {
  slide: Slide
}

// ---------------------------------------------------------------------------
// Module-level style constants
// ---------------------------------------------------------------------------

const OUTER_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  background: 'var(--slide-bg)',
  fontFamily: 'var(--slide-font)',
  overflow: 'hidden',
}

const CENTERED_LAYOUT: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 60px',
  gap: 12,
  boxSizing: 'border-box',
}

const TEXT_LAYOUT: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '48px 64px',
  gap: 16,
  boxSizing: 'border-box',
}

const ACCENT_HEADING: CSSProperties = {
  color: 'var(--slide-accent)',
  fontSize: 36,
  fontWeight: 700,
  textAlign: 'center',
  lineHeight: 1.2,
}

const ACCENT_HEADING_LARGE: CSSProperties = {
  color: 'var(--slide-accent)',
  fontSize: 48,
  fontWeight: 700,
  textAlign: 'center',
  lineHeight: 1.15,
}

const FG_HEADING: CSSProperties = {
  color: 'var(--slide-fg)',
  fontSize: 28,
  fontWeight: 600,
  lineHeight: 1.3,
}

const MUTED_TEXT: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 16,
  textAlign: 'center',
  lineHeight: 1.5,
}

const MUTED_TEXT_LEFT: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 14,
  textAlign: 'left',
  lineHeight: 1.6,
}

const SMALL_META: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 13,
  display: 'flex',
  gap: 24,
}

const FOOTNOTE_TEXT: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 12,
  textAlign: 'center',
  opacity: 0.7,
}

const DIVIDER_BAR: CSSProperties = {
  width: 48,
  height: 3,
  background: 'var(--slide-accent)',
  borderRadius: 2,
  flexShrink: 0,
}

// ---------------------------------------------------------------------------
// Per-slide-type content components
// ---------------------------------------------------------------------------

function TitleContent({ data }: { data: TitleSlideData }) {
  const hasMetaRow = data.author !== undefined || data.date !== undefined
  return (
    <div style={CENTERED_LAYOUT}>
      <div style={ACCENT_HEADING}>{data.heading || '…'}</div>
      {data.subheading ? <div style={MUTED_TEXT}>{data.subheading}</div> : null}
      {hasMetaRow ? (
        <div style={SMALL_META}>
          {data.author ? <span>{data.author}</span> : null}
          {data.date ? <span>{data.date}</span> : null}
        </div>
      ) : null}
    </div>
  )
}

function EndingContent({ data }: { data: EndingSlideData }) {
  return (
    <div style={CENTERED_LAYOUT}>
      <div style={ACCENT_HEADING_LARGE}>{data.message || '…'}</div>
      {data.contact ? <div style={MUTED_TEXT}>{data.contact}</div> : null}
      {data.footnote ? <div style={FOOTNOTE_TEXT}>{data.footnote}</div> : null}
    </div>
  )
}

function TextContent({ data }: { data: TextSlideData }) {
  return (
    <div style={TEXT_LAYOUT}>
      <div style={FG_HEADING}>{data.heading || '…'}</div>
      {data.body ? <div style={MUTED_TEXT_LEFT}>{data.body}</div> : null}
    </div>
  )
}

function DividerContent({ data }: { data: DividerSlideData }) {
  return (
    <div style={CENTERED_LAYOUT}>
      <div style={DIVIDER_BAR} />
      <div style={ACCENT_HEADING_LARGE}>{data.label || '…'}</div>
      {data.description ? <div style={MUTED_TEXT}>{data.description}</div> : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SlidePreview({ slide }: SlidePreviewProps) {
  let content: React.ReactNode

  switch (slide.data.type) {
    case 'title':
      content = <TitleContent data={slide.data} />
      break
    case 'ending':
      content = <EndingContent data={slide.data} />
      break
    case 'text':
      content = <TextContent data={slide.data} />
      break
    case 'divider':
      content = <DividerContent data={slide.data} />
      break
    case 'chart':
      // chart slides are rendered by ChartSlideCanvas — this branch is unreachable
      content = null
      break
  }

  return <div style={OUTER_STYLE}>{content}</div>
}
