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
  data: BarDataPoint[]
  orientation: 'vertical' | 'horizontal'
  title?: string
  legendLabel?: string
  options: BarDisplayOptions
  theme: ThemeColors
}

// ---------------------------------------------------------------------------
// Inline value-label plugin
// ---------------------------------------------------------------------------

function makeValueLabelPlugin(
  orientation: 'vertical' | 'horizontal',
  foreground: string,
  fontFamily: string,
  enabled: boolean,
): Plugin<'bar'> {
  return {
    id: 'barValueLabels',
    afterDatasetsDraw(chart) {
      if (!enabled) return
      const { ctx } = chart
      chart.data.datasets.forEach((_dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex)
        meta.data.forEach((bar, index) => {
          const rawValue = chart.data.datasets[datasetIndex].data[index]
          if (typeof rawValue !== 'number') return

          const label =
            Number.isInteger(rawValue) || Math.abs(rawValue) >= 100
              ? String(rawValue)
              : rawValue.toFixed(2)
          ctx.save()
          ctx.font = `${DATALABEL_FONT_SIZE}px ${fontFamily}`
          ctx.fillStyle = foreground
          ctx.textAlign = 'center'
          ctx.textBaseline = orientation === 'horizontal' ? 'middle' : 'bottom'

          const pos = bar.tooltipPosition(false)
          if (pos.x === null || pos.y === null) return
          const labelX = orientation === 'horizontal' ? pos.x + DATALABEL_PADDING_PX * 2 : pos.x
          const labelY = orientation === 'horizontal' ? pos.y : pos.y + DATALABEL_PADDING_PX * 4

          ctx.fillText(label, labelX, labelY)
          ctx.restore()
        })
      })
    },
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BarChart({ data, orientation, title, legendLabel, options, theme }: BarChartProps) {
  const { t } = useTranslation()
  const isHorizontal = orientation === 'horizontal'

  if (data.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: theme.surface,
          color: theme.muted,
          fontFamily: theme.fontFamily,
          fontSize: '14px',
        }}
      >
        {t('charts.noData')}
      </div>
    )
  }

  const labels = data.map((d) => d.label)
  const values = data.map((d) => d.value)
  const barColor = theme.chartColors[0] ?? theme.accent

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        label: legendLabel ?? '',
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
      title: {
        display: Boolean(title && title.trim().length > 0),
        text: title ?? '',
        color: theme.foreground,
        font: { family: theme.fontFamily },
      },
      legend: {
        display: options.showLegend && Boolean(legendLabel && legendLabel.trim().length > 0),
        labels: { color: theme.foreground, font: { family: theme.fontFamily } },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: axisDefaults,
      y: axisDefaults,
    },
    layout: { padding: DATALABEL_PADDING_PX * 3 },
  }

  const plugins = [
    makeValueLabelPlugin(orientation, theme.foreground, theme.fontFamily, options.showValues),
  ]

  return (
    <div style={{ width: '100%', height: '100%', background: theme.background }}>
      <Bar data={chartData} options={chartOptions} plugins={plugins} />
    </div>
  )
}
