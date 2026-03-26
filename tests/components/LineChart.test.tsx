import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LineChart } from '../../src/components/charts/LineChart'
import type { ThemeColors } from '../../src/types/theme'
import type { ChartDataPoint, ChartSeries } from '../../src/types/chart'
import i18n from '../../src/i18n/config'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// react-chartjs-2 requires a canvas context unavailable in jsdom.
// Mock Line to a plain canvas stub so we can test LineChart's own logic.
vi.mock('react-chartjs-2', () => ({
  Line: vi.fn(
    ({
      data,
      options,
    }: {
      data: { labels: string[]; datasets: { label: string; data: number[] }[] }
      options: { plugins: { legend: { display: boolean } } }
    }) => (
      <canvas
        data-testid="line-canvas"
        data-labels={JSON.stringify(data.labels)}
        data-dataset-count={String(data.datasets.length)}
        data-first-series-label={data.datasets[0]?.label ?? ''}
        data-legend={String(options.plugins.legend.display)}
      />
    ),
  ),
}))

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const THEME: ThemeColors = {
  background: '#111827',
  surface: '#1f2937',
  foreground: '#f9fafb',
  muted: '#9ca3af',
  foregroundTertiary: 'rgba(255,255,255,0.22)',
  accent: '#3b82f6',
  rule: 'rgba(255,255,255,0.07)',
  chartSecondary: 'rgba(58,58,74,0.50)',
  backgroundStatement: '#111827',
  foregroundStatement: '#f9fafb',
  accentStatement: '#3b82f6',
  titleLine1Color: '#f9fafb',
  titleLine2Color: '#3b82f6',
  chartColors: ['#3b82f6', '#60a5fa', '#34d399'],
  fontFamily: "'e-Ukraine', sans-serif",
}

const DISPLAY_OPTIONS = { showValues: false, showLegend: false, showAxis: true }

const SAMPLE_POINTS: ChartDataPoint[] = [
  { label: 'Jan', value: 10 },
  { label: 'Feb', value: 25 },
  { label: 'Mar', value: 15 },
]

const SAMPLE_SERIES: ChartSeries[] = [
  {
    name: 'Series A',
    points: [
      { label: 'Jan', value: 10 },
      { label: 'Feb', value: 20 },
    ],
  },
  {
    name: 'Series B',
    points: [
      { label: 'Jan', value: 5 },
      { label: 'Feb', value: 15 },
    ],
  },
]

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LineChart', () => {
  describe('with single-series point data', () => {
    it('renders the chart canvas', () => {
      render(<LineChart data={SAMPLE_POINTS} options={DISPLAY_OPTIONS} theme={THEME} />)
      expect(screen.getByTestId('line-canvas')).toBeInTheDocument()
    })

    it('passes all labels to the chart', () => {
      render(<LineChart data={SAMPLE_POINTS} options={DISPLAY_OPTIONS} theme={THEME} />)
      const canvas = screen.getByTestId('line-canvas')
      const labels = JSON.parse(canvas.getAttribute('data-labels') ?? '[]') as string[]
      expect(labels).toEqual(['Jan', 'Feb', 'Mar'])
    })

    it('renders a single dataset for point data', () => {
      render(<LineChart data={SAMPLE_POINTS} options={DISPLAY_OPTIONS} theme={THEME} />)
      expect(screen.getByTestId('line-canvas').getAttribute('data-dataset-count')).toBe('1')
    })

    it('does not render the empty-state message when data is present', () => {
      render(<LineChart data={SAMPLE_POINTS} options={DISPLAY_OPTIONS} theme={THEME} />)
      expect(screen.queryByText('No data to display')).not.toBeInTheDocument()
    })
  })

  describe('with empty data', () => {
    it('renders the placeholder message when data array is empty', () => {
      render(<LineChart data={[]} options={DISPLAY_OPTIONS} theme={THEME} />)
      expect(screen.getByText('No data to display')).toBeInTheDocument()
      expect(screen.queryByTestId('line-canvas')).not.toBeInTheDocument()
    })

    it('renders the placeholder message when all series have empty points', () => {
      const emptySeries: ChartSeries[] = [{ name: 'Empty', points: [] }]
      render(<LineChart data={emptySeries} options={DISPLAY_OPTIONS} theme={THEME} />)
      expect(screen.getByText('No data to display')).toBeInTheDocument()
    })
  })

  describe('with multi-series data', () => {
    it('renders the chart canvas for multi-series input', () => {
      render(<LineChart data={SAMPLE_SERIES} options={DISPLAY_OPTIONS} theme={THEME} />)
      expect(screen.getByTestId('line-canvas')).toBeInTheDocument()
    })

    it('creates one dataset per series', () => {
      render(<LineChart data={SAMPLE_SERIES} options={DISPLAY_OPTIONS} theme={THEME} />)
      expect(screen.getByTestId('line-canvas').getAttribute('data-dataset-count')).toBe('2')
    })

    it('uses series names as dataset labels', () => {
      render(<LineChart data={SAMPLE_SERIES} options={DISPLAY_OPTIONS} theme={THEME} />)
      expect(screen.getByTestId('line-canvas').getAttribute('data-first-series-label')).toBe(
        'Series A',
      )
    })

    it('derives labels from the first series points', () => {
      render(<LineChart data={SAMPLE_SERIES} options={DISPLAY_OPTIONS} theme={THEME} />)
      const canvas = screen.getByTestId('line-canvas')
      const labels = JSON.parse(canvas.getAttribute('data-labels') ?? '[]') as string[]
      expect(labels).toEqual(['Jan', 'Feb'])
    })
  })

  describe('legend display option', () => {
    it('passes legend display=true when showLegend is true', () => {
      render(
        <LineChart
          data={SAMPLE_POINTS}
          options={{ ...DISPLAY_OPTIONS, showLegend: true }}
          theme={THEME}
        />,
      )
      expect(screen.getByTestId('line-canvas').getAttribute('data-legend')).toBe('true')
    })

    it('passes legend display=false when showLegend is false', () => {
      render(
        <LineChart
          data={SAMPLE_POINTS}
          options={{ ...DISPLAY_OPTIONS, showLegend: false }}
          theme={THEME}
        />,
      )
      expect(screen.getByTestId('line-canvas').getAttribute('data-legend')).toBe('false')
    })
  })
})
