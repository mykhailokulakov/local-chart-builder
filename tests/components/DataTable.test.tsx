import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DataTable } from '../../src/components/charts/DataTable'
import type {
  DataTableColumnDef,
  DataTableDisplayOptions,
} from '../../src/components/charts/DataTable'
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
  background: '#ffffff',
  surface: '#f3f4f6',
  foreground: '#111827',
  muted: '#6b7280',
  foregroundTertiary: 'rgba(26,26,46,0.27)',
  accent: '#2563eb',
  rule: 'rgba(26,26,46,0.07)',
  chartSecondary: '#D4D0F0',
  backgroundStatement: '#ffffff',
  foregroundStatement: '#111827',
  accentStatement: '#2563eb',
  titleLine2Color: '#2563eb',
  chartColors: ['#16a34a', '#ea580c'],
  fontFamily: 'sans-serif',
}

const COLUMNS: DataTableColumnDef[] = [
  { key: 'name', label: 'Name' },
  { key: 'count', label: 'Count' },
]

const ROWS = [
  { name: 'Kyiv', count: 42 },
  { name: 'Lviv', count: 17 },
]

const ROW_KEYS = ['row-key-1', 'row-key-2']

const DEFAULT_OPTIONS: DataTableDisplayOptions = {
  showHeader: true,
  striped: false,
  bordered: false,
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DataTable', () => {
  it('renders without crashing with valid data', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        rowKeys={ROW_KEYS}
        theme={THEME}
        options={DEFAULT_OPTIONS}
      />,
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('shows no-data message when columns array is empty', () => {
    render(
      <DataTable columns={[]} rows={[]} rowKeys={[]} theme={THEME} options={DEFAULT_OPTIONS} />,
    )
    expect(screen.getByText('No data to display')).toBeInTheDocument()
  })

  it('renders header row when showHeader is true', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        rowKeys={ROW_KEYS}
        theme={THEME}
        options={DEFAULT_OPTIONS}
      />,
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Count')).toBeInTheDocument()
  })

  it('does not render thead when showHeader is false', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        rowKeys={ROW_KEYS}
        theme={THEME}
        options={{ ...DEFAULT_OPTIONS, showHeader: false }}
      />,
    )
    expect(screen.queryByRole('columnheader')).toBeNull()
  })

  it('renders all row data cells', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        rowKeys={ROW_KEYS}
        theme={THEME}
        options={DEFAULT_OPTIONS}
      />,
    )
    expect(screen.getByText('Kyiv')).toBeInTheDocument()
    expect(screen.getByText('Lviv')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('17')).toBeInTheDocument()
  })

  it('right-aligns numeric cells and left-aligns text cells', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        rowKeys={ROW_KEYS}
        theme={THEME}
        options={DEFAULT_OPTIONS}
      />,
    )
    const cells = screen.getAllByRole('cell')
    // Row 0: name=Kyiv (left), count=42 (right)
    const kyivCell = cells.find((c) => c.textContent === 'Kyiv')
    const countCell = cells.find((c) => c.textContent === '42')
    expect(kyivCell).toHaveStyle({ textAlign: 'left' })
    expect(countCell).toHaveStyle({ textAlign: 'right' })
  })

  it('renders an empty table when rows array is empty', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={[]}
        rowKeys={[]}
        theme={THEME}
        options={DEFAULT_OPTIONS}
      />,
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.queryByRole('cell')).toBeNull()
  })

  it('renders correct number of rows', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        rowKeys={ROW_KEYS}
        theme={THEME}
        options={DEFAULT_OPTIONS}
      />,
    )
    const rows = screen.getAllByRole('row')
    // 1 header row + 2 data rows
    expect(rows).toHaveLength(3)
  })

  it('renders correct number of rows without header', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        rowKeys={ROW_KEYS}
        theme={THEME}
        options={{ ...DEFAULT_OPTIONS, showHeader: false }}
      />,
    )
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(2)
  })

  it('applies table border styles when bordered is true', () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        rowKeys={ROW_KEYS}
        theme={THEME}
        options={{ ...DEFAULT_OPTIONS, bordered: true }}
      />,
    )
    const table = screen.getByRole('table')
    // jsdom doesn't expand border shorthand; check the style attribute directly
    expect(table.getAttribute('style')).toContain('solid')
  })

  it('renders cells with empty string for missing keys', () => {
    const incompleteRows = [{ name: 'Kyiv' }]
    render(
      <DataTable
        columns={COLUMNS}
        rows={incompleteRows}
        rowKeys={['row-key-1']}
        theme={THEME}
        options={DEFAULT_OPTIONS}
      />,
    )
    const cells = screen.getAllByRole('cell')
    // Second cell should be empty (count key missing)
    expect(cells[1].textContent).toBe('')
  })
})
