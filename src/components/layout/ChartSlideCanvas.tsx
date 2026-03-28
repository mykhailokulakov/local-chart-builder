import type { CSSProperties } from 'react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GridLayout } from 'react-grid-layout'
import type { LayoutItem, Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import type { Slide, ChartSlideData } from '../../types/slide'
import type { TileConfig, GridLayout as TileGridLayout } from '../../types/layout'
import { useReport } from '../../hooks/useReport'
import { useTheme } from '../../hooks/useTheme'
import { updateTileLayout, selectTile } from '../../store/actions'
import { TileErrorBoundary } from './TileErrorBoundary'
import { TileRenderer } from '../charts/TileRenderer'
import {
  GRID_COLS,
  GRID_ROWS,
  CHART_SLIDE_TITLE_HEIGHT_PX,
  TILE_SELECTION_COLOR,
} from '../../utils/constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChartSlideCanvasProps {
  slide: Slide
  width: number
  height: number
}

// ---------------------------------------------------------------------------
// Module-level constants
// ---------------------------------------------------------------------------

const GRID_MARGIN: readonly [number, number] = [8, 8]

const SLIDE_CONTAINER_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--slide-bg)',
}

const CHART_SLIDE_TITLE_STYLE: CSSProperties = {
  height: CHART_SLIDE_TITLE_HEIGHT_PX,
  display: 'flex',
  alignItems: 'center',
  paddingLeft: 16,
  paddingRight: 16,
  flexShrink: 0,
  fontWeight: 600,
  fontSize: 18,
  color: 'var(--slide-fg)',
  fontFamily: 'var(--slide-font)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const TILE_BASE_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  background: 'var(--slide-surface)',
  borderRadius: 4,
  overflow: 'hidden',
  cursor: 'pointer',
  userSelect: 'none',
}

const TILE_SELECTED_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  background: 'var(--slide-surface)',
  borderRadius: 4,
  overflow: 'hidden',
  cursor: 'pointer',
  userSelect: 'none',
  outline: `2px solid ${TILE_SELECTION_COLOR}`,
  outlineOffset: -2,
}

const TILE_ERROR_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  fontSize: 11,
  color: 'var(--slide-muted)',
}

const EMPTY_STYLE: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--slide-muted)',
  fontSize: 13,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toLayoutItem(tile: TileConfig): LayoutItem {
  return { i: tile.id, x: tile.layout.x, y: tile.layout.y, w: tile.layout.w, h: tile.layout.h }
}

function layoutChanged(prev: TileGridLayout, next: LayoutItem): boolean {
  return prev.x !== next.x || prev.y !== next.y || prev.w !== next.w || prev.h !== next.h
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChartSlideCanvas({ slide, width, height }: ChartSlideCanvasProps) {
  const { t } = useTranslation()
  const { state, dispatch } = useReport()
  const theme = useTheme()
  const { selectedTileId } = state
  const tiles = useMemo(() => slide.tiles ?? [], [slide.tiles])

  // Safety: ChartSlideCanvas is only rendered when slide.type === 'chart'
  const slideTitle = (slide.data as ChartSlideData).title ?? null
  const titleH = slideTitle !== null ? CHART_SLIDE_TITLE_HEIGHT_PX : 0

  const rowHeight = useMemo(
    () => Math.max(1, Math.floor((height - titleH - GRID_MARGIN[1] * (GRID_ROWS + 1)) / GRID_ROWS)),
    [height, titleH],
  )

  const layout = useMemo<Layout>(() => tiles.map(toLayoutItem), [tiles])

  const tileErrorFallback = useMemo(
    () => <div style={TILE_ERROR_STYLE}>{t('canvas.tileError')}</div>,
    [t],
  )

  const handleLayoutChange = useCallback(
    (nextLayout: Layout) => {
      nextLayout.forEach((item) => {
        const tile = tiles.find((tl) => tl.id === item.i)
        if (!tile) return
        if (layoutChanged(tile.layout, item)) {
          dispatch(
            updateTileLayout(slide.id, item.i, { x: item.x, y: item.y, w: item.w, h: item.h }),
          )
        }
      })
    },
    [dispatch, slide.id, tiles],
  )

  const handleTileClick = useCallback(
    (tileId: string) => {
      dispatch(selectTile(tileId))
    },
    [dispatch],
  )

  return (
    <div style={SLIDE_CONTAINER_STYLE}>
      {slideTitle !== null && <div style={CHART_SLIDE_TITLE_STYLE}>{slideTitle}</div>}
      {tiles.length === 0 ? (
        <div style={EMPTY_STYLE}>{t('editors.chartSlide.noTiles')}</div>
      ) : (
        <GridLayout
          layout={layout}
          width={width}
          gridConfig={{ cols: GRID_COLS, rowHeight, margin: GRID_MARGIN }}
          onLayoutChange={handleLayoutChange}
          style={{ width: '100%' }}
        >
          {tiles.map((tile) => {
            const isSelected = tile.id === selectedTileId
            return (
              <div
                key={tile.id}
                style={isSelected ? TILE_SELECTED_STYLE : TILE_BASE_STYLE}
                onClick={() => handleTileClick(tile.id)}
              >
                <TileErrorBoundary fallback={tileErrorFallback}>
                  <TileRenderer tile={tile} theme={theme} />
                </TileErrorBoundary>
              </div>
            )
          })}
        </GridLayout>
      )}
    </div>
  )
}
