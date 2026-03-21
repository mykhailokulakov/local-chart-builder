import type { TileConfig } from '../types/layout'
import { useReport } from './useReport'

/**
 * Returns the currently selected tile within the selected slide,
 * or `null` if no tile (or no slide) is selected.
 */
export function useSelectedTile(): TileConfig | null {
  const { state } = useReport()
  const { selectedSlideId, selectedTileId, present } = state

  if (selectedSlideId === null || selectedTileId === null) return null

  const slide = present.slides.find((s) => s.id === selectedSlideId)
  if (!slide) return null

  return (slide.tiles ?? []).find((t) => t.id === selectedTileId) ?? null
}
