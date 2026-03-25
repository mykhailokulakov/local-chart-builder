import { describe, it, expect } from 'vitest'
import { parseMapCsv } from '../../src/services/mapDataParser'

describe('parseMapCsv', () => {
  it('returns an empty map for empty input', () => {
    expect(parseMapCsv('').size).toBe(0)
  })

  it('returns an empty map for whitespace-only input', () => {
    expect(parseMapCsv('   \n  ').size).toBe(0)
  })

  it('parses a single valid entry', () => {
    const result = parseMapCsv('kyiv,42')
    expect(result.get('kyiv')).toBe(42)
  })

  it('parses multiple entries', () => {
    const result = parseMapCsv('kyiv,42\nlviv,17\nodesa,8.5')
    expect(result.get('kyiv')).toBe(42)
    expect(result.get('lviv')).toBe(17)
    expect(result.get('odesa')).toBe(8.5)
  })

  it('trims whitespace around regionId and value', () => {
    const result = parseMapCsv('  kyiv  , 42 ')
    expect(result.get('kyiv')).toBe(42)
  })

  it('skips lines without a comma', () => {
    const result = parseMapCsv('kyiv42\nlviv,17')
    expect(result.has('kyiv42')).toBe(false)
    expect(result.get('lviv')).toBe(17)
  })

  it('skips lines with non-numeric value', () => {
    const result = parseMapCsv('kyiv,notanumber\nlviv,17')
    expect(result.has('kyiv')).toBe(false)
    expect(result.get('lviv')).toBe(17)
  })

  it('skips empty lines', () => {
    const result = parseMapCsv('kyiv,42\n\nlviv,17')
    expect(result.size).toBe(2)
  })

  it('uses the first comma as the split point (regionId may not contain commas)', () => {
    const result = parseMapCsv('region-a,100')
    expect(result.get('region-a')).toBe(100)
  })
})
