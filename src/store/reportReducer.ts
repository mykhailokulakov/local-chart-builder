import type { Report } from '../types/slide'
import type {
  ReportAction,
  AddSlideAction,
  RemoveSlideAction,
  ReorderSlideAction,
  UpdateSlideDataAction,
  AddTileAction,
  RemoveTileAction,
  UpdateTileDataAction,
  UpdateTileLayoutAction,
  UpdateTileOptionsAction,
  UpdateTileTypeAction,
  SetThemeAction,
  SetLanguageAction,
} from './actions'
import { ThemePreset } from '../types/theme'

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const initialReport: Report = {
  slides: [],
  theme: ThemePreset.light,
  language: 'ua',
}

// ---------------------------------------------------------------------------
// Individual action handlers (pure functions)
// ---------------------------------------------------------------------------

function handleAddSlide(report: Report, action: AddSlideAction): Report {
  return { ...report, slides: [...report.slides, action.payload.slide] }
}

function handleRemoveSlide(report: Report, action: RemoveSlideAction): Report {
  return {
    ...report,
    slides: report.slides.filter((s) => s.id !== action.payload.slideId),
  }
}

function handleReorderSlide(report: Report, action: ReorderSlideAction): Report {
  const { fromIndex, toIndex } = action.payload
  const slides = report.slides
  const lastIndex = slides.length - 1

  // Clamp indices to valid range
  const from = Math.max(0, Math.min(fromIndex, lastIndex))
  const to = Math.max(0, Math.min(toIndex, lastIndex))

  if (from === to || slides.length === 0) return report

  const reordered = [...slides]
  const [moved] = reordered.splice(from, 1)
  reordered.splice(to, 0, moved)

  return { ...report, slides: reordered }
}

function handleUpdateSlideData(report: Report, action: UpdateSlideDataAction): Report {
  const { slideId, data } = action.payload
  const index = report.slides.findIndex((s) => s.id === slideId)
  if (index === -1) return report

  const updated = [...report.slides]
  updated[index] = { ...updated[index], data }

  return { ...report, slides: updated }
}

function handleAddTile(report: Report, action: AddTileAction): Report {
  const { slideId, tile } = action.payload
  const index = report.slides.findIndex((s) => s.id === slideId)
  if (index === -1) return report

  const slide = report.slides[index]
  const updatedSlide = { ...slide, tiles: [...(slide.tiles ?? []), tile] }
  const updated = [...report.slides]
  updated[index] = updatedSlide

  return { ...report, slides: updated }
}

function handleRemoveTile(report: Report, action: RemoveTileAction): Report {
  const { slideId, tileId } = action.payload
  const index = report.slides.findIndex((s) => s.id === slideId)
  if (index === -1) return report

  const slide = report.slides[index]
  const updatedSlide = {
    ...slide,
    tiles: (slide.tiles ?? []).filter((t) => t.id !== tileId),
  }
  const updated = [...report.slides]
  updated[index] = updatedSlide

  return { ...report, slides: updated }
}

function handleUpdateTileData(report: Report, action: UpdateTileDataAction): Report {
  const { slideId, tileId, data } = action.payload
  const slideIndex = report.slides.findIndex((s) => s.id === slideId)
  if (slideIndex === -1) return report

  const slide = report.slides[slideIndex]
  const tiles = slide.tiles ?? []
  const tileIndex = tiles.findIndex((t) => t.id === tileId)
  if (tileIndex === -1) return report

  const updatedTiles = [...tiles]
  updatedTiles[tileIndex] = { ...updatedTiles[tileIndex], data }

  const updated = [...report.slides]
  updated[slideIndex] = { ...slide, tiles: updatedTiles }

  return { ...report, slides: updated }
}

function handleUpdateTileLayout(report: Report, action: UpdateTileLayoutAction): Report {
  const { slideId, tileId, layout } = action.payload
  const slideIndex = report.slides.findIndex((s) => s.id === slideId)
  if (slideIndex === -1) return report

  const slide = report.slides[slideIndex]
  const tiles = slide.tiles ?? []
  const tileIndex = tiles.findIndex((t) => t.id === tileId)
  if (tileIndex === -1) return report

  const updatedTiles = [...tiles]
  updatedTiles[tileIndex] = { ...updatedTiles[tileIndex], layout }

  const updated = [...report.slides]
  updated[slideIndex] = { ...slide, tiles: updatedTiles }

  return { ...report, slides: updated }
}

function handleUpdateTileOptions(report: Report, action: UpdateTileOptionsAction): Report {
  const { slideId, tileId, options } = action.payload
  const slideIndex = report.slides.findIndex((s) => s.id === slideId)
  if (slideIndex === -1) return report

  const slide = report.slides[slideIndex]
  const tiles = slide.tiles ?? []
  const tileIndex = tiles.findIndex((t) => t.id === tileId)
  if (tileIndex === -1) return report

  const updatedTiles = [...tiles]
  updatedTiles[tileIndex] = { ...updatedTiles[tileIndex], options }

  const updated = [...report.slides]
  updated[slideIndex] = { ...slide, tiles: updatedTiles }

  return { ...report, slides: updated }
}

function handleUpdateTileType(report: Report, action: UpdateTileTypeAction): Report {
  const { slideId, tileId, tileType, data } = action.payload
  const slideIndex = report.slides.findIndex((s) => s.id === slideId)
  if (slideIndex === -1) return report

  const slide = report.slides[slideIndex]
  const tiles = slide.tiles ?? []
  const tileIndex = tiles.findIndex((t) => t.id === tileId)
  if (tileIndex === -1) return report

  const updatedTiles = [...tiles]
  updatedTiles[tileIndex] = { ...updatedTiles[tileIndex], type: tileType, data }

  const updated = [...report.slides]
  updated[slideIndex] = { ...slide, tiles: updatedTiles }

  return { ...report, slides: updated }
}

function handleSetTheme(report: Report, action: SetThemeAction): Report {
  return { ...report, theme: action.payload.theme }
}

function handleSetLanguage(report: Report, action: SetLanguageAction): Report {
  return { ...report, language: action.payload.language }
}

// ---------------------------------------------------------------------------
// Main reducer
// ---------------------------------------------------------------------------

export function reportReducer(report: Report, action: ReportAction): Report {
  switch (action.type) {
    case 'ADD_SLIDE':
      return handleAddSlide(report, action)
    case 'REMOVE_SLIDE':
      return handleRemoveSlide(report, action)
    case 'REORDER_SLIDE':
      return handleReorderSlide(report, action)
    case 'UPDATE_SLIDE_DATA':
      return handleUpdateSlideData(report, action)
    case 'ADD_TILE':
      return handleAddTile(report, action)
    case 'REMOVE_TILE':
      return handleRemoveTile(report, action)
    case 'UPDATE_TILE_DATA':
      return handleUpdateTileData(report, action)
    case 'UPDATE_TILE_LAYOUT':
      return handleUpdateTileLayout(report, action)
    case 'UPDATE_TILE_OPTIONS':
      return handleUpdateTileOptions(report, action)
    case 'UPDATE_TILE_TYPE':
      return handleUpdateTileType(report, action)
    case 'SET_THEME':
      return handleSetTheme(report, action)
    case 'SET_LANGUAGE':
      return handleSetLanguage(report, action)
    // UI-only actions do not touch Report
    case 'SELECT_SLIDE':
    case 'SELECT_TILE':
    case 'UNDO':
    case 'REDO':
      return report
  }
}
