import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/config'
import { ReportProvider } from './store/ReportContext'
import { AppShell } from './components/layout/AppShell'

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ReportProvider>
        <AppShell />
      </ReportProvider>
    </I18nextProvider>
  )
}

export default App
