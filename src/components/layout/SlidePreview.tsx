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

// ---------------------------------------------------------------------------
// Title slide
// Layout: structural top stripe → content zone → footer zone
// No decorative elements placed arbitrarily — every element has a structural role.
// ---------------------------------------------------------------------------

const TITLE_SHELL: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}

/** Full-width accent stripe that anchors the top of the slide */
const TITLE_TOP_STRIPE: CSSProperties = {
  height: 8,
  background: 'var(--slide-accent)',
  flexShrink: 0,
}

/** Main content zone — all copy, left-aligned, vertically centred */
const TITLE_BODY: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '52px 80px',
  gap: 0,
}

/**
 * Heading gets a left accent border — gives the slide a clear spine and
 * removes any need for floating accent shapes.
 */
const TITLE_HEADING: CSSProperties = {
  color: 'var(--slide-fg)',
  fontSize: 58,
  fontWeight: 700,
  lineHeight: 1.12,
  borderLeft: '6px solid var(--slide-accent)',
  paddingLeft: 24,
}

const TITLE_SUBHEADING: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 22,
  fontWeight: 400,
  lineHeight: 1.5,
  marginTop: 20,
  paddingLeft: 30,
}

/** Footer zone — visually separated, dedicated space for meta information */
const TITLE_FOOTER: CSSProperties = {
  height: 60,
  flexShrink: 0,
  background: 'var(--slide-surface)',
  padding: '0 80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderTop: '3px solid var(--slide-accent)',
}

const TITLE_META_LEFT: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 13,
  display: 'flex',
  gap: 32,
  letterSpacing: '0.02em',
}

const TITLE_META_RIGHT: CSSProperties = {
  width: 24,
  height: 24,
  background: 'var(--slide-accent)',
  borderRadius: 4,
  opacity: 0.7,
  flexShrink: 0,
}

// ---------------------------------------------------------------------------
// Ending slide
// Layout: left accent column (structural, full height) + two-zone content area
// Message occupies the upper zone; contact/footnote the lower zone.
// Nothing is centred — content anchors to the top-left of the content area.
// ---------------------------------------------------------------------------

const ENDING_SHELL: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
}

/** Accent column — the visual spine of the ending slide */
const ENDING_ACCENT_COL: CSSProperties = {
  width: 10,
  background: 'var(--slide-accent)',
  flexShrink: 0,
}

/** Content area to the right of the accent column */
const ENDING_CONTENT: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
}

/** Upper zone: holds the closing message */
const ENDING_MESSAGE_ZONE: CSSProperties = {
  flex: '0 0 55%',
  display: 'flex',
  alignItems: 'flex-end',
  padding: '0 72px 32px 72px',
}

const ENDING_MESSAGE: CSSProperties = {
  color: 'var(--slide-accent)',
  fontSize: 64,
  fontWeight: 700,
  lineHeight: 1.1,
}

/** Divider between the two content zones */
const ENDING_DIVIDER: CSSProperties = {
  height: 1,
  background: 'var(--slide-surface)',
  margin: '0 72px',
  flexShrink: 0,
}

/** Lower zone: contact info and footnote */
const ENDING_META_ZONE: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '24px 72px 40px 72px',
  gap: 8,
}

const ENDING_CONTACT: CSSProperties = {
  color: 'var(--slide-fg)',
  fontSize: 18,
  lineHeight: 1.5,
}

const ENDING_FOOTNOTE: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 12,
  opacity: 0.7,
  lineHeight: 1.6,
}

// ---------------------------------------------------------------------------
// Text slide
// ---------------------------------------------------------------------------

const TEXT_LAYOUT: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '52px 72px',
  gap: 24,
  boxSizing: 'border-box',
}

const TEXT_HEADING: CSSProperties = {
  color: 'var(--slide-fg)',
  fontSize: 32,
  fontWeight: 700,
  lineHeight: 1.25,
  paddingLeft: 16,
  borderLeft: '4px solid var(--slide-accent)',
  flexShrink: 0,
}

const TEXT_HEADING_RULE: CSSProperties = {
  height: 1,
  background: 'var(--slide-surface)',
  flexShrink: 0,
}

const TEXT_BODY: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 16,
  lineHeight: 1.7,
  flex: 1,
}

// ---------------------------------------------------------------------------
// Divider slide
// ---------------------------------------------------------------------------

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
    <div style={TITLE_SHELL}>
      <div style={TITLE_TOP_STRIPE} />
      <div style={TITLE_BODY}>
        <div style={TITLE_HEADING}>{data.heading || '…'}</div>
        {data.subheading ? <div style={TITLE_SUBHEADING}>{data.subheading}</div> : null}
      </div>
      {hasFooter ? (
        <div style={TITLE_FOOTER}>
          <div style={TITLE_META_LEFT}>
            {data.author ? <span>{data.author}</span> : null}
            {data.date ? <span>{data.date}</span> : null}
          </div>
          <div style={TITLE_META_RIGHT} />
        </div>
      ) : null}
    </div>
  )
}

function EndingContent({ data }: { data: EndingSlideData }) {
  const hasLower = data.contact !== undefined || data.footnote !== undefined
  return (
    <div style={ENDING_SHELL}>
      <div style={ENDING_ACCENT_COL} />
      <div style={ENDING_CONTENT}>
        <div style={ENDING_MESSAGE_ZONE}>
          <div style={ENDING_MESSAGE}>{data.message || '…'}</div>
        </div>
        {hasLower ? (
          <>
            <div style={ENDING_DIVIDER} />
            <div style={ENDING_META_ZONE}>
              {data.contact ? <div style={ENDING_CONTACT}>{data.contact}</div> : null}
              {data.footnote ? <div style={ENDING_FOOTNOTE}>{data.footnote}</div> : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function TextContent({ data }: { data: TextSlideData }) {
  return (
    <div style={TEXT_LAYOUT}>
      <div style={TEXT_HEADING}>{data.heading || '…'}</div>
      <div style={TEXT_HEADING_RULE} />
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
