import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions as ChartJsOptions,
  type Plugin,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'
import type { ThemeColors } from '../../types/theme'

ChartJS.register(ArcElement, Tooltip, Legend)

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DONUT_CUTOUT = '60%'
const DONUT_VALUE_FONT_SIZE = 11

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DonutDataPoint {
  label: string
  value: number
  color?: string
}

interface DonutDisplayOptions {
  showValues: boolean
  showLegend: boolean
}

export interface DonutChartProps {
  data: DonutDataPoint[]
  title?: string
  options: DonutDisplayOptions
  theme: ThemeColors
}

// ---------------------------------------------------------------------------
// Plugins
// ---------------------------------------------------------------------------

function makeValueLabelPlugin(foreground: string, fontFamily: string): Plugin<'doughnut'> {
  return {
    id: 'donutValueLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      const meta = chart.getDatasetMeta(0)
      meta.data.forEach((element, index) => {
        const rawValue = chart.data.datasets[0].data[index]
        if (typeof rawValue !== 'number') return

        // Safety: doughnut chart meta elements are always ArcElement instances
        const arc = element as ArcElement
        const midAngle = (arc.startAngle + arc.endAngle) / 2
        const midRadius = (arc.innerRadius + arc.outerRadius) / 2
        const x = arc.x + midRadius * Math.cos(midAngle)
        const y = arc.y + midRadius * Math.sin(midAngle)

        ctx.save()
        ctx.font = `${DONUT_VALUE_FONT_SIZE}px ${fontFamily}`
        ctx.fillStyle = foreground
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(rawValue), x, y)
        ctx.restore()
      })
    },
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DonutChart({ data, title, options, theme }: DonutChartProps) {
  const { t } = useTranslation()

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
  const backgroundColors = data.map(
    (d, i) => d.color ?? theme.chartColors[i % theme.chartColors.length] ?? theme.accent,
  )

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors,
        borderWidth: 0,
      },
    ],
  }

  const chartOptions: ChartJsOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    cutout: DONUT_CUTOUT,
    plugins: {
      legend: {
        display: options.showLegend,
        position: 'bottom',
        labels: {
          color: theme.foreground,
          font: { family: theme.fontFamily },
        },
      },
      title: {
        display: Boolean(title && title.trim().length > 0),
        text: title ?? '',
        color: theme.foreground,
        font: { family: theme.fontFamily },
      },
      tooltip: { enabled: true },
    },
  }

  const plugins: Plugin<'doughnut'>[] = []
  if (options.showValues) {
    plugins.push(makeValueLabelPlugin(theme.foreground, theme.fontFamily))
  }

  return (
    <div style={{ width: '100%', height: '100%', background: theme.background }}>
      <Doughnut data={chartData} options={chartOptions} plugins={plugins} />
    </div>
  )
}
