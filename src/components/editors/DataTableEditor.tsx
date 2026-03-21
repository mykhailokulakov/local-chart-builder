import { Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import type { TileConfig } from '../../types/layout'

interface DataTableEditorProps {
  tile: TileConfig
}

export function DataTableEditor({ tile }: DataTableEditorProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4">
      <Typography.Title level={5}>{t(`editors.tileType.${tile.type}`)}</Typography.Title>
      <Typography.Text type="secondary">{t('editors.comingSoon')}</Typography.Text>
    </div>
  )
}
