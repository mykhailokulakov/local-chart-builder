// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parses a CSV string of the form `regionId,value` (one entry per line) into a
 * Map from region identifier to numeric value.
 *
 * Rules:
 * - Each line must contain at least one comma; lines without a comma are skipped.
 * - The value after the first comma is parsed with `parseFloat`; lines with
 *   non-numeric values are skipped.
 * - Empty lines are skipped.
 */
export function parseMapCsv(text: string): Map<string, number> {
  const result = new Map<string, number>()
  text
    .trim()
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed) return
      const idx = trimmed.indexOf(',')
      if (idx === -1) return
      const regionId = trimmed.slice(0, idx).trim()
      const value = parseFloat(trimmed.slice(idx + 1).trim())
      if (!isNaN(value)) result.set(regionId, value)
    })
  return result
}
