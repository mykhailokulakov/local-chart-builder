import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GanttChart } from '../../src/components/charts/GanttChart'
import type { GanttTask } from '../../src/types/chart'
import type { ThemeColors } from '../../src/types/theme'
import i18n from '../../src/i18n/config'

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

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
  fontFamily: 'sans-serif',
}

const TASKS: GanttTask[] = [
  { id: 't1', name: 'Design', startMonth: 1, endMonth: 3, status: 'done' },
  { id: 't2', name: 'Development', startMonth: 3, endMonth: 8, status: 'in-progress' },
  { id: 't3', name: 'Testing', startMonth: 9, endMonth: 11, status: 'planned' },
]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GanttChart', () => {
  it('renders an SVG element', () => {
    const { container } = render(<GanttChart tasks={TASKS} theme={THEME} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders a task name label for each task', () => {
    render(<GanttChart tasks={TASKS} theme={THEME} />)
    expect(screen.getByText('Design')).toBeInTheDocument()
    expect(screen.getByText('Development')).toBeInTheDocument()
    expect(screen.getByText('Testing')).toBeInTheDocument()
  })

  it('renders the month header labels Jan through Dec', () => {
    render(<GanttChart tasks={TASKS} theme={THEME} />)
    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('Jun')).toBeInTheDocument()
    expect(screen.getByText('Dec')).toBeInTheDocument()
  })

  it('renders status labels inside bars', () => {
    render(<GanttChart tasks={TASKS} theme={THEME} />)
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByText('In progress')).toBeInTheDocument()
    expect(screen.getByText('Planned')).toBeInTheDocument()
  })

  it('renders a rect for each task bar', () => {
    const { container } = render(<GanttChart tasks={TASKS} theme={THEME} />)
    const rects = container.querySelectorAll('rect')
    // One rect per task bar
    expect(rects.length).toBe(TASKS.length)
  })

  it('applies rounded corners to each bar via rx attribute', () => {
    const { container } = render(<GanttChart tasks={TASKS} theme={THEME} />)
    const rects = container.querySelectorAll('rect')
    rects.forEach((rect) => {
      expect(Number(rect.getAttribute('rx'))).toBeGreaterThan(0)
    })
  })

  it('renders "no data" message when tasks array is empty', () => {
    render(<GanttChart tasks={[]} theme={THEME} />)
    expect(screen.getByText('No data to display')).toBeInTheDocument()
  })

  it('does not render an SVG when tasks are empty', () => {
    const { container } = render(<GanttChart tasks={[]} theme={THEME} />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('renders all 12 month label text elements', () => {
    const { container } = render(<GanttChart tasks={TASKS} theme={THEME} />)
    // 12 month labels + task labels + status labels
    const allText = container.querySelectorAll('text')
    const monthTexts = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    monthTexts.forEach((month) => {
      expect(screen.getByText(month)).toBeInTheDocument()
    })
    // Total text nodes: 12 months + 3 task names + 3 status labels = 18
    expect(allText.length).toBe(18)
  })

  it('has an accessible role and aria-label on the SVG', () => {
    const { container } = render(<GanttChart tasks={TASKS} theme={THEME} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('role', 'img')
    expect(svg).toHaveAttribute('aria-label', 'Gantt chart')
  })

  it('renders a single task without crashing', () => {
    const single: GanttTask[] = [
      { id: 's1', name: 'Solo Task', startMonth: 6, endMonth: 6, status: 'done' },
    ]
    render(<GanttChart tasks={single} theme={THEME} />)
    expect(screen.getByText('Solo Task')).toBeInTheDocument()
  })

  it('clamps endMonth to be at least startMonth when they are equal', () => {
    const same: GanttTask[] = [
      { id: 'eq1', name: 'Same Month', startMonth: 5, endMonth: 5, status: 'planned' },
    ]
    const { container } = render(<GanttChart tasks={same} theme={THEME} />)
    const rect = container.querySelector('rect')
    // Bar width should be positive (one month wide) — not zero
    expect(Number(rect?.getAttribute('width'))).toBeGreaterThan(0)
  })
})
