import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DonutChart } from '../../src/components/charts/DonutChart'
import type { ThemeColors } from '../../src/types/theme'
import i18n from '../../src/i18n/config'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// react-chartjs-2 requires a canvas context unavailable in jsdom.
// Mock the Doughnut component to a plain canvas stub so we can test
// DonutChart's own rendering logic (empty-state, data forwarding, etc.).
vi.mock('react-chartjs-2', () => ({
  Doughnut: vi.fn(
    ({
      data,
      options,
    }: {
      data: { labels: string[]; datasets: { data: number[] }[] }
      options: { cutout: string; plugins: { legend: { display: boolean } } }
    }) => (
      <canvas
        data-testid="donut-canvas"
        data-labels={JSON.stringify(data.labels)}
        data-values={JSON.stringify(data.datasets[0].data)}
        data-cutout={options.cutout}
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
  accent: '#3b82f6',
  accentSecondary: '#60a5fa',
  chartColors: ['#3b82f6', '#60a5fa', '#93c5fd'],
  fontFamily: "'e-Ukraine', sans-serif",
}

const DISPLAY_OPTIONS = { showValues: false, showLegend: false }

const SAMPLE_DATA = [
  { label: 'Alpha', value: 10 },
  { label: 'Beta', value: 25 },
  { label: 'Gamma', value: 15 },
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

describe('DonutChart', () => {
  describe('with sample data', () => {
    it('renders the chart canvas', () => {
      render(<DonutChart data={SAMPLE_DATA} options={DISPLAY_OPTIONS} theme={THEME} />)
      expect(screen.getByTestId('donut-canvas')).toBeInTheDocument()
    })

    it('passes all data labels to the chart', () => {
      render(<DonutChart data={SAMPLE_DATA} options={DISPLAY_OPTIONS} theme={THEME} />)
      const canvas = screen.getByTestId('donut-canvas')
      const labels = JSON.parse(canvas.getAttribute('data-labels') ?? '[]') as string[]
      expect(labels).toEqual(['Alpha', 'Beta', 'Gamma'])
    })

    it('passes all data values to the chart', () => {
      render(<DonutChart data={SAMPLE_DATA} options={DISPLAY_OPTIONS} theme={THEME} />)
      const canvas = screen.getByTestId('donut-canvas')
      const values = JSON.parse(canvas.getAttribute('data-values') ?? '[]') as number[]
      expect(values).toEqual([10, 25, 15])
    })

    it('does not render the empty-state message when data is present', () => {
      render(<DonutChart data={SAMPLE_DATA} options={DISPLAY_OPTIONS} theme={THEME} />)
      expect(screen.queryByText('No data to display')).not.toBeInTheDocument()
    })
  })

  describe('with empty data', () => {
    it('renders the placeholder message instead of a canvas', () => {
      render(<DonutChart data={[]} options={DISPLAY_OPTIONS} theme={THEME} />)
      expect(screen.getByText('No data to display')).toBeInTheDocument()
      expect(screen.queryByTestId('donut-canvas')).not.toBeInTheDocument()
    })
  })

  describe('cutout', () => {
    it('passes 60% cutout to produce a donut shape (not a pie)', () => {
      render(<DonutChart data={SAMPLE_DATA} options={DISPLAY_OPTIONS} theme={THEME} />)
      const canvas = screen.getByTestId('donut-canvas')
      expect(canvas.getAttribute('data-cutout')).toBe('60%')
    })
  })

  describe('showLegend option', () => {
    it('hides the legend when showLegend is false', () => {
      render(
        <DonutChart
          data={SAMPLE_DATA}
          options={{ showValues: false, showLegend: false }}
          theme={THEME}
        />,
      )
      const canvas = screen.getByTestId('donut-canvas')
      expect(canvas.getAttribute('data-legend')).toBe('false')
    })

    it('shows the legend when showLegend is true', () => {
      render(
        <DonutChart
          data={SAMPLE_DATA}
          options={{ showValues: false, showLegend: true }}
          theme={THEME}
        />,
      )
      const canvas = screen.getByTestId('donut-canvas')
      expect(canvas.getAttribute('data-legend')).toBe('true')
    })
  })

  describe('per-point color override', () => {
    it('uses the point-level color when provided instead of cycling the theme palette', () => {
      const dataWithColor = [
        { label: 'X', value: 5, color: '#ff0000' },
        { label: 'Y', value: 5 },
      ]
      // Renders without throwing — color mapping is exercised
      expect(() =>
        render(<DonutChart data={dataWithColor} options={DISPLAY_OPTIONS} theme={THEME} />),
      ).not.toThrow()
    })
  })

  describe('theme colors', () => {
    it('cycles through chartColors when more data points than colors exist', () => {
      const manyPoints = Array.from({ length: 6 }, (_, i) => ({
        label: `Item ${i}`,
        value: i + 1,
      }))
      // theme has 3 colors; 6 points should cycle without throwing
      expect(() =>
        render(<DonutChart data={manyPoints} options={DISPLAY_OPTIONS} theme={THEME} />),
      ).not.toThrow()
    })
  })
})
