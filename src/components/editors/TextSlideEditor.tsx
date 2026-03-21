import { Input, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import type { TextSlideData } from '../../types/slide'
import { useReport } from '../../hooks/useReport'
import { updateSlideData } from '../../store/actions'

interface TextSlideEditorProps {
  slideId: string
  data: TextSlideData
}

export function TextSlideEditor({ slideId, data }: TextSlideEditorProps) {
  const { t } = useTranslation()
  const { dispatch } = useReport()

  return (
    <div className="flex flex-col gap-4">
      <Typography.Title level={5}>{t('editors.textSlide.sectionLabel')}</Typography.Title>

      <div className="flex flex-col gap-1">
        <label htmlFor="textslide-heading">{t('editors.textSlide.heading')}</label>
        <Input
          id="textslide-heading"
          value={data.heading}
          onChange={(e) => dispatch(updateSlideData(slideId, { ...data, heading: e.target.value }))}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="textslide-body">{t('editors.textSlide.body')}</label>
        <Input.TextArea
          id="textslide-body"
          rows={6}
          value={data.body}
          onChange={(e) => dispatch(updateSlideData(slideId, { ...data, body: e.target.value }))}
        />
      </div>
    </div>
  )
}
