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

function slideEditorFor(slide: Slide): React.ReactElement {
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

function tileEditorFor(slideId: string, tile: TileConfig): React.ReactElement {
  switch (tile.type) {
    case 'bar-v':
    case 'bar-h':
    case 'donut':
    case 'line':
      return <ChartTileEditor slideId={slideId} tile={tile} />
    case 'gantt':
      return <GanttEditor slideId={slideId} tile={tile} />
    case 'choropleth':
      return <MapEditor slideId={slideId} tile={tile} />
    case 'data-table':
      return <DataTableEditor slideId={slideId} tile={tile} />
    case 'text':
      return <TextTileEditor slideId={slideId} tile={tile} />
  }
}

export function PropertiesPanel() {
  const { t } = useTranslation()
  const { dispatch } = useReport()
  const slide = useSelectedSlide()
  const tile = useSelectedTile()

  if (slide === null) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center">
        <Typography.Text type="secondary">{t('editors.noSelection')}</Typography.Text>
      </div>
    )
  }

  if (tile !== null) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="border-b px-4 py-2">
          <Button type="link" onClick={() => dispatch(selectTile(null))} className="p-0">
            {t('editors.backToSlide')}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{tileEditorFor(slide.id, tile)}</div>
      </div>
    )
  }

  return <div className="h-full overflow-y-auto p-4">{slideEditorFor(slide)}</div>
}
