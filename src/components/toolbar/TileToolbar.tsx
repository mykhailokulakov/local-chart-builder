import type { CSSProperties } from 'react'
import { useCallback } from 'react'
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TileToolbarProps {
  slideId: string
}

interface TileButtonConfig {
  type: ChartType | 'text'
  icon: React.ReactNode
}

// ---------------------------------------------------------------------------
// Module-level constants
// ---------------------------------------------------------------------------

const TOOLBAR_STYLE: CSSProperties = {
  display: 'flex',
  gap: 6,
  padding: '6px 16px',
  borderBottom: '1px solid #f0f0f0',
  background: '#fafafa',
  flexWrap: 'wrap',
  flexShrink: 0,
}

const PILL_BASE_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '3px 10px',
  borderRadius: 20,
  border: '1px solid #d9d9d9',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 12,
  lineHeight: '20px',
  userSelect: 'none',
  whiteSpace: 'nowrap',
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
  const { dispatch } = useReport()

  const handleAdd = useCallback(
    (type: ChartType | 'text') => {
      dispatch(addTile(slideId, createTile(type)))
    },
    [dispatch, slideId],
  )

  return (
    <div style={TOOLBAR_STYLE} role="toolbar" aria-label={t('panels.canvas')}>
      {TILE_BUTTONS.map(({ type, icon }) => (
        <button
          key={type}
          style={PILL_BASE_STYLE}
          onClick={() => handleAdd(type)}
          aria-label={t(`tileToolbar.${type}`)}
          type="button"
        >
          {icon}
          {t(`tileToolbar.${type}`)}
        </button>
      ))}
    </div>
  )
}
