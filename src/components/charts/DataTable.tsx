import { useTranslation } from 'react-i18next'
import type { CSSProperties } from 'react'
import type { ThemeColors } from '../../types/theme'
import type { DataTableRow } from '../../types/chart'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABLE_FONT_SIZE_PX = 13
const HEADER_FONT_SIZE_PX = 13
const CELL_PADDING_PX = 8

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DataTableColumnDef {
  key: string
  label: string
}

export interface DataTableDisplayOptions {
  showHeader: boolean
  striped: boolean
  bordered: boolean
}

export interface DataTableProps {
  columns: DataTableColumnDef[]
  rows: DataTableRow[]
  rowKeys: string[]
  theme: ThemeColors
  options: DataTableDisplayOptions
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isNumericValue(value: string | number): boolean {
  return (
    typeof value === 'number' ||
    (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value)))
  )
}

function cellAlign(value: string | number | undefined): 'right' | 'left' {
  if (value === undefined) return 'left'
  return isNumericValue(value) ? 'right' : 'left'
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

function makeTableStyle(theme: ThemeColors, bordered: boolean): CSSProperties {
  return {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: theme.fontFamily,
    fontSize: TABLE_FONT_SIZE_PX,
    color: theme.foreground,
    background: theme.surface,
    tableLayout: 'fixed',
    border: bordered ? `1px solid ${theme.muted}` : 'none',
  }
}

function makeHeaderCellStyle(theme: ThemeColors, bordered: boolean): CSSProperties {
  return {
    padding: CELL_PADDING_PX,
    fontWeight: 700,
    fontSize: HEADER_FONT_SIZE_PX,
    color: theme.foreground,
    background: theme.background,
    textAlign: 'left',
    borderBottom: `2px solid ${theme.accent}`,
    borderRight: bordered ? `1px solid ${theme.muted}` : 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }
}

function makeDataCellStyle(
  theme: ThemeColors,
  bordered: boolean,
  align: 'left' | 'right',
  isLastCol: boolean,
): CSSProperties {
  return {
    padding: CELL_PADDING_PX,
    textAlign: align,
    borderBottom: `1px solid ${theme.muted}`,
    borderRight: bordered && !isLastCol ? `1px solid ${theme.muted}` : 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }
}

function makeRowBackground(theme: ThemeColors, rowIndex: number, striped: boolean): string {
  if (!striped) return 'transparent'
  return rowIndex % 2 === 1 ? theme.background : 'transparent'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DataTable({ columns, rows, rowKeys, theme, options }: DataTableProps) {
  const { t } = useTranslation()

  if (columns.length === 0) {
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
          fontSize: TABLE_FONT_SIZE_PX,
        }}
      >
        {t('charts.noData')}
      </div>
    )
  }

  const tableStyle = makeTableStyle(theme, options.bordered)
  const lastColIndex = columns.length - 1

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', background: theme.surface }}>
      <table style={tableStyle} aria-label={t('dataTable.ariaLabel')}>
        {options.showHeader && (
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={makeHeaderCellStyle(theme, options.bordered)}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, rowIndex) => {
            const rowBg = makeRowBackground(theme, rowIndex, options.striped)
            return (
              <tr key={rowKeys[rowIndex]} style={{ background: rowBg }}>
                {columns.map((col, colIndex) => {
                  const value = row[col.key]
                  const align = cellAlign(value)
                  const isLastCol = colIndex === lastColIndex
                  return (
                    <td
                      key={col.key}
                      style={makeDataCellStyle(theme, options.bordered, align, isLastCol)}
                    >
                      {value ?? ''}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
