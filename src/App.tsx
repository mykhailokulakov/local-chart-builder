import { ConfigProvider } from 'antd'
import type { ThemeConfig } from 'antd'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/config'
import { ReportProvider } from './store/ReportContext'
import { AppShell } from './components/layout/AppShell'
import { SHELL_HEADER_BG } from './utils/constants'

// ---------------------------------------------------------------------------
// Ant Design shell theme — drives the editor UI chrome only.
//
// Two separate theme layers exist in this application:
//   1. Shell theme (here): ConfigProvider tokens that style the editor itself —
//      top bar, panels, buttons, selects. Fixed regardless of slide theme.
//   2. Slide output theme (ThemePreset / ThemeColors): colours used by chart
//      renderers and slide backgrounds. Changes with the user's theme selection.
//
// Shell colours match a professional design-tool aesthetic: dark header, white
// side panels, light-grey canvas. The Layout.headerBg token drives the header
// background so no component needs an explicit background override.
// colorBgLayout sets the canvas area; colorBgContainer sets editing panels.
// Both are exposed as CSS custom properties (--ant-color-bg-layout, etc.) that
// AppShell reads via var(). This relies on Ant Design v6 injecting CSS custom
// properties by default — see the "Ant Design 6" note in CLAUDE.md tech stack.
// ---------------------------------------------------------------------------

const ANT_SHELL_THEME: ThemeConfig = {
  token: {
    colorBgLayout: '#f5f5f5',
  },
  components: {
    Layout: {
      headerBg: SHELL_HEADER_BG,
    },
  },
}

function App() {
  return (
    <ConfigProvider theme={ANT_SHELL_THEME}>
      <I18nextProvider i18n={i18n}>
        <ReportProvider>
          <AppShell />
        </ReportProvider>
      </I18nextProvider>
    </ConfigProvider>
  )
}

export default App
