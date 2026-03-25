import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BarChart } from '../../src/components/charts/BarChart'
import type { ThemeColors } from '../../src/types/theme'
import i18n from '../../src/i18n/config'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// react-chartjs-2 requires a canvas context unavailable in jsdom.
// Mock the Bar component to a plain canvas stub so we can test BarChart's
// own rendering logic (empty-state, orientation prop forwarding, etc.).
vi.mock('react-chartjs-2', () => ({
  Bar: vi.fn(
    ({ data, options, plugins }: { data: unknown; options: unknown; plugins: unknown[] }) => (
      <canvas
        data-testid="bar-canvas"
        data-labels={JSON.stringify((data as { labels: unknown }).labels)}
        data-index-axis={(options as { indexAxis: string }).indexAxis}
        data-title={String(
          (options as { plugins: { title: { text: string } } }).plugins.title.text,
        )}
        data-legend={String(
          (options as { plugins: { legend: { display: boolean } } }).plugins.legend.display,
        )}
        data-plugin-count={String(plugins.length)}
        data-padding={String((options as { layout: { padding: number } }).layout.padding)}
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
  chartColors: ['#3b82f6', '#60a5fa'],
  fontFamily: "'e-Ukraine', sans-serif",
}

const DISPLAY_OPTIONS = { showValues: false, showLegend: false, showAxis: true }

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

describe('BarChart', () => {
  describe('with sample data', () => {
    it('renders the chart canvas', () => {
      render(
        <BarChart
          data={SAMPLE_DATA}
          orientation="vertical"
          options={DISPLAY_OPTIONS}
          theme={THEME}
        />,
      )
      expect(screen.getByTestId('bar-canvas')).toBeInTheDocument()
    })

    it('passes all data labels to the chart', () => {
      render(
        <BarChart
          data={SAMPLE_DATA}
          orientation="vertical"
          options={DISPLAY_OPTIONS}
          theme={THEME}
        />,
      )
      const canvas = screen.getByTestId('bar-canvas')
      const labels = JSON.parse(canvas.getAttribute('data-labels') ?? '[]') as string[]
      expect(labels).toEqual(['Alpha', 'Beta', 'Gamma'])
    })

    it('does not render the empty-state message when data is present', () => {
      render(
        <BarChart
          data={SAMPLE_DATA}
          orientation="vertical"
          options={DISPLAY_OPTIONS}
          theme={THEME}
        />,
      )
      expect(screen.queryByText('No data to display')).not.toBeInTheDocument()
    })
  })

  describe('with empty data', () => {
    it('renders the placeholder message instead of a canvas', () => {
      render(<BarChart data={[]} orientation="vertical" options={DISPLAY_OPTIONS} theme={THEME} />)
      expect(screen.getByText('No data to display')).toBeInTheDocument()
      expect(screen.queryByTestId('bar-canvas')).not.toBeInTheDocument()
    })
  })

  describe('horizontal orientation', () => {
    it('passes indexAxis "y" to the chart for horizontal bars', () => {
      render(
        <BarChart
          data={SAMPLE_DATA}
          orientation="horizontal"
          options={DISPLAY_OPTIONS}
          theme={THEME}
        />,
      )
      const canvas = screen.getByTestId('bar-canvas')
      expect(canvas.getAttribute('data-index-axis')).toBe('y')
    })
  })

  describe('vertical orientation', () => {
    it('passes indexAxis "x" to the chart for vertical bars', () => {
      render(
        <BarChart
          data={SAMPLE_DATA}
          orientation="vertical"
          options={DISPLAY_OPTIONS}
          theme={THEME}
        />,
      )
      const canvas = screen.getByTestId('bar-canvas')
      expect(canvas.getAttribute('data-index-axis')).toBe('x')
    })
  })

  describe('title and legend settings', () => {
    it('passes title text when provided', () => {
      render(
        <BarChart
          data={SAMPLE_DATA}
          orientation="vertical"
          title="Revenue"
          legendLabel="2026"
          options={{ ...DISPLAY_OPTIONS, showLegend: true }}
          theme={THEME}
        />,
      )
      expect(screen.getByTestId('bar-canvas').getAttribute('data-title')).toBe('Revenue')
    })

    it('hides legend when legend label is empty', () => {
      render(
        <BarChart
          data={SAMPLE_DATA}
          orientation="vertical"
          options={{ ...DISPLAY_OPTIONS, showLegend: true }}
          theme={THEME}
        />,
      )
      expect(screen.getByTestId('bar-canvas').getAttribute('data-legend')).toBe('false')
    })
  })

  describe('showValues behavior', () => {
    it('always wires the bar value-label plugin and controls rendering via options', () => {
      render(
        <BarChart
          data={SAMPLE_DATA}
          orientation="vertical"
          options={{ ...DISPLAY_OPTIONS, showValues: false }}
          theme={THEME}
        />,
      )
      expect(screen.getByTestId('bar-canvas').getAttribute('data-plugin-count')).toBe('1')
    })

    it('uses stable layout padding regardless of showValues toggle state', () => {
      const { rerender } = render(
        <BarChart
          data={SAMPLE_DATA}
          orientation="vertical"
          options={{ ...DISPLAY_OPTIONS, showValues: false }}
          theme={THEME}
        />,
      )
      const noValuesPadding = screen.getByTestId('bar-canvas').getAttribute('data-padding')

      rerender(
        <BarChart
          data={SAMPLE_DATA}
          orientation="vertical"
          options={{ ...DISPLAY_OPTIONS, showValues: true }}
          theme={THEME}
        />,
      )
      const withValuesPadding = screen.getByTestId('bar-canvas').getAttribute('data-padding')
      expect(noValuesPadding).toBe(withValuesPadding)
    })
  })
})
