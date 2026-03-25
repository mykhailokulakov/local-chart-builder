import type { Slide, SlideData } from '../types/slide'
import type { TileConfig, TileData, GridLayout } from '../types/layout'
import type { ChartOptions, ChartType } from '../types/chart'
import type { ThemePreset } from '../types/theme'

// ---------------------------------------------------------------------------
// Action type literals
// ---------------------------------------------------------------------------

export const ADD_SLIDE = 'ADD_SLIDE' as const
export const REMOVE_SLIDE = 'REMOVE_SLIDE' as const
export const REORDER_SLIDE = 'REORDER_SLIDE' as const
export const UPDATE_SLIDE_DATA = 'UPDATE_SLIDE_DATA' as const
export const SELECT_SLIDE = 'SELECT_SLIDE' as const
export const SELECT_TILE = 'SELECT_TILE' as const
export const ADD_TILE = 'ADD_TILE' as const
export const REMOVE_TILE = 'REMOVE_TILE' as const
export const UPDATE_TILE_DATA = 'UPDATE_TILE_DATA' as const
export const UPDATE_TILE_LAYOUT = 'UPDATE_TILE_LAYOUT' as const
export const SET_THEME = 'SET_THEME' as const
export const SET_LANGUAGE = 'SET_LANGUAGE' as const
export const UPDATE_TILE_OPTIONS = 'UPDATE_TILE_OPTIONS' as const
export const UPDATE_TILE_TYPE = 'UPDATE_TILE_TYPE' as const
export const UNDO = 'UNDO' as const
export const REDO = 'REDO' as const

// ---------------------------------------------------------------------------
// Action interfaces
// ---------------------------------------------------------------------------

export interface AddSlideAction {
  type: typeof ADD_SLIDE
  payload: { slide: Slide }
}

export interface RemoveSlideAction {
  type: typeof REMOVE_SLIDE
  payload: { slideId: string }
}

export interface ReorderSlideAction {
  type: typeof REORDER_SLIDE
  payload: { fromIndex: number; toIndex: number }
}

export interface UpdateSlideDataAction {
  type: typeof UPDATE_SLIDE_DATA
  payload: { slideId: string; data: SlideData }
}

export interface SelectSlideAction {
  type: typeof SELECT_SLIDE
  payload: { slideId: string | null }
}

export interface SelectTileAction {
  type: typeof SELECT_TILE
  payload: { tileId: string | null }
}

export interface AddTileAction {
  type: typeof ADD_TILE
  payload: { slideId: string; tile: TileConfig }
}

export interface RemoveTileAction {
  type: typeof REMOVE_TILE
  payload: { slideId: string; tileId: string }
}

export interface UpdateTileDataAction {
  type: typeof UPDATE_TILE_DATA
  payload: { slideId: string; tileId: string; data: TileData }
}

export interface UpdateTileLayoutAction {
  type: typeof UPDATE_TILE_LAYOUT
  payload: { slideId: string; tileId: string; layout: GridLayout }
}

export interface SetThemeAction {
  type: typeof SET_THEME
  payload: { theme: ThemePreset }
}

export interface SetLanguageAction {
  type: typeof SET_LANGUAGE
  payload: { language: 'ua' | 'en' }
}

export interface UpdateTileOptionsAction {
  type: typeof UPDATE_TILE_OPTIONS
  payload: { slideId: string; tileId: string; options: ChartOptions }
}

export interface UpdateTileTypeAction {
  type: typeof UPDATE_TILE_TYPE
  payload: { slideId: string; tileId: string; tileType: ChartType | 'text'; data: TileData }
}

export interface UndoAction {
  type: typeof UNDO
}

export interface RedoAction {
  type: typeof REDO
}

// ---------------------------------------------------------------------------
// Discriminated union of all actions
// ---------------------------------------------------------------------------

export type ReportAction =
  | AddSlideAction
  | RemoveSlideAction
  | ReorderSlideAction
  | UpdateSlideDataAction
  | SelectSlideAction
  | SelectTileAction
  | AddTileAction
  | RemoveTileAction
  | UpdateTileDataAction
  | UpdateTileLayoutAction
  | UpdateTileOptionsAction
  | UpdateTileTypeAction
  | SetThemeAction
  | SetLanguageAction
  | UndoAction
  | RedoAction

// ---------------------------------------------------------------------------
// Action creators
// ---------------------------------------------------------------------------

export const addSlide = (slide: Slide): AddSlideAction => ({
  type: ADD_SLIDE,
  payload: { slide },
})

export const removeSlide = (slideId: string): RemoveSlideAction => ({
  type: REMOVE_SLIDE,
  payload: { slideId },
})

export const reorderSlide = (fromIndex: number, toIndex: number): ReorderSlideAction => ({
  type: REORDER_SLIDE,
  payload: { fromIndex, toIndex },
})

export const updateSlideData = (slideId: string, data: SlideData): UpdateSlideDataAction => ({
  type: UPDATE_SLIDE_DATA,
  payload: { slideId, data },
})

export const selectSlide = (slideId: string | null): SelectSlideAction => ({
  type: SELECT_SLIDE,
  payload: { slideId },
})

export const selectTile = (tileId: string | null): SelectTileAction => ({
  type: SELECT_TILE,
  payload: { tileId },
})

export const addTile = (slideId: string, tile: TileConfig): AddTileAction => ({
  type: ADD_TILE,
  payload: { slideId, tile },
})

export const removeTile = (slideId: string, tileId: string): RemoveTileAction => ({
  type: REMOVE_TILE,
  payload: { slideId, tileId },
})

export const updateTileData = (
  slideId: string,
  tileId: string,
  data: TileData,
): UpdateTileDataAction => ({
  type: UPDATE_TILE_DATA,
  payload: { slideId, tileId, data },
})

export const updateTileLayout = (
  slideId: string,
  tileId: string,
  layout: GridLayout,
): UpdateTileLayoutAction => ({
  type: UPDATE_TILE_LAYOUT,
  payload: { slideId, tileId, layout },
})

export const setTheme = (theme: ThemePreset): SetThemeAction => ({
  type: SET_THEME,
  payload: { theme },
})

export const setLanguage = (language: 'ua' | 'en'): SetLanguageAction => ({
  type: SET_LANGUAGE,
  payload: { language },
})

export const updateTileOptions = (
  slideId: string,
  tileId: string,
  options: ChartOptions,
): UpdateTileOptionsAction => ({
  type: UPDATE_TILE_OPTIONS,
  payload: { slideId, tileId, options },
})

export const updateTileType = (
  slideId: string,
  tileId: string,
  tileType: ChartType | 'text',
  data: TileData,
): UpdateTileTypeAction => ({
  type: UPDATE_TILE_TYPE,
  payload: { slideId, tileId, tileType, data },
})

export const undo = (): UndoAction => ({ type: UNDO })

export const redo = (): RedoAction => ({ type: REDO })
