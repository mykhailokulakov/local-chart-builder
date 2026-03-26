import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions as ChartJsOptions,
  type Plugin,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'
import type { ThemeColors } from '../../types/theme'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BAR_BORDER_RADIUS = 4
const BAR_BORDER_WIDTH = 0
const DATALABEL_FONT_SIZE = 11
const DATALABEL_PADDING_PX = 4

const CHART_WRAPPER_STYLE: CSSProperties = {
  flex: 1,
  minHeight: 0,
  position: 'relative',
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BarDataPoint {
  label: string
  value: number
}

interface BarDisplayOptions {
  showValues: boolean
  showLegend: boolean
  showAxis: boolean
}

export interface BarChartProps {
  title?: string
  legendLabel?: string
  data: BarDataPoint[]
  orientation: 'vertical' | 'horizontal'
  options: BarDisplayOptions
  theme: ThemeColors
}

// ---------------------------------------------------------------------------
// Inline value-label plugin
// React-chartjs-2 does not propagate plugin array changes to an existing chart
// instance. We always register the plugin and gate drawing with `show`.
// ---------------------------------------------------------------------------

function makeValueLabelPlugin(
  show: boolean,
  orientation: 'vertical' | 'horizontal',
  foreground: string,
  fontFamily: string,
): Plugin<'bar'> {
  return {
    id: 'barValueLabels',
    afterDatasetsDraw(chart) {
      if (!show) return
      const { ctx } = chart
      chart.data.datasets.forEach((_dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex)
        meta.data.forEach((bar, index) => {
          const rawValue = chart.data.datasets[datasetIndex].data[index]
          if (typeof rawValue !== 'number') return

          const label = String(rawValue)
          ctx.save()
          ctx.font = `${DATALABEL_FONT_SIZE}px ${fontFamily}`
          ctx.fillStyle = foreground
          ctx.textAlign = 'center'
          ctx.textBaseline = orientation === 'horizontal' ? 'middle' : 'bottom'

          const pos = bar.tooltipPosition(false)
          if (pos.x === null || pos.y === null) return
          const offsetX = orientation === 'horizontal' ? DATALABEL_PADDING_PX : 0
          const offsetY = orientation === 'horizontal' ? 0 : -DATALABEL_PADDING_PX

          ctx.fillText(label, pos.x + offsetX, pos.y + offsetY)
          ctx.restore()
        })
      })
    },
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BarChart({ title, legendLabel, data, orientation, options, theme }: BarChartProps) {
  const { t } = useTranslation()
  const isHorizontal = orientation === 'horizontal'

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

  if (data.length === 0) {
    return <div style={emptyStyle}>{t('charts.noData')}</div>
  }

  const labels = data.map((d) => d.label)
  const values = data.map((d) => d.value)
  const barColor = theme.chartColors[0] ?? theme.accent

  const chartData = {
    labels,
    datasets: [
      {
        label: legendLabel ?? '',
        data: values,
        backgroundColor: barColor,
        borderRadius: BAR_BORDER_RADIUS,
        borderWidth: BAR_BORDER_WIDTH,
      },
    ],
  }

  const axisDefaults = {
    display: options.showAxis,
    ticks: { color: theme.muted, font: { family: theme.fontFamily } },
    grid: { color: theme.surface },
    border: { color: theme.muted },
  }

  const chartOptions: ChartJsOptions<'bar'> = {
    indexAxis: isHorizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: options.showLegend, labels: { color: theme.foreground } },
      tooltip: { enabled: true },
    },
    scales: {
      x: axisDefaults,
      y: axisDefaults,
    },
    layout: { padding: options.showValues ? DATALABEL_PADDING_PX * 3 : 0 },
  }

  // Plugin is always passed — gated internally by `show` flag.
  // Keying by showValues forces a remount so Chart.js picks up the new plugin
  // instance (react-chartjs-2 does not propagate plugin array changes to live
  // chart instances via chart.update()).
  const plugin = makeValueLabelPlugin(
    options.showValues,
    orientation,
    theme.foreground,
    theme.fontFamily,
  )

  return (
    <div style={containerStyle}>
      {title ? <div style={titleStyle}>{title}</div> : null}
      <div style={CHART_WRAPPER_STYLE}>
        <Bar
          key={String(options.showValues)}
          data={chartData}
          options={chartOptions}
          plugins={[plugin]}
        />
      </div>
    </div>
  )
}
