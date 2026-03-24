import type { CSSProperties } from 'react'
import { useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useReport } from '../../hooks/useReport'
import { useTheme } from '../../hooks/useTheme'
import { useSelectedSlide } from '../../hooks/useSelectedSlide'
import { useContainerSize } from '../../hooks/useContainerSize'
import { TileToolbar } from '../toolbar/TileToolbar'
import { ChartSlideCanvas } from './ChartSlideCanvas'
import { SlidePreview } from './SlidePreview'
import { SlideErrorBoundary } from './SlideErrorBoundary'
import { SLIDE_ASPECT_RATIO, CANVAS_PADDING_PX, STATUS_BAR_HEIGHT_PX } from '../../utils/constants'

// ---------------------------------------------------------------------------
// Module-level style constants
// ---------------------------------------------------------------------------

const OUTER_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
}

const SLIDE_AREA_STYLE: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  padding: CANVAS_PADDING_PX,
}

// Colours reference Ant Design CSS custom properties so they respond to token
// changes automatically. colorTextTertiary ≈ #8c8c8c; colorTextQuaternary ≈ #bfbfbf;
// colorBorderSecondary ≈ #f0f0f0; colorBgLayout ≈ #f5f5f5 in the light shell theme.
const STATUS_BAR_STYLE: CSSProperties = {
  height: STATUS_BAR_HEIGHT_PX,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  flexShrink: 0,
  fontSize: 12,
  color: 'var(--ant-color-text-tertiary)',
  borderTop: '1px solid var(--ant-color-border-secondary)',
  background: 'var(--ant-color-bg-layout)',
}

const NO_SLIDE_STYLE: CSSProperties = {
  color: 'var(--ant-color-text-quaternary)',
  fontSize: 14,
  textAlign: 'center',
}

const SLIDE_ERROR_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  width: '100%',
  height: '100%',
  color: 'var(--ant-color-text-tertiary)',
  fontSize: 14,
  textAlign: 'center',
  padding: 24,
}

const SLIDE_ERROR_HINT_STYLE: CSSProperties = {
  fontSize: 12,
  color: 'var(--ant-color-text-quaternary)',
}

const SLIDE_FRAME_SHADOW: CSSProperties = {
  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  borderRadius: 2,
  overflow: 'hidden',
  position: 'relative',
  flexShrink: 0,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeSlideSize(
  containerW: number,
  containerH: number,
): { width: number; height: number } {
  const availW = Math.max(0, containerW - CANVAS_PADDING_PX * 2)
  const availH = Math.max(0, containerH - CANVAS_PADDING_PX * 2)
  const widthFromH = availH * SLIDE_ASPECT_RATIO
  const width = Math.min(availW, widthFromH)
  return { width, height: width / SLIDE_ASPECT_RATIO }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Canvas() {
  const { t } = useTranslation()
  const { state } = useReport()
  const theme = useTheme()
  const slide = useSelectedSlide()
  const slideAreaRef = useRef<HTMLDivElement>(null)
  const { width: containerW, height: containerH } = useContainerSize(slideAreaRef)

  const { width: slideW, height: slideH } = useMemo(
    () => computeSlideSize(containerW, containerH),
    [containerW, containerH],
  )

  const slideFrameStyle = useMemo<CSSProperties>(
    () =>
      ({
        ...SLIDE_FRAME_SHADOW,
        width: slideW,
        height: slideH,
        '--slide-bg': theme.background,
        '--slide-surface': theme.surface,
        '--slide-fg': theme.foreground,
        '--slide-muted': theme.muted,
        '--slide-accent': theme.accent,
        '--slide-accent-secondary': theme.accentSecondary,
        '--slide-font': theme.fontFamily,
        // CSS custom properties are valid at runtime but not in the CSSProperties type
      }) as CSSProperties,
    [slideW, slideH, theme],
  )

  const slideErrorFallback = useMemo(
    () => (
      <div style={SLIDE_ERROR_STYLE}>
        <span>{t('canvas.slideError')}</span>
        <span style={SLIDE_ERROR_HINT_STYLE}>{t('canvas.slideErrorHint')}</span>
      </div>
    ),
    [t],
  )

  const slideIndex = slide ? state.present.slides.findIndex((s) => s.id === slide.id) + 1 : 0
  const totalSlides = state.present.slides.length

  const statusLeft =
    slideIndex > 0 ? t('canvas.slideOf', { current: slideIndex, total: totalSlides }) : ''

  const statusRight = slide ? t(`canvas.hint.${slide.type}`) : ''

  return (
    <div style={OUTER_STYLE}>
      {slide?.type === 'chart' ? <TileToolbar slideId={slide.id} /> : null}
      <div ref={slideAreaRef} style={SLIDE_AREA_STYLE}>
        {slide === null ? (
          <div style={NO_SLIDE_STYLE}>{t('canvas.noSlide')}</div>
        ) : (
          <div style={slideFrameStyle}>
            <SlideErrorBoundary key={slide.id} fallback={slideErrorFallback}>
              {slide.type === 'chart' ? (
                <ChartSlideCanvas slide={slide} width={slideW} height={slideH} />
              ) : (
                <SlidePreview slide={slide} />
              )}
            </SlideErrorBoundary>
          </div>
        )}
      </div>
      <div style={STATUS_BAR_STYLE}>
        <span>{statusLeft}</span>
        <span>{statusRight}</span>
      </div>
    </div>
  )
}
