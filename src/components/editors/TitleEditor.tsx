import { Input, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import type { TitleSlideData } from '../../types/slide'
import { useReport } from '../../hooks/useReport'
import { updateSlideData } from '../../store/actions'

interface TitleEditorProps {
  slideId: string
  data: TitleSlideData
}

export function TitleEditor({ slideId, data }: TitleEditorProps) {
  const { t } = useTranslation()
  const { dispatch } = useReport()

  return (
    <div className="flex flex-col gap-4">
      <Typography.Title level={5}>{t('editors.title.sectionLabel')}</Typography.Title>

      <div className="flex flex-col gap-1">
        <label htmlFor="title-heading">{t('editors.title.heading')}</label>
        <Input
          id="title-heading"
          value={data.heading}
          onChange={(e) => dispatch(updateSlideData(slideId, { ...data, heading: e.target.value }))}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="title-subheading">{t('editors.title.subheading')}</label>
        <Input
          id="title-subheading"
          value={data.subheading ?? ''}
          onChange={(e) =>
            dispatch(updateSlideData(slideId, { ...data, subheading: e.target.value }))
          }
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="title-author">{t('editors.title.author')}</label>
        <Input
          id="title-author"
          value={data.author ?? ''}
          onChange={(e) => dispatch(updateSlideData(slideId, { ...data, author: e.target.value }))}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="title-date">{t('editors.title.date')}</label>
        <Input
          id="title-date"
          value={data.date ?? ''}
          onChange={(e) => dispatch(updateSlideData(slideId, { ...data, date: e.target.value }))}
        />
      </div>
    </div>
  )
}
