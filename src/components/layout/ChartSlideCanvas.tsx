import type { CSSProperties } from 'react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GridLayout } from 'react-grid-layout'
import type { LayoutItem, Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import type { Slide } from '../../types/slide'
import type { TileConfig, GridLayout as TileGridLayout } from '../../types/layout'
import { useReport } from '../../hooks/useReport'
import { updateTileLayout, selectTile } from '../../store/actions'
import { GRID_COLS, GRID_ROWS, SLIDE_TYPE_COLORS } from '../../utils/constants'

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

const TILE_BASE_STYLE: CSSProperties = {
  background: SLIDE_TYPE_COLORS.chart,
  borderRadius: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  color: '#fff',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  overflow: 'hidden',
  userSelect: 'none',
}

const TILE_SELECTED_STYLE: CSSProperties = {
  ...TILE_BASE_STYLE,
  outline: '2px solid #1677ff',
  outlineOffset: -2,
}

const TILE_TYPE_LABEL_STYLE: CSSProperties = {
  fontSize: 11,
  opacity: 0.8,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}

const EMPTY_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#aaa',
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
  const { selectedTileId } = state
  const tiles = useMemo(() => slide.tiles ?? [], [slide.tiles])

  const rowHeight = useMemo(
    () => Math.max(1, Math.floor((height - GRID_MARGIN[1] * (GRID_ROWS + 1)) / GRID_ROWS)),
    [height],
  )

  const layout = useMemo<Layout>(() => tiles.map(toLayoutItem), [tiles])

  const handleLayoutChange = useCallback(
    (nextLayout: Layout) => {
      nextLayout.forEach((item) => {
        const tile = tiles.find((t) => t.id === item.i)
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

  if (tiles.length === 0) {
    return <div style={EMPTY_STYLE}>{t('editors.chartSlide.noTiles')}</div>
  }

  return (
    <GridLayout
      layout={layout}
      width={width}
      gridConfig={{ cols: GRID_COLS, rowHeight, margin: GRID_MARGIN }}
      onLayoutChange={handleLayoutChange}
      style={{ width: '100%', height: '100%' }}
    >
      {tiles.map((tile) => {
        const isSelected = tile.id === selectedTileId
        return (
          <div
            key={tile.id}
            style={isSelected ? TILE_SELECTED_STYLE : TILE_BASE_STYLE}
            onClick={() => handleTileClick(tile.id)}
          >
            <div style={TILE_TYPE_LABEL_STYLE}>{t(`editors.tileType.${tile.type}`)}</div>
          </div>
        )
      })}
    </GridLayout>
  )
}
