import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import type { TextData } from '../../types/layout'
import type { ThemeColors } from '../../types/theme'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEXT_TILE_PADDING_PX = 16
const TEXT_HEADING_MARGIN_BOTTOM_PX = 8

const BODY_FONT_SIZES: Record<TextData['fontSize'], string> = {
  small: '12px',
  medium: '16px',
  large: '22px',
}

const HEADING_FONT_SIZES: Record<TextData['fontSize'], string> = {
  small: '14px',
  medium: '18px',
  large: '26px',
}

// ---------------------------------------------------------------------------
// Style factories
// ---------------------------------------------------------------------------

function makeContainerStyle(alignment: TextData['alignment'], theme: ThemeColors): CSSProperties {
  return {
    width: '100%',
    height: '100%',
    padding: TEXT_TILE_PADDING_PX,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: theme.surface,
    color: theme.foreground,
    fontFamily: theme.fontFamily,
    textAlign: alignment,
    overflow: 'hidden',
    boxSizing: 'border-box',
  }
}

function makeHeadingStyle(fontSize: TextData['fontSize'], theme: ThemeColors): CSSProperties {
  return {
    fontWeight: 700,
    fontSize: HEADING_FONT_SIZES[fontSize],
    marginBottom: TEXT_HEADING_MARGIN_BOTTOM_PX,
    color: theme.foreground,
  }
}

function makeBodyStyle(fontSize: TextData['fontSize'], theme: ThemeColors): CSSProperties {
  return {
    fontSize: BODY_FONT_SIZES[fontSize],
    color: theme.foreground,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TextTileProps {
  data: TextData
  theme: ThemeColors
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TextTile({ data, theme }: TextTileProps) {
  const containerStyle = useMemo(
    () => makeContainerStyle(data.alignment, theme),
    [data.alignment, theme],
  )
  const headingStyle = useMemo(() => makeHeadingStyle(data.fontSize, theme), [data.fontSize, theme])
  const bodyStyle = useMemo(() => makeBodyStyle(data.fontSize, theme), [data.fontSize, theme])

  return (
    <div style={containerStyle}>
      {data.heading !== undefined && <div style={headingStyle}>{data.heading}</div>}
      <div style={bodyStyle}>{data.body}</div>
    </div>
  )
}
