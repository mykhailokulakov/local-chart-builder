import { useMemo } from 'react'
import type { CSSProperties } from 'react'
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
const DONUT_CENTER_FONT_SIZE = 20
const DONUT_VALUE_FONT_SIZE = 11

const CHART_WRAPPER_STYLE: CSSProperties = {
  flex: 1,
  minHeight: 0,
  position: 'relative',
}

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
  /** Title shown above the donut and also rendered in the centre hole */
  title?: string
  data: DonutDataPoint[]
  options: DonutDisplayOptions
  theme: ThemeColors
}

// ---------------------------------------------------------------------------
// Plugins
// ---------------------------------------------------------------------------

function makeCenterLabelPlugin(
  centerText: string,
  foreground: string,
  fontFamily: string,
): Plugin<'doughnut'> {
  return {
    id: 'donutCenterLabel',
    afterDatasetsDraw(chart) {
      if (!centerText) return
      const { ctx, chartArea } = chart
      const centerX = (chartArea.left + chartArea.right) / 2
      const centerY = (chartArea.top + chartArea.bottom) / 2
      ctx.save()
      ctx.font = `bold ${DONUT_CENTER_FONT_SIZE}px ${fontFamily}`
      ctx.fillStyle = foreground
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(centerText, centerX, centerY)
      ctx.restore()
    },
  }
}

function makeValueLabelPlugin(
  show: boolean,
  foreground: string,
  fontFamily: string,
): Plugin<'doughnut'> {
  return {
    id: 'donutValueLabels',
    afterDatasetsDraw(chart) {
      if (!show) return
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

export function DonutChart({ title, data, options, theme }: DonutChartProps) {
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

  if (data.length === 0) {
    return <div style={emptyStyle}>{t('charts.noData')}</div>
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
      tooltip: { enabled: true },
    },
  }

  // Center text: use chart title if set; show nothing otherwise.
  // This lets the user control the center label via the Chart Title field.
  const centerText = title ?? ''
  const plugins: Plugin<'doughnut'>[] = [
    makeCenterLabelPlugin(centerText, theme.foreground, theme.fontFamily),
    makeValueLabelPlugin(options.showValues, theme.foreground, theme.fontFamily),
  ]

  return (
    <div style={containerStyle}>
      {title ? <div style={titleStyle}>{title}</div> : null}
      <div style={CHART_WRAPPER_STYLE}>
        <Doughnut
          key={String(options.showValues)}
          data={chartData}
          options={chartOptions}
          plugins={plugins}
        />
      </div>
    </div>
  )
}
