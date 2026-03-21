import { Button, Input, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ChartSlideData } from '../../types/slide'
import type { TileConfig } from '../../types/layout'
import { useReport } from '../../hooks/useReport'
import { updateSlideData, selectTile } from '../../store/actions'

interface ChartSlideEditorProps {
  slideId: string
  data: ChartSlideData
  tiles: TileConfig[]
}

export function ChartSlideEditor({ slideId, data, tiles }: ChartSlideEditorProps) {
  const { t } = useTranslation()
  const { dispatch } = useReport()

  return (
    <div className="flex flex-col gap-4">
      <Typography.Title level={5}>{t('editors.chartSlide.sectionLabel')}</Typography.Title>

      <div className="flex flex-col gap-1">
        <label htmlFor="chartslide-title">{t('editors.chartSlide.slideTitle')}</label>
        <Input
          id="chartslide-title"
          value={data.title ?? ''}
          onChange={(e) => dispatch(updateSlideData(slideId, { ...data, title: e.target.value }))}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Typography.Text strong>{t('editors.chartSlide.tilesHeading')}</Typography.Text>
        {tiles.length === 0 ? (
          <Typography.Text type="secondary">{t('editors.chartSlide.noTiles')}</Typography.Text>
        ) : (
          <div className="flex flex-col gap-2">
            {tiles.map((tile) => (
              <div key={tile.id} className="flex items-center justify-between">
                <Typography.Text>{t(`editors.tileType.${tile.type}`)}</Typography.Text>
                <Button size="small" type="link" onClick={() => dispatch(selectTile(tile.id))}>
                  {t('editors.chartSlide.editTile')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
