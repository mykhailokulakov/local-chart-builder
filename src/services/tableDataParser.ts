import type { DataTableColumn, DataTableRow } from '../types/chart'

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parses a CSV or TSV string into DataTableData-compatible columns, rows, and
 * stable row IDs.
 *
 * Supported features:
 * - Auto-detects separator: tab (TSV) or comma (CSV)
 * - Treats the first non-empty row as the header
 * - Handles missing cells gracefully (empty string)
 * - Parses numeric cell values; leaves non-numeric values as strings
 *
 * Returns empty arrays for empty input (does not throw).
 */
export function parseTableCsv(text: string): {
  columns: DataTableColumn[]
  rows: DataTableRow[]
  rowIds: string[]
} {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0)

  if (lines.length === 0) return { columns: [], rows: [], rowIds: [] }

  const separator = lines[0].includes('\t') ? '\t' : ','
  const allCells = lines.map((line) => line.split(separator).map((c) => c.trim()))

  const headers = allCells[0]
  const columns: DataTableColumn[] = headers.map((h, i) => ({
    key: `col_${String(i)}`,
    header: h || `col_${String(i)}`,
  }))

  const rows: DataTableRow[] = allCells.slice(1).map((cells) => {
    const row: DataTableRow = {}
    columns.forEach((col, i) => {
      const raw = cells[i] ?? ''
      const num = Number(raw)
      row[col.key] = raw !== '' && !isNaN(num) ? num : raw
    })
    return row
  })

  const rowIds = rows.map(() => crypto.randomUUID())

  return { columns, rows, rowIds }
}
