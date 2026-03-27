import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  ScheduleOutlined,
  GlobalOutlined,
  TableOutlined,
  FontSizeOutlined,
} from '@ant-design/icons'
import type { ChartType } from '../../types/chart'
import { useReport } from '../../hooks/useReport'
import { addTile } from '../../store/actions'
import { createTile } from '../../services/slideFactory'
import { canAddTile, resolveNewTileLayout } from '../../services/layoutEngine'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TileToolbarProps {
  slideId: string
}

interface TileButtonConfig {
  type: ChartType | 'text'
  icon: ReactNode
}

// ---------------------------------------------------------------------------
// Module-level constants
// ---------------------------------------------------------------------------

const TOOLBAR_STYLE: CSSProperties = {
  display: 'flex',
  gap: 6,
  padding: '6px 16px',
  borderBottom: '1px solid var(--ant-color-border-secondary)',
  background: 'var(--ant-color-bg-layout)',
  flexWrap: 'wrap',
  flexShrink: 0,
  alignItems: 'center',
}

const PILL_BASE_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '3px 10px',
  borderRadius: 20,
  border: '1px solid var(--ant-color-border)',
  background: 'var(--ant-color-bg-container)',
  cursor: 'pointer',
  fontSize: 12,
  lineHeight: '20px',
  userSelect: 'none',
  whiteSpace: 'nowrap',
}

const PILL_DISABLED_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '3px 10px',
  borderRadius: 20,
  border: '1px solid var(--ant-color-border)',
  background: 'var(--ant-color-bg-container)',
  cursor: 'not-allowed',
  fontSize: 12,
  lineHeight: '20px',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  opacity: 0.4,
}

const NO_SPACE_HINT_STYLE: CSSProperties = {
  fontSize: 11,
  color: 'var(--ant-color-text-quaternary)',
  paddingLeft: 4,
}

const TILE_BUTTONS: TileButtonConfig[] = [
  { type: 'bar-v', icon: <BarChartOutlined /> },
  { type: 'bar-h', icon: <BarChartOutlined rotate={90} /> },
  { type: 'donut', icon: <PieChartOutlined /> },
  { type: 'line', icon: <LineChartOutlined /> },
  { type: 'gantt', icon: <ScheduleOutlined /> },
  { type: 'choropleth', icon: <GlobalOutlined /> },
  { type: 'data-table', icon: <TableOutlined /> },
  { type: 'text', icon: <FontSizeOutlined /> },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TileToolbar({ slideId }: TileToolbarProps) {
  const { t } = useTranslation()
  const { dispatch, state } = useReport()

  const tiles = useMemo(
    () => state.present.slides.find((s) => s.id === slideId)?.tiles ?? [],
    [state.present.slides, slideId],
  )

  const hasSpace = useMemo(() => canAddTile(tiles), [tiles])

  const pillStyle = useMemo<CSSProperties>(
    () => (hasSpace ? PILL_BASE_STYLE : PILL_DISABLED_STYLE),
    [hasSpace],
  )

  const handleAdd = useCallback(
    (type: ChartType | 'text') => {
      const layout = resolveNewTileLayout(tiles)
      if (layout === null) return
      dispatch(addTile(slideId, { ...createTile(type), layout }))
    },
    [dispatch, slideId, tiles],
  )

  return (
    <div style={TOOLBAR_STYLE} role="toolbar" aria-label={t('panels.canvas')}>
      {TILE_BUTTONS.map(({ type, icon }) => (
        <button
          key={type}
          style={pillStyle}
          onClick={() => handleAdd(type)}
          disabled={!hasSpace}
          aria-disabled={!hasSpace}
          aria-label={t(`tileToolbar.${type}`)}
          type="button"
        >
          {icon}
          {t(`tileToolbar.${type}`)}
        </button>
      ))}
      {!hasSpace && <span style={NO_SPACE_HINT_STYLE}>{t('tileToolbar.noSpace')}</span>}
    </div>
  )
}
