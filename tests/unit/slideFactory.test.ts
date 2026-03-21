import { describe, it, expect } from 'vitest'
import { createSlide } from '../../src/services/slideFactory'
import type { SlideType } from '../../src/types/slide'

describe('createSlide', () => {
  const ALL_TYPES: SlideType[] = ['title', 'chart', 'divider', 'text', 'ending']

  it('returns a slide whose type matches the requested type', () => {
    for (const type of ALL_TYPES) {
      const slide = createSlide(type)
      expect(slide.type).toBe(type)
      expect(slide.data.type).toBe(type)
    }
  })

  it('generates a unique id for each call', () => {
    const ids = ALL_TYPES.map((t) => createSlide(t).id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ALL_TYPES.length)
  })

  it('initialises chart slides with an empty tiles array', () => {
    const slide = createSlide('chart')
    expect(slide.tiles).toEqual([])
  })

  it('non-chart slides have no tiles property', () => {
    const types: SlideType[] = ['title', 'divider', 'text', 'ending']
    for (const type of types) {
      const slide = createSlide(type)
      expect(slide.tiles).toBeUndefined()
    }
  })

  it('title slide has a heading field', () => {
    const slide = createSlide('title')
    expect(slide.data).toHaveProperty('heading')
  })

  it('divider slide has a label field', () => {
    const slide = createSlide('divider')
    expect(slide.data).toHaveProperty('label')
  })

  it('text slide has heading and body fields', () => {
    const slide = createSlide('text')
    expect(slide.data).toHaveProperty('heading')
    expect(slide.data).toHaveProperty('body')
  })

  it('ending slide has a message field', () => {
    const slide = createSlide('ending')
    expect(slide.data).toHaveProperty('message')
  })
})
