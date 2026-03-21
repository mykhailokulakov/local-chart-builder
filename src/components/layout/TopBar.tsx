import type { CSSProperties } from 'react'
import { useCallback, useMemo } from 'react'
import { Button, Segmented, Select, Space, Tooltip, Typography } from 'antd'
import { RedoOutlined, UndoOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useReport } from '../../hooks/useReport'
import { useUndoRedo } from '../../hooks/useUndoRedo'
import { setLanguage, setTheme } from '../../store/actions'
import { ThemePreset } from '../../types/theme'

// ---------------------------------------------------------------------------
// Module-level style constants — no inline objects in JSX
// ---------------------------------------------------------------------------

const CONTAINER_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
}

const SPACER_STYLE: CSSProperties = { flex: 1 }

const TITLE_STYLE: CSSProperties = { margin: 0, color: 'inherit', whiteSpace: 'nowrap' }

const THEME_SELECT_STYLE: CSSProperties = { width: 140 }

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TopBar() {
  const { t, i18n } = useTranslation()
  const { state, dispatch } = useReport()
  const { canUndo, canRedo, undo: handleUndo, redo: handleRedo } = useUndoRedo()

  const language = state.present.language
  const currentTheme = state.present.theme

  const languageOptions = useMemo(
    () => [
      { label: t('language.ua'), value: 'ua' as const },
      { label: t('language.en'), value: 'en' as const },
    ],
    [t],
  )

  const themeOptions = useMemo(
    () => [
      { value: ThemePreset.dark, label: t('themes.dark') },
      { value: ThemePreset.mindigit, label: t('themes.mindigit') },
      { value: ThemePreset.light, label: t('themes.light') },
      { value: ThemePreset.slate, label: t('themes.slate') },
    ],
    [t],
  )

  const handleLanguageChange = useCallback(
    (value: string | number): void => {
      if (value === 'ua' || value === 'en') {
        dispatch(setLanguage(value))
        void i18n.changeLanguage(value)
      }
    },
    [dispatch, i18n],
  )

  const handleThemeChange = useCallback(
    (value: ThemePreset): void => {
      dispatch(setTheme(value))
    },
    [dispatch],
  )

  const undoTitle = `${t('toolbar.undo')} (${t('toolbar.undoHint')})`
  const redoTitle = `${t('toolbar.redo')} (${t('toolbar.redoHint')})`

  return (
    <div style={CONTAINER_STYLE}>
      <Typography.Title level={5} style={TITLE_STYLE}>
        {t('app.title')}
      </Typography.Title>

      <Space size="small">
        <Tooltip title={undoTitle}>
          <Button
            icon={<UndoOutlined />}
            disabled={!canUndo}
            onClick={handleUndo}
            aria-label={undoTitle}
          />
        </Tooltip>
        <Tooltip title={redoTitle}>
          <Button
            icon={<RedoOutlined />}
            disabled={!canRedo}
            onClick={handleRedo}
            aria-label={redoTitle}
          />
        </Tooltip>
      </Space>

      <div style={SPACER_STYLE} />

      <Segmented
        options={languageOptions}
        value={language}
        onChange={handleLanguageChange}
        aria-label={t('language.ua')}
      />

      <Select<ThemePreset>
        options={themeOptions}
        value={currentTheme}
        onChange={handleThemeChange}
        style={THEME_SELECT_STYLE}
      />

      <Button type="primary">{t('export.exportPdf')}</Button>
    </div>
  )
}
