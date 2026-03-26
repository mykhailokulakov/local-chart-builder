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
  Bar: vi.fn(({ data, options }: { data: unknown; options: unknown }) => (
    <canvas
      data-testid="bar-canvas"
      data-labels={JSON.stringify((data as { labels: unknown }).labels)}
      data-index-axis={(options as { indexAxis: string }).indexAxis}
    />
  )),
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
  tridentFilterStatement: 'invert(1)',
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
})
