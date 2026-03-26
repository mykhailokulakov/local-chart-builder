import type { CSSProperties, ReactNode } from 'react'
import type {
  Slide,
  TitleSlideData,
  EndingSlideData,
  TextSlideData,
  DividerSlideData,
} from '../../types/slide'
import tridentUrl from '../../assets/trident.png'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SlidePreviewProps {
  slide: Slide
}

// ---------------------------------------------------------------------------
// Layout constants — Trident design system (960×540 reference canvas)
// ---------------------------------------------------------------------------

const LEFT_MARGIN = 60
const RIGHT_MARGIN = 60
const FOOTER_BOTTOM = 12

// Cropped PNG dimensions: 200×320 px → aspect ratio 1.6 (h/w)
const TRIDENT_ASPECT = 320 / 200

// ---------------------------------------------------------------------------
// Shared structural styles
// ---------------------------------------------------------------------------

const OUTER: CSSProperties = {
  width: '100%',
  height: '100%',
  fontFamily: 'var(--slide-font)',
  overflow: 'hidden',
}

// ---------------------------------------------------------------------------
// TridentMark — Ukrainian coat of arms rendered from the official PNG asset.
// Uses CSS mask-image so any color can be applied via the `color` prop.
// The PNG (src/assets/trident.png) is black-on-transparent; the mask
// reveals the colored `background` through the trident silhouette.
// ---------------------------------------------------------------------------

interface TridentMarkProps {
  /** Rendered width in px; height is derived from the 200×320 aspect ratio */
  width: number
  /** CSS color string applied as the fill; use CSS variables for theming */
  color: string
  opacity?: number
}

function TridentMark({ width, color, opacity = 1 }: TridentMarkProps) {
  const height = Math.round(width * TRIDENT_ASPECT)
  // Intentional cast: CSS mask-* properties are valid CSSProperties but some
  // type definitions omit the webkit-prefixed variants.
  const style = {
    width,
    height,
    background: color,
    opacity,
    flexShrink: 0,
    display: 'block',
    WebkitMaskImage: `url(${tridentUrl})`,
    WebkitMaskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskImage: `url(${tridentUrl})`,
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
  } as CSSProperties
  return <div style={style} aria-hidden="true" />
}

// ---------------------------------------------------------------------------
// Helper: split a heading string at the midpoint word boundary.
// Returns [line1, line2]. If heading has only one word, line2 is empty.
// ---------------------------------------------------------------------------

function splitHeading(heading: string): [string, string] {
  const words = heading.trim().split(/\s+/)
  if (words.length <= 1) return [heading, '']
  const mid = Math.ceil(words.length / 2)
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
}

// ---------------------------------------------------------------------------
// Title slide
// Background: var(--slide-bg-statement)
// Layout: top zone (Trident header) → spacer → lower zone (title) → footer
// ---------------------------------------------------------------------------

const TITLE_OUTER: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  background: 'var(--slide-bg-statement)',
}

const TITLE_LEFT_BAR: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: 4,
  height: '100%',
  background: 'var(--slide-accent-statement)',
}

const TITLE_INNER: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  paddingLeft: LEFT_MARGIN,
  paddingRight: RIGHT_MARGIN,
}

const TITLE_HEADER_ZONE: CSSProperties = {
  flexShrink: 0,
  paddingTop: 48,
}

const TITLE_ORG_ROW: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}

const TITLE_ORG_LABEL: CSSProperties = {
  color: 'var(--slide-title-line1)',
  fontSize: 13,
  fontWeight: 400,
  letterSpacing: '0.3px',
  opacity: 0.6,
}

const TITLE_HEADER_RULE: CSSProperties = {
  width: 40,
  height: 1,
  background: 'var(--slide-accent-statement)',
  opacity: 0.4,
  marginTop: 14,
}

const TITLE_SPACER: CSSProperties = {
  flex: 1,
  minHeight: 0,
}

const TITLE_CONTENT_ZONE: CSSProperties = {
  flexShrink: 0,
  paddingBottom: 48,
}

const TITLE_LINE_1: CSSProperties = {
  color: 'var(--slide-title-line1)',
  fontSize: 54,
  fontWeight: 700,
  lineHeight: 1.1,
  letterSpacing: '-1px',
}

const TITLE_LINE_2: CSSProperties = {
  color: 'var(--slide-title-line2)',
  fontSize: 54,
  fontWeight: 700,
  lineHeight: 1.1,
  letterSpacing: '-1px',
}

const TITLE_SUBTITLE: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 16,
  fontWeight: 300,
  letterSpacing: '0.5px',
  marginTop: 18,
}

const TITLE_FOOTER: CSSProperties = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  paddingBottom: FOOTER_BOTTOM,
}

const FOOTER_TEXT: CSSProperties = {
  color: 'var(--slide-fg-tertiary)',
  fontSize: 11,
  fontWeight: 400,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
}

function TitleContent({ data }: { data: TitleSlideData }) {
  const [line1, line2] = splitHeading(data.heading || '…')
  return (
    <div style={TITLE_OUTER}>
      <div style={TITLE_LEFT_BAR} />
      <div style={TITLE_INNER}>
        <div style={TITLE_HEADER_ZONE}>
          <div style={TITLE_ORG_ROW}>
            <TridentMark width={28} color="var(--slide-accent-statement)" opacity={0.9} />
            {data.author ? <span style={TITLE_ORG_LABEL}>{data.author}</span> : null}
          </div>
          <div style={TITLE_HEADER_RULE} />
        </div>

        <div style={TITLE_SPACER} />

        <div style={TITLE_CONTENT_ZONE}>
          <div style={TITLE_LINE_1}>{line1}</div>
          {line2 ? <div style={TITLE_LINE_2}>{line2}</div> : null}
          {data.subheading ? <div style={TITLE_SUBTITLE}>{data.subheading}</div> : null}
        </div>

        <div style={TITLE_FOOTER}>
          {data.date ? <span style={FOOTER_TEXT}>{data.date}</span> : <span />}
          <span style={FOOTER_TEXT}>Confidential</span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Ending slide
// Background: var(--slide-bg-statement)
// Layout: left bar + centered column: Trident → message → rule → contact
// The Trident sits ABOVE the "Thank you" text, not behind it.
// ---------------------------------------------------------------------------

const ENDING_OUTER: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  background: 'var(--slide-bg-statement)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
}

const ENDING_LEFT_BAR: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: 4,
  height: '100%',
  background: 'var(--slide-accent-statement)',
}

const ENDING_CONTENT: CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  paddingBottom: 24,
}

const ENDING_TRIDENT_WRAP: CSSProperties = {
  marginBottom: 24,
  display: 'flex',
}

const ENDING_MESSAGE: CSSProperties = {
  color: 'var(--slide-fg-statement)',
  fontSize: 40,
  fontWeight: 300,
  letterSpacing: '1px',
  opacity: 0.92,
}

const ENDING_ACCENT_RULE: CSSProperties = {
  width: 100,
  height: 2,
  background: 'var(--slide-accent-statement)',
  marginTop: 22,
  marginBottom: 22,
  alignSelf: 'center',
}

const ENDING_CONTACT: CSSProperties = {
  color: 'var(--slide-accent-statement)',
  fontSize: 13,
  fontWeight: 400,
  letterSpacing: '0',
}

const ENDING_FOOTNOTE: CSSProperties = {
  color: 'var(--slide-fg-statement)',
  fontSize: 11,
  fontWeight: 400,
  marginTop: 8,
  opacity: 0.45,
}

const ENDING_FOOTER: CSSProperties = {
  position: 'absolute',
  bottom: FOOTER_BOTTOM,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
}

function EndingContent({ data }: { data: EndingSlideData }) {
  return (
    <div style={ENDING_OUTER}>
      <div style={ENDING_LEFT_BAR} />

      <div style={ENDING_CONTENT}>
        <div style={ENDING_TRIDENT_WRAP}>
          <TridentMark width={52} color="var(--slide-fg-statement)" opacity={0.85} />
        </div>
        <div style={ENDING_MESSAGE}>{data.message || '…'}</div>
        <div style={ENDING_ACCENT_RULE} />
        {data.contact ? <div style={ENDING_CONTACT}>{data.contact}</div> : null}
        {data.footnote ? <div style={ENDING_FOOTNOTE}>{data.footnote}</div> : null}
      </div>

      <div style={ENDING_FOOTER}>
        <span style={FOOTER_TEXT}>{/* date can be added when data model expands */}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Text content slide
// Background: var(--slide-bg)
// Layout: left bar + heading + rule + body text
// ---------------------------------------------------------------------------

const TEXT_OUTER: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  background: 'var(--slide-bg)',
}

const TEXT_LEFT_BAR: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: 4,
  height: '100%',
  background: 'var(--slide-accent)',
}

const TEXT_INNER: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  paddingLeft: LEFT_MARGIN,
  paddingRight: RIGHT_MARGIN,
  paddingTop: 56,
  paddingBottom: 40,
}

const TEXT_HEADING: CSSProperties = {
  color: 'var(--slide-fg)',
  fontSize: 22,
  fontWeight: 600,
  lineHeight: 1.3,
  letterSpacing: '-0.3px',
  flexShrink: 0,
}

const TEXT_RULE: CSSProperties = {
  width: '100%',
  height: 1,
  background: 'var(--slide-rule)',
  marginTop: 16,
  marginBottom: 20,
  flexShrink: 0,
}

const TEXT_BODY: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 13,
  fontWeight: 300,
  lineHeight: 1.7,
  flex: 1,
  overflow: 'hidden',
}

const TEXT_FOOTER: CSSProperties = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  paddingTop: 8,
}

function TextContent({ data }: { data: TextSlideData }) {
  return (
    <div style={TEXT_OUTER}>
      <div style={TEXT_LEFT_BAR} />
      <div style={TEXT_INNER}>
        <div style={TEXT_HEADING}>{data.heading || '…'}</div>
        <div style={TEXT_RULE} />
        {data.body ? <div style={TEXT_BODY}>{data.body}</div> : null}
        <div style={TEXT_FOOTER}>
          <span style={FOOTER_TEXT}>{/* org name */}</span>
          <span style={FOOTER_TEXT}>{/* page number */}</span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Divider (section separator) slide
// Background: var(--slide-bg)
// Layout: left bar + vertically centred section name block
// ---------------------------------------------------------------------------

const DIVIDER_OUTER: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  background: 'var(--slide-bg)',
}

const DIVIDER_LEFT_BAR: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: 4,
  height: '100%',
  background: 'var(--slide-accent)',
}

const DIVIDER_INNER: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  boxSizing: 'border-box',
  paddingLeft: LEFT_MARGIN,
  paddingRight: RIGHT_MARGIN,
  paddingBottom: 32,
}

const DIVIDER_ACCENT_RULE: CSSProperties = {
  width: 24,
  height: 2,
  background: 'var(--slide-accent)',
  opacity: 0.38,
  marginBottom: 20,
}

const DIVIDER_LABEL: CSSProperties = {
  color: 'var(--slide-fg)',
  fontSize: 42,
  fontWeight: 600,
  lineHeight: 1.1,
  letterSpacing: '-0.5px',
}

const DIVIDER_DESCRIPTION: CSSProperties = {
  color: 'var(--slide-muted)',
  fontSize: 16,
  fontWeight: 300,
  lineHeight: 1.5,
  marginTop: 16,
  maxWidth: '72%',
}

function DividerContent({ data }: { data: DividerSlideData }) {
  return (
    <div style={DIVIDER_OUTER}>
      <div style={DIVIDER_LEFT_BAR} />
      <div style={DIVIDER_INNER}>
        <div style={DIVIDER_ACCENT_RULE} />
        <div style={DIVIDER_LABEL}>{data.label || '…'}</div>
        {data.description ? <div style={DIVIDER_DESCRIPTION}>{data.description}</div> : null}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SlidePreview({ slide }: SlidePreviewProps) {
  let content: ReactNode

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

  return <div style={OUTER}>{content}</div>
}
