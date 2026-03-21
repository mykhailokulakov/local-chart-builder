import { useTranslation } from 'react-i18next'

export function SlidePanel() {
  const { t } = useTranslation()

  return (
    <div className="flex h-full items-center justify-center p-4 text-gray-400">
      {t('panels.slidePanel')}
    </div>
  )
}
