import { describe, it, expect } from 'vitest'
import { parseTableCsv } from '../../src/services/tableDataParser'

describe('parseTableCsv', () => {
  it('returns empty arrays for empty input', () => {
    const result = parseTableCsv('')
    expect(result.columns).toHaveLength(0)
    expect(result.rows).toHaveLength(0)
    expect(result.rowIds).toHaveLength(0)
  })

  it('returns empty arrays for whitespace-only input', () => {
    const result = parseTableCsv('   \n  ')
    expect(result.columns).toHaveLength(0)
    expect(result.rows).toHaveLength(0)
  })

  it('parses a CSV with header and data rows', () => {
    const csv = 'Name,Count\nKyiv,42\nLviv,17'
    const { columns, rows } = parseTableCsv(csv)
    expect(columns).toHaveLength(2)
    expect(columns[0]).toEqual({ key: 'col_0', header: 'Name' })
    expect(columns[1]).toEqual({ key: 'col_1', header: 'Count' })
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({ col_0: 'Kyiv', col_1: 42 })
    expect(rows[1]).toEqual({ col_0: 'Lviv', col_1: 17 })
  })

  it('parses a TSV (tab-separated) input', () => {
    const tsv = 'Region\tValue\nOdesa\t10'
    const { columns, rows } = parseTableCsv(tsv)
    expect(columns).toHaveLength(2)
    expect(rows[0]).toEqual({ col_0: 'Odesa', col_1: 10 })
  })

  it('leaves non-numeric values as strings', () => {
    const csv = 'Label,Value\nAlpha,Beta'
    const { rows } = parseTableCsv(csv)
    expect(typeof rows[0]['col_1']).toBe('string')
    expect(rows[0]['col_1']).toBe('Beta')
  })

  it('treats empty cell as empty string (not numeric)', () => {
    const csv = 'A,B\nfoo,'
    const { rows } = parseTableCsv(csv)
    expect(rows[0]['col_1']).toBe('')
  })

  it('fills missing cells with empty string', () => {
    const csv = 'A,B,C\nonly_one'
    const { rows } = parseTableCsv(csv)
    expect(rows[0]['col_1']).toBe('')
    expect(rows[0]['col_2']).toBe('')
  })

  it('generates one rowId per data row', () => {
    const csv = 'X\n1\n2\n3'
    const { rows, rowIds } = parseTableCsv(csv)
    expect(rowIds).toHaveLength(rows.length)
  })

  it('generates unique rowIds', () => {
    const csv = 'X\n1\n2\n3'
    const { rowIds } = parseTableCsv(csv)
    const unique = new Set(rowIds)
    expect(unique.size).toBe(rowIds.length)
  })

  it('uses empty string as header fallback for blank header cells', () => {
    const csv = ',B\n1,2'
    const { columns } = parseTableCsv(csv)
    // Blank header falls back to key name
    expect(columns[0].header).toBe('col_0')
  })

  it('returns only header row with no data rows when input has one line', () => {
    const csv = 'Col1,Col2'
    const { columns, rows } = parseTableCsv(csv)
    expect(columns).toHaveLength(2)
    expect(rows).toHaveLength(0)
  })
})
