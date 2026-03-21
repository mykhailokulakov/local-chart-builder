import type { Slide } from '../types/slide'
import { useReport } from './useReport'

/**
 * Returns the currently selected slide, or `null` if no slide is selected
 * or the selected id no longer exists in the report.
 */
export function useSelectedSlide(): Slide | null {
  const { state } = useReport()
  const { selectedSlideId, present } = state

  if (selectedSlideId === null) return null
  return present.slides.find((s) => s.id === selectedSlideId) ?? null
}
