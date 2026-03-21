import { Input, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import type { DividerSlideData } from '../../types/slide'
import { useReport } from '../../hooks/useReport'
import { updateSlideData } from '../../store/actions'

interface DividerEditorProps {
  slideId: string
  data: DividerSlideData
}

export function DividerEditor({ slideId, data }: DividerEditorProps) {
  const { t } = useTranslation()
  const { dispatch } = useReport()

  return (
    <div className="flex flex-col gap-4">
      <Typography.Title level={5}>{t('editors.divider.sectionLabel')}</Typography.Title>

      <div className="flex flex-col gap-1">
        <label htmlFor="divider-label">{t('editors.divider.label')}</label>
        <Input
          id="divider-label"
          value={data.label}
          onChange={(e) => dispatch(updateSlideData(slideId, { ...data, label: e.target.value }))}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="divider-description">{t('editors.divider.description')}</label>
        <Input
          id="divider-description"
          value={data.description ?? ''}
          onChange={(e) =>
            dispatch(updateSlideData(slideId, { ...data, description: e.target.value }))
          }
        />
      </div>
    </div>
  )
}
