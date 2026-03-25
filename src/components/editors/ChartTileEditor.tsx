import type { CSSProperties } from 'react'
import { useCallback } from 'react'
import { Input, Button, Switch, Typography, notification } from 'antd'
import {
  BarChartOutlined,
  BarsOutlined,
  PieChartOutlined,
  LineChartOutlined,
  ScheduleOutlined,
  GlobalOutlined,
  TableOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { TileConfig } from '../../types/layout'
import type { ChartData, ChartType, ChartOptions } from '../../types/chart'
import { useReport } from '../../hooks/useReport'
import { updateTileData, updateTileOptions, updateTileType, removeTile } from '../../store/actions'
import { createTile } from '../../services/slideFactory'
import { ChartDataInput } from './ChartDataInput'

// ---------------------------------------------------------------------------
// Module-level constants — no inline objects in JSX
// ---------------------------------------------------------------------------

const CHART_DATA_TYPES = new Set<ChartType | 'text'>(['bar-v', 'bar-h', 'donut', 'line'])

const CHART_TYPE_CONFIG = [
  { type: 'bar-v' as const, Icon: BarChartOutlined, labelKey: 'editors.tileType.bar-v' },
  { type: 'bar-h' as const, Icon: BarsOutlined, labelKey: 'editors.tileType.bar-h' },
  { type: 'donut' as const, Icon: PieChartOutlined, labelKey: 'editors.tileType.donut' },
  { type: 'line' as const, Icon: LineChartOutlined, labelKey: 'editors.tileType.line' },
  { type: 'gantt' as const, Icon: ScheduleOutlined, labelKey: 'editors.tileType.gantt' },
  { type: 'choropleth' as const, Icon: GlobalOutlined, labelKey: 'editors.tileType.choropleth' },
  { type: 'data-table' as const, Icon: TableOutlined, labelKey: 'editors.tileType.data-table' },
]

const DISPLAY_TOGGLES_BY_TYPE = {
  'bar-v': ['showValues', 'showLegend', 'showAxis'],
  'bar-h': ['showValues', 'showLegend', 'showAxis'],
  donut: ['showValues', 'showLegend'],
  line: ['showValues', 'showLegend', 'showAxis'],
} as const
type ToggleKey = 'showValues' | 'showLegend' | 'showAxis'
type EditableChartType = keyof typeof DISPLAY_TOGGLES_BY_TYPE

function isEditableChartType(type: ChartType | 'text'): type is EditableChartType {
  return type === 'bar-v' || type === 'bar-h' || type === 'donut' || type === 'line'
}

const TYPE_GRID_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: 4,
}

const TOGGLE_ROW_STYLE: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ChartTileEditorProps {
  tile: TileConfig
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChartTileEditor({ tile }: ChartTileEditorProps) {
  const { t } = useTranslation()
  const { state, dispatch } = useReport()
  const { selectedSlideId } = state

  // Intentional cast: PropertiesPanel only routes bar-v/bar-h/donut/line
  // tile types to ChartTileEditor, so tile.data is guaranteed to be ChartData.
  const chartData = tile.data as ChartData
  const points = chartData.points ?? []
  const chartType: EditableChartType = isEditableChartType(tile.type) ? tile.type : 'bar-v'
  const availableToggles = DISPLAY_TOGGLES_BY_TYPE[chartType]
  const canEditLegendLabel = chartType === 'bar-v' || chartType === 'bar-h' || chartType === 'line'

  const updateData = useCallback(
    (patch: Partial<ChartData>) => {
      if (selectedSlideId === null) return
      dispatch(updateTileData(selectedSlideId, tile.id, { ...chartData, ...patch }))
    },
    [dispatch, selectedSlideId, tile.id, chartData],
  )

  const handleTypeChange = useCallback(
    (newType: ChartType | 'text') => {
      if (selectedSlideId === null) return
      const newData =
        CHART_DATA_TYPES.has(tile.type) && CHART_DATA_TYPES.has(newType)
          ? tile.data
          : createTile(newType).data
      dispatch(updateTileType(selectedSlideId, tile.id, newType, newData))
    },
    [dispatch, selectedSlideId, tile],
  )

  const handleOptionChange = useCallback(
    (key: ToggleKey, value: boolean) => {
      if (selectedSlideId === null) return
      const updated: ChartOptions = { ...tile.options, [key]: value }
      dispatch(updateTileOptions(selectedSlideId, tile.id, updated))
    },
    [dispatch, selectedSlideId, tile.id, tile.options],
  )

  const handleDelete = useCallback(() => {
    if (selectedSlideId === null) return
    dispatch(removeTile(selectedSlideId, tile.id))
  }, [dispatch, selectedSlideId, tile.id])

  const handleParseError = useCallback(
    (message: string) => {
      notification.error({ message: t('editors.csvParseError'), description: message })
    },
    [t],
  )

  if (selectedSlideId === null) return null

  return (
    <div className="flex flex-col gap-4">
      <Typography.Title level={5}>{t('editors.tileEditor')}</Typography.Title>

      <label>{t('editors.chartType')}</label>
      <div style={TYPE_GRID_STYLE}>
        {CHART_TYPE_CONFIG.map(({ type, Icon, labelKey }) => (
          <Button
            key={type}
            size="small"
            type={tile.type === type ? 'primary' : 'default'}
            icon={<Icon />}
            onClick={() => handleTypeChange(type)}
          >
            {t(labelKey)}
          </Button>
        ))}
      </div>

      <label htmlFor="chart-title">{t('editors.chartTitle')}</label>
      <Input
        id="chart-title"
        value={chartData.title ?? ''}
        onChange={(e) => updateData({ title: e.target.value })}
      />
      {canEditLegendLabel && (
        <>
          <label htmlFor="chart-legend-label">{t('editors.legendLabel')}</label>
          <Input
            id="chart-legend-label"
            value={chartData.legendLabel ?? ''}
            onChange={(e) => updateData({ legendLabel: e.target.value })}
          />
        </>
      )}

      <Typography.Text strong>{t('editors.dataInput')}</Typography.Text>
      <ChartDataInput
        points={points}
        onUpdate={(pts) => updateData({ points: pts })}
        onParseError={handleParseError}
      />

      <Typography.Text strong>{t('editors.display')}</Typography.Text>
      {availableToggles.map((key) => (
        <div key={key} style={TOGGLE_ROW_STYLE}>
          <label>{t(`editors.${key}`)}</label>
          <Switch
            checked={tile.options[key] ?? false}
            onChange={(v) => handleOptionChange(key, v)}
          />
        </div>
      ))}

      <Button danger block onClick={handleDelete}>
        {t('editors.deleteTile')}
      </Button>
    </div>
  )
}
