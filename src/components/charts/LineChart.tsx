import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions as ChartJsOptions,
  type ChartData as ChartJsData,
  type ChartDataset,
  type Plugin,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'
import type { ChartDataPoint, ChartSeries } from '../../types/chart'
import type { ThemeColors } from '../../types/theme'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LINE_TENSION = 0.3
const POINT_RADIUS = 4
const POINT_HOVER_RADIUS = 6
const LINE_BORDER_WIDTH = 2
const DATALABEL_FONT_SIZE = 11
const DATALABEL_PADDING_Y = 6
/** Hex suffix for 10% opacity (round(0.1 * 255) = 26 = 0x1a) */
const FILL_OPACITY_SUFFIX = '1a'

const CHART_WRAPPER_STYLE: CSSProperties = {
  flex: 1,
  minHeight: 0,
  position: 'relative',
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LineDisplayOptions {
  showValues: boolean
  showLegend: boolean
  showAxis: boolean
}

export interface LineChartProps {
  title?: string
  data: ChartDataPoint[] | ChartSeries[]
  options: LineDisplayOptions
  theme: ThemeColors
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isSeries(data: ChartDataPoint[] | ChartSeries[]): data is ChartSeries[] {
  return data.length > 0 && 'points' in data[0]
}

function buildDatasets(
  data: ChartDataPoint[] | ChartSeries[],
  chartColors: string[],
  accent: string,
): ChartJsData<'line'> {
  if (isSeries(data)) {
    const labels = data[0]?.points.map((p) => p.label) ?? []
    const datasets: ChartDataset<'line'>[] = data.map((series, i) => {
      const color = chartColors[i % chartColors.length] ?? accent
      return {
        label: series.name,
        data: series.points.map((p) => p.value),
        borderColor: color,
        backgroundColor: color + FILL_OPACITY_SUFFIX,
        tension: LINE_TENSION,
        fill: true,
        pointRadius: POINT_RADIUS,
        pointHoverRadius: POINT_HOVER_RADIUS,
        borderWidth: LINE_BORDER_WIDTH,
      }
    })
    return { labels, datasets }
  }

  const points = data as ChartDataPoint[]
  const color = chartColors[0] ?? accent
  const datasets: ChartDataset<'line'>[] = [
    {
      label: '',
      data: points.map((p) => p.value),
      borderColor: color,
      backgroundColor: color + FILL_OPACITY_SUFFIX,
      tension: LINE_TENSION,
      fill: true,
      pointRadius: POINT_RADIUS,
      pointHoverRadius: POINT_HOVER_RADIUS,
      borderWidth: LINE_BORDER_WIDTH,
    },
  ]
  return { labels: points.map((p) => p.label), datasets }
}

function isEmpty(data: ChartDataPoint[] | ChartSeries[]): boolean {
  if (data.length === 0) return true
  if (isSeries(data)) return data.every((s) => s.points.length === 0)
  return false
}

// ---------------------------------------------------------------------------
// Value-label plugin
// React-chartjs-2 does not propagate plugin array changes to an existing chart
// instance. We always register the plugin and gate drawing with `show`.
// ---------------------------------------------------------------------------

function makeValueLabelPlugin(
  show: boolean,
  foreground: string,
  fontFamily: string,
): Plugin<'line'> {
  return {
    id: 'lineValueLabels',
    afterDatasetsDraw(chart) {
      if (!show) return
      const { ctx } = chart
      chart.data.datasets.forEach((_dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex)
        meta.data.forEach((point, index) => {
          const rawValue = chart.data.datasets[datasetIndex].data[index]
          if (typeof rawValue !== 'number') return
          const pos = point.tooltipPosition(false)
          if (pos.x === null || pos.y === null) return
          ctx.save()
          ctx.font = `${DATALABEL_FONT_SIZE}px ${fontFamily}`
          ctx.fillStyle = foreground
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(String(rawValue), pos.x, pos.y - DATALABEL_PADDING_Y)
          ctx.restore()
        })
      })
    },
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LineChart({ title, data, options, theme }: LineChartProps) {
  const { t } = useTranslation()

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      width: '100%',
      height: '100%',
      background: theme.background,
      display: 'flex',
      flexDirection: 'column',
    }),
    [theme.background],
  )

  const titleStyle = useMemo<CSSProperties>(
    () => ({
      color: theme.foreground,
      fontFamily: theme.fontFamily,
      fontSize: 13,
      fontWeight: 600,
      padding: '8px 12px 0',
      flexShrink: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    [theme.foreground, theme.fontFamily],
  )

  const emptyStyle = useMemo<CSSProperties>(
    () => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      background: theme.surface,
      color: theme.muted,
      fontFamily: theme.fontFamily,
      fontSize: '14px',
    }),
    [theme.surface, theme.muted, theme.fontFamily],
  )

  if (isEmpty(data)) {
    return <div style={emptyStyle}>{t('charts.noData')}</div>
  }

  const { labels, datasets } = buildDatasets(data, theme.chartColors, theme.accent)

  const chartData = { labels, datasets }

  const axisDefaults = {
    display: options.showAxis,
    ticks: { color: theme.muted, font: { family: theme.fontFamily } },
    grid: { color: theme.surface },
    border: { color: theme.muted },
  }

  const chartOptions: ChartJsOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: options.showLegend,
        labels: { color: theme.foreground, font: { family: theme.fontFamily } },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: axisDefaults,
      y: axisDefaults,
    },
  }

  const plugin = makeValueLabelPlugin(options.showValues, theme.foreground, theme.fontFamily)

  return (
    <div style={containerStyle}>
      {title ? <div style={titleStyle}>{title}</div> : null}
      <div style={CHART_WRAPPER_STYLE}>
        <Line
          key={String(options.showValues)}
          data={chartData}
          options={chartOptions}
          plugins={[plugin]}
        />
      </div>
    </div>
  )
}
