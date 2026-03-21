import type { Slide, SlideType } from '../types/slide'

/**
 * Creates a new Slide with a fresh UUID and sensible default data for the
 * given SlideType. Pure function — no React imports, no side effects.
 */
export function createSlide(type: SlideType): Slide {
  const id = crypto.randomUUID()

  switch (type) {
    case 'title':
      return { id, type, data: { type: 'title', heading: '' } }
    case 'chart':
      return { id, type, data: { type: 'chart' }, tiles: [] }
    case 'divider':
      return { id, type, data: { type: 'divider', label: '' } }
    case 'text':
      return { id, type, data: { type: 'text', heading: '', body: '' } }
    case 'ending':
      return { id, type, data: { type: 'ending', message: '' } }
  }
}
