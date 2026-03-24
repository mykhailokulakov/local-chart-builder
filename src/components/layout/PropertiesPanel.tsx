import type { CSSProperties, ReactElement } from 'react'
import { useCallback } from 'react'
import { Button, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import type { Slide } from '../../types/slide'
import type { TileConfig } from '../../types/layout'
import { useReport } from '../../hooks/useReport'
import { useSelectedSlide } from '../../hooks/useSelectedSlide'
import { useSelectedTile } from '../../hooks/useSelectedTile'
import { selectTile } from '../../store/actions'
import { TitleEditor } from '../editors/TitleEditor'
import { EndingEditor } from '../editors/EndingEditor'
import { DividerEditor } from '../editors/DividerEditor'
import { TextSlideEditor } from '../editors/TextSlideEditor'
import { ChartSlideEditor } from '../editors/ChartSlideEditor'
import { ChartTileEditor } from '../editors/ChartTileEditor'
import { TextTileEditor } from '../editors/TextTileEditor'
import { GanttEditor } from '../editors/GanttEditor'
import { MapEditor } from '../editors/MapEditor'
import { DataTableEditor } from '../editors/DataTableEditor'

// ---------------------------------------------------------------------------
// Module-level style constants — no inline objects in JSX
// ---------------------------------------------------------------------------

const NO_SELECTION_STYLE: CSSProperties = {
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  textAlign: 'center',
}

const TILE_EDITOR_OUTER_STYLE: CSSProperties = {
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  overflowY: 'auto',
}

const TILE_EDITOR_HEADER_STYLE: CSSProperties = {
  borderBottom: '1px solid var(--ant-color-border-secondary)',
  padding: '8px 16px',
  flexShrink: 0,
}

const BACK_BTN_STYLE: CSSProperties = { padding: 0 }

const TILE_EDITOR_CONTENT_STYLE: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: 16,
}

const SLIDE_EDITOR_STYLE: CSSProperties = {
  height: '100%',
  overflowY: 'auto',
  padding: 16,
}

// ---------------------------------------------------------------------------
// Private helpers — one per discriminated union branch
// ---------------------------------------------------------------------------

function slideEditorFor(slide: Slide): ReactElement {
  const data = slide.data
  switch (data.type) {
    case 'title':
      return <TitleEditor slideId={slide.id} data={data} />
    case 'chart':
      return <ChartSlideEditor slideId={slide.id} data={data} tiles={slide.tiles ?? []} />
    case 'divider':
      return <DividerEditor slideId={slide.id} data={data} />
    case 'text':
      return <TextSlideEditor slideId={slide.id} data={data} />
    case 'ending':
      return <EndingEditor slideId={slide.id} data={data} />
  }
}

function tileEditorFor(tile: TileConfig): ReactElement {
  switch (tile.type) {
    case 'bar-v':
    case 'bar-h':
    case 'donut':
    case 'line':
      return <ChartTileEditor tile={tile} />
    case 'gantt':
      return <GanttEditor tile={tile} />
    case 'choropleth':
      return <MapEditor tile={tile} />
    case 'data-table':
      return <DataTableEditor tile={tile} />
    case 'text':
      return <TextTileEditor tile={tile} />
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PropertiesPanel() {
  const { t } = useTranslation()
  const { dispatch } = useReport()
  const slide = useSelectedSlide()
  const tile = useSelectedTile()

  const handleBackToSlide = useCallback(() => dispatch(selectTile(null)), [dispatch])

  if (slide === null) {
    return (
      <div style={NO_SELECTION_STYLE}>
        <Typography.Text type="secondary">{t('editors.noSelection')}</Typography.Text>
      </div>
    )
  }

  if (tile !== null) {
    return (
      <div style={TILE_EDITOR_OUTER_STYLE}>
        <div style={TILE_EDITOR_HEADER_STYLE}>
          <Button type="link" onClick={handleBackToSlide} style={BACK_BTN_STYLE}>
            {t('editors.backToSlide')}
          </Button>
        </div>
        <div style={TILE_EDITOR_CONTENT_STYLE}>{tileEditorFor(tile)}</div>
      </div>
    )
  }

  return <div style={SLIDE_EDITOR_STYLE}>{slideEditorFor(slide)}</div>
}
