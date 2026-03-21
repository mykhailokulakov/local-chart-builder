import { describe, it, expect } from 'vitest'
import { createSlide, createTile } from '../../src/services/slideFactory'
import type { SlideType } from '../../src/types/slide'
import type { ChartType } from '../../src/types/chart'

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

describe('createTile', () => {
  const CHART_TYPES: ChartType[] = [
    'bar-v',
    'bar-h',
    'donut',
    'line',
    'gantt',
    'choropleth',
    'data-table',
  ]

  it('returns a tile whose type matches the requested type', () => {
    for (const type of [...CHART_TYPES, 'text' as const]) {
      expect(createTile(type).type).toBe(type)
    }
  })

  it('generates a unique id for each call', () => {
    const ids = CHART_TYPES.map((t) => createTile(t).id)
    expect(new Set(ids).size).toBe(CHART_TYPES.length)
  })

  it('default layout has positive w and h', () => {
    const tile = createTile('bar-v')
    expect(tile.layout.w).toBeGreaterThan(0)
    expect(tile.layout.h).toBeGreaterThan(0)
  })

  it('chart tiles have a points array', () => {
    for (const type of ['bar-v', 'bar-h', 'donut', 'line'] as ChartType[]) {
      const tile = createTile(type)
      expect(tile.data).toHaveProperty('points')
    }
  })

  it('gantt tile has tasks array and timeline dates', () => {
    const tile = createTile('gantt')
    expect(tile.data).toHaveProperty('tasks')
    expect(tile.data).toHaveProperty('timelineStart')
    expect(tile.data).toHaveProperty('timelineEnd')
  })

  it('choropleth tile has regions array', () => {
    const tile = createTile('choropleth')
    expect(tile.data).toHaveProperty('regions')
  })

  it('data-table tile has columns and rows arrays', () => {
    const tile = createTile('data-table')
    expect(tile.data).toHaveProperty('columns')
    expect(tile.data).toHaveProperty('rows')
  })

  it('text tile has body, alignment, and fontSize fields', () => {
    const tile = createTile('text')
    expect(tile.data).toHaveProperty('body')
    expect(tile.data).toHaveProperty('alignment')
    expect(tile.data).toHaveProperty('fontSize')
  })
})
