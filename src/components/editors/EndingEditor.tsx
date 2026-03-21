import { Input, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import type { EndingSlideData } from '../../types/slide'
import { useReport } from '../../hooks/useReport'
import { updateSlideData } from '../../store/actions'

interface EndingEditorProps {
  slideId: string
  data: EndingSlideData
}

export function EndingEditor({ slideId, data }: EndingEditorProps) {
  const { t } = useTranslation()
  const { dispatch } = useReport()

  return (
    <div className="flex flex-col gap-4">
      <Typography.Title level={5}>{t('editors.ending.sectionLabel')}</Typography.Title>

      <div className="flex flex-col gap-1">
        <label htmlFor="ending-message">{t('editors.ending.message')}</label>
        <Input
          id="ending-message"
          value={data.message}
          onChange={(e) => dispatch(updateSlideData(slideId, { ...data, message: e.target.value }))}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="ending-contact">{t('editors.ending.contact')}</label>
        <Input
          id="ending-contact"
          value={data.contact ?? ''}
          onChange={(e) => dispatch(updateSlideData(slideId, { ...data, contact: e.target.value }))}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="ending-footnote">{t('editors.ending.footnote')}</label>
        <Input
          id="ending-footnote"
          value={data.footnote ?? ''}
          onChange={(e) =>
            dispatch(updateSlideData(slideId, { ...data, footnote: e.target.value }))
          }
        />
      </div>
    </div>
  )
}
