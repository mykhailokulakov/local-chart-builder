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
  position: 'relative',
}

// ---- Title slide -----------------------------------------------------------

const TITLE_LAYOUT: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
}

const TITLE_BODY: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '48px 72px',
  gap: 16,
}

const TITLE_ACCENT_BAR: CSSProperties = {
  width: 56,
  height: 4,
  background: 'var(--slide-accent)',
  borderRadius: 2,
  marginBottom: 8,
}

const TITLE_HEADING: CSSProperties = {
  color: 'var(--slide-fg)',
  fontSize: 52,
  fontWeight: 700,
  lineHeight: 1.15,
  margin: 0,
}

const TITLE_SUBHEADING: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 22,
  fontWeight: 400,
  lineHeight: 1.45,
  marginTop: 4,
}

const TITLE_FOOTER: CSSProperties = {
  borderTop: '1px solid var(--slide-surface)',
  padding: '16px 72px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexShrink: 0,
}

const TITLE_META: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 13,
  display: 'flex',
  gap: 32,
}

const TITLE_FOOTER_ACCENT: CSSProperties = {
  width: 32,
  height: 3,
  background: 'var(--slide-accent)',
  borderRadius: 2,
  opacity: 0.6,
}

// ---- Ending slide ----------------------------------------------------------

const ENDING_LAYOUT: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 72px',
  gap: 20,
  boxSizing: 'border-box',
  position: 'relative',
}

const ENDING_ACCENT_TOP: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 5,
  background: 'var(--slide-accent)',
}

const ENDING_ACCENT_BOTTOM: CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 5,
  background: 'var(--slide-accent)',
}

const ENDING_MESSAGE: CSSProperties = {
  color: 'var(--slide-accent)',
  fontSize: 56,
  fontWeight: 700,
  textAlign: 'center',
  lineHeight: 1.15,
}

const ENDING_CONTACT: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 18,
  textAlign: 'center',
  lineHeight: 1.5,
}

const ENDING_FOOTNOTE: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 12,
  textAlign: 'center',
  opacity: 0.6,
}

// ---- Text slide ------------------------------------------------------------

const TEXT_LAYOUT: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '52px 72px',
  gap: 24,
  boxSizing: 'border-box',
}

const TEXT_HEADING_WRAPPER: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

const TEXT_HEADING_RULE: CSSProperties = {
  width: '100%',
  height: 1,
  background: 'var(--slide-surface)',
  borderRadius: 1,
}

const TEXT_HEADING: CSSProperties = {
  color: 'var(--slide-fg)',
  fontSize: 32,
  fontWeight: 700,
  lineHeight: 1.25,
  paddingLeft: 16,
  borderLeft: '4px solid var(--slide-accent)',
}

const TEXT_BODY: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 16,
  lineHeight: 1.7,
  flex: 1,
}

// ---- Divider slide ---------------------------------------------------------

const DIVIDER_LAYOUT: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '52px 72px',
  gap: 20,
  boxSizing: 'border-box',
  borderLeft: '8px solid var(--slide-accent)',
}

const DIVIDER_LABEL: CSSProperties = {
  color: 'var(--slide-accent)',
  fontSize: 56,
  fontWeight: 700,
  lineHeight: 1.1,
}

const DIVIDER_DESCRIPTION: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 20,
  lineHeight: 1.5,
  maxWidth: '70%',
}

// ---------------------------------------------------------------------------
// Per-slide-type content components
// ---------------------------------------------------------------------------

function TitleContent({ data }: { data: TitleSlideData }) {
  const hasFooter = data.author !== undefined || data.date !== undefined
  return (
    <div style={TITLE_LAYOUT}>
      <div style={TITLE_BODY}>
        <div style={TITLE_ACCENT_BAR} />
        <div style={TITLE_HEADING}>{data.heading || '…'}</div>
        {data.subheading ? <div style={TITLE_SUBHEADING}>{data.subheading}</div> : null}
      </div>
      {hasFooter ? (
        <div style={TITLE_FOOTER}>
          <div style={TITLE_META}>
            {data.author ? <span>{data.author}</span> : null}
            {data.date ? <span>{data.date}</span> : null}
          </div>
          <div style={TITLE_FOOTER_ACCENT} />
        </div>
      ) : null}
    </div>
  )
}

function EndingContent({ data }: { data: EndingSlideData }) {
  return (
    <div style={ENDING_LAYOUT}>
      <div style={ENDING_ACCENT_TOP} />
      <div style={ENDING_MESSAGE}>{data.message || '…'}</div>
      {data.contact ? <div style={ENDING_CONTACT}>{data.contact}</div> : null}
      {data.footnote ? <div style={ENDING_FOOTNOTE}>{data.footnote}</div> : null}
      <div style={ENDING_ACCENT_BOTTOM} />
    </div>
  )
}

function TextContent({ data }: { data: TextSlideData }) {
  return (
    <div style={TEXT_LAYOUT}>
      <div style={TEXT_HEADING_WRAPPER}>
        <div style={TEXT_HEADING}>{data.heading || '…'}</div>
        <div style={TEXT_HEADING_RULE} />
      </div>
      {data.body ? <div style={TEXT_BODY}>{data.body}</div> : null}
    </div>
  )
}

function DividerContent({ data }: { data: DividerSlideData }) {
  return (
    <div style={DIVIDER_LAYOUT}>
      <div style={DIVIDER_LABEL}>{data.label || '…'}</div>
      {data.description ? <div style={DIVIDER_DESCRIPTION}>{data.description}</div> : null}
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
