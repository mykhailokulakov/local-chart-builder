import { useTranslation } from 'react-i18next'

export function Canvas() {
  const { t } = useTranslation()

  return (
    <div className="flex h-full items-center justify-center p-4 text-gray-400">
      {t('panels.canvas')}
    </div>
  )
}
