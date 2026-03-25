import type { ChartDataPoint } from '../types/chart'

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parses a CSV or TSV string into an array of ChartDataPoint objects.
 *
 * Supported features:
 * - Auto-detects separator: tab (TSV) or comma (CSV)
 * - Skips empty lines
 * - Detects and skips a header row (non-numeric second column)
 * - Handles quoted fields per RFC 4180 (including embedded commas and newlines)
 * - Accepts European decimal notation (comma decimal separator, e.g. "3,14")
 *
 * @throws {Error} with a descriptive message for malformed input
 */
export function parseCsv(raw: string): ChartDataPoint[] {
  const lines = raw.split(/\r?\n/)
  const nonEmpty = lines.filter((l) => l.trim().length > 0)

  if (nonEmpty.length === 0) {
    throw new Error('CSV input is empty')
  }

  // Auto-detect: use tab if any non-empty line contains a tab, else comma.
  const separator = nonEmpty.some((l) => l.includes('\t')) ? '\t' : ','

  const rows = nonEmpty.map((line, idx) => {
    const cols = parseLine(line, separator)
    if (cols.length < 2) {
      throw new Error(
        `Row ${String(idx + 1)}: expected at least 2 columns, got ${String(cols.length)}`,
      )
    }
    return cols
  })

  // Header detection: first row is a header if its second column is not numeric.
  const dataRows = isNumericString(rows[0][1].trim()) ? rows : rows.slice(1)

  if (dataRows.length === 0) {
    throw new Error('No data rows found after skipping header')
  }

  return dataRows.map((cols, idx) => {
    const label = cols[0].trim()
    const valueRaw = cols[1].trim()

    if (label.length === 0) {
      throw new Error(`Row ${String(idx + 1)}: label column is empty`)
    }

    const value = parseNumber(valueRaw)
    if (isNaN(value)) {
      throw new Error(`Row ${String(idx + 1)}: "${valueRaw}" is not a valid number`)
    }

    return { label, value }
  })
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Splits a single line into fields, respecting RFC 4180 quoting.
 * Handles escaped double-quotes ("") inside quoted fields.
 */
function parseLine(line: string, separator: string): string[] {
  const cols: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote inside quoted field
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === separator && !inQuotes) {
      cols.push(current)
      current = ''
    } else {
      current += ch
    }
  }

  cols.push(current)
  return cols
}

/**
 * Returns true if the trimmed string can be parsed as a finite number
 * under either standard or European decimal notation.
 */
function isNumericString(s: string): boolean {
  return s.length > 0 && isFinite(parseNumber(s))
}

/**
 * Parses a numeric string supporting:
 * - Standard notation: "1500", "1.5", "-3.14"
 * - European decimal notation with 1–2 decimal places: "1,5", "3,14"
 * - Comma-as-thousands-separator is removed for 3+ digit groups: "1,500"
 *
 * European decimal is detected when a comma is followed by exactly 1–2 digits
 * at the end of the string (i.e. the comma is the decimal separator, not thousands).
 */
function parseNumber(raw: string): number {
  const s = raw.trim()

  // European decimal: optional minus, digits, comma, exactly 1–2 decimal digits
  if (/^-?\d+,\d{1,2}$/.test(s)) {
    return parseFloat(s.replace(',', '.'))
  }

  // Remove commas used as thousands separators, then parse normally
  return parseFloat(s.replace(/,/g, ''))
}
