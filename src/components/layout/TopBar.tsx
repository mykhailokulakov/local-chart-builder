import type { CSSProperties } from 'react'
import { useCallback, useMemo } from 'react'
import { Button, Segmented, Select, Space, Tooltip, Typography } from 'antd'
import { RedoOutlined, UndoOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useReport } from '../../hooks/useReport'
import { useUndoRedo } from '../../hooks/useUndoRedo'
import { setLanguage, setTheme } from '../../store/actions'
import { ThemePreset } from '../../types/theme'
import { EXPORT_BTN_MIN_WIDTH_PX } from '../../utils/constants'

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

const TITLE_STYLE: CSSProperties = {
  margin: 0,
  color: 'rgba(255, 255, 255, 0.85)',
  whiteSpace: 'nowrap',
}

const THEME_SELECT_STYLE: CSSProperties = { width: 140 }

const EXPORT_BTN_STYLE: CSSProperties = { minWidth: EXPORT_BTN_MIN_WIDTH_PX }

const ICON_BTN_ACTIVE_STYLE: CSSProperties = { color: 'rgba(255, 255, 255, 0.85)' }
const ICON_BTN_DISABLED_STYLE: CSSProperties = {
  color: 'rgba(255, 255, 255, 0.3)',
  cursor: 'not-allowed',
}

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
      { label: 'UA', value: 'ua' as const },
      { label: 'EN', value: 'en' as const },
    ],
    [],
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
        <Tooltip title={canUndo ? undoTitle : undefined}>
          <Button
            type="text"
            icon={<UndoOutlined />}
            disabled={!canUndo}
            onClick={handleUndo}
            aria-label={undoTitle}
            style={canUndo ? ICON_BTN_ACTIVE_STYLE : ICON_BTN_DISABLED_STYLE}
          />
        </Tooltip>
        <Tooltip title={canRedo ? redoTitle : undefined}>
          <Button
            type="text"
            icon={<RedoOutlined />}
            disabled={!canRedo}
            onClick={handleRedo}
            aria-label={redoTitle}
            style={canRedo ? ICON_BTN_ACTIVE_STYLE : ICON_BTN_DISABLED_STYLE}
          />
        </Tooltip>
      </Space>

      <div style={SPACER_STYLE} />

      <Segmented
        options={languageOptions}
        value={language}
        onChange={handleLanguageChange}
        aria-label={t('language.selector')}
      />

      <Select<ThemePreset>
        options={themeOptions}
        value={currentTheme}
        onChange={handleThemeChange}
        style={THEME_SELECT_STYLE}
      />

      <Button type="primary" style={EXPORT_BTN_STYLE}>
        {t('export.exportPdf')}
      </Button>
    </div>
  )
}
