import { describe, it, expect } from 'vitest'
import { parseCsv } from '../../src/services/csvParser'

describe('parseCsv', () => {
  // ---------------------------------------------------------------------------
  // Happy path — comma-separated
  // ---------------------------------------------------------------------------

  it('parses a minimal two-column CSV into data points', () => {
    expect(parseCsv('Kyiv,5000000')).toEqual([{ label: 'Kyiv', value: 5000000 }])
  })

  it('parses multiple rows', () => {
    const input = 'Kyiv,5000000\nLviv,700000\nOdesa,1000000'
    expect(parseCsv(input)).toEqual([
      { label: 'Kyiv', value: 5000000 },
      { label: 'Lviv', value: 700000 },
      { label: 'Odesa', value: 1000000 },
    ])
  })

  it('detects and skips a header row when second column is non-numeric', () => {
    const input = 'City,Population\nKyiv,5000000\nLviv,700000'
    expect(parseCsv(input)).toEqual([
      { label: 'Kyiv', value: 5000000 },
      { label: 'Lviv', value: 700000 },
    ])
  })

  it('does not skip the first row when second column is numeric', () => {
    const input = 'Kyiv,5000000\nLviv,700000'
    expect(parseCsv(input)).toHaveLength(2)
    expect(parseCsv(input)[0].label).toBe('Kyiv')
  })

  // ---------------------------------------------------------------------------
  // Happy path — tab-separated
  // ---------------------------------------------------------------------------

  it('auto-detects tab separator (TSV)', () => {
    const input = 'Kyiv\t5000000\nLviv\t700000'
    expect(parseCsv(input)).toEqual([
      { label: 'Kyiv', value: 5000000 },
      { label: 'Lviv', value: 700000 },
    ])
  })

  it('skips TSV header when second column is non-numeric', () => {
    const input = 'City\tPopulation\nKyiv\t5000000'
    expect(parseCsv(input)).toEqual([{ label: 'Kyiv', value: 5000000 }])
  })

  // ---------------------------------------------------------------------------
  // Empty lines
  // ---------------------------------------------------------------------------

  it('ignores empty lines', () => {
    const input = '\nKyiv,5000000\n\nLviv,700000\n'
    expect(parseCsv(input)).toHaveLength(2)
  })

  it('ignores whitespace-only lines', () => {
    const input = 'Kyiv,5000000\n   \nLviv,700000'
    expect(parseCsv(input)).toHaveLength(2)
  })

  // ---------------------------------------------------------------------------
  // Quoted fields (RFC 4180)
  // ---------------------------------------------------------------------------

  it('handles quoted fields containing commas', () => {
    const input = '"Kyiv, UA",5000000'
    expect(parseCsv(input)).toEqual([{ label: 'Kyiv, UA', value: 5000000 }])
  })

  it('handles escaped double-quotes inside quoted fields', () => {
    const input = '"City ""A""",42'
    expect(parseCsv(input)).toEqual([{ label: 'City "A"', value: 42 }])
  })

  it('handles quoted numeric values', () => {
    const input = 'Kyiv,"5000000"'
    expect(parseCsv(input)).toEqual([{ label: 'Kyiv', value: 5000000 }])
  })

  // ---------------------------------------------------------------------------
  // Number formats
  // ---------------------------------------------------------------------------

  it('parses floating-point values with dot decimal', () => {
    expect(parseCsv('Rate,3.14')[0].value).toBeCloseTo(3.14)
  })

  it('parses European decimal notation (comma as decimal separator)', () => {
    expect(parseCsv('Rate\t3,14')[0].value).toBeCloseTo(3.14)
  })

  it('parses European decimal with one decimal place', () => {
    expect(parseCsv('Rate\t1,5')[0].value).toBeCloseTo(1.5)
  })

  it('handles comma thousands separator in a quoted value: "1,500" → 1500', () => {
    // In comma-separated CSV, thousands-separated numbers must be quoted.
    // parseLine removes quotes; parseNumber then strips comma → 1500.
    expect(parseCsv('Items,"1,500"')).toEqual([{ label: 'Items', value: 1500 }])
  })

  it('parses negative numbers', () => {
    expect(parseCsv('Delta,-42')[0].value).toBe(-42)
  })

  it('parses zero', () => {
    expect(parseCsv('Empty,0')[0].value).toBe(0)
  })

  it('trims whitespace from labels and values', () => {
    expect(parseCsv('  Kyiv  ,  5000000  ')).toEqual([{ label: 'Kyiv', value: 5000000 }])
  })

  // ---------------------------------------------------------------------------
  // CRLF line endings
  // ---------------------------------------------------------------------------

  it('handles Windows CRLF line endings', () => {
    const input = 'Kyiv,5000000\r\nLviv,700000'
    expect(parseCsv(input)).toHaveLength(2)
  })

  // ---------------------------------------------------------------------------
  // Error cases
  // ---------------------------------------------------------------------------

  it('throws on empty input', () => {
    expect(() => parseCsv('')).toThrow('empty')
  })

  it('throws on whitespace-only input', () => {
    expect(() => parseCsv('   \n  ')).toThrow('empty')
  })

  it('throws when a row has fewer than 2 columns', () => {
    expect(() => parseCsv('OnlyOneColumn')).toThrow('Row 1')
  })

  it('throws when value column is not a number', () => {
    // Use a header row so the data row reaches value parsing (a single row with
    // a non-numeric second column would be treated as a header and skipped).
    expect(() => parseCsv('City,Population\nKyiv,NotANumber')).toThrow('not a valid number')
  })

  it('throws when label is empty', () => {
    expect(() => parseCsv(',5000')).toThrow('label column is empty')
  })

  it('provides the row number in error messages', () => {
    const input = 'A,1\nB,bad'
    expect(() => parseCsv(input)).toThrow('Row 2')
  })

  it('throws if only a header row exists and no data follows', () => {
    expect(() => parseCsv('City,Population')).toThrow('No data rows')
  })
})
