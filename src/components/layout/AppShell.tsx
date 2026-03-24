import type { CSSProperties } from 'react'
import { useEffect } from 'react'
import { ConfigProvider, Layout, Splitter, theme as antTheme } from 'antd'
import type { ThemeConfig } from 'antd'
import { useUndoRedo } from '../../hooks/useUndoRedo'
import {
  SLIDE_PANEL_DEFAULT_PX,
  SLIDE_PANEL_MIN_PX,
  SLIDE_PANEL_MAX_PX,
  PROPERTIES_PANEL_DEFAULT_PX,
  PROPERTIES_PANEL_MIN_PX,
  PROPERTIES_PANEL_MAX_PX,
  CANVAS_MIN_PX,
  TOP_BAR_HEIGHT_PX,
} from '../../utils/constants'
import { Canvas } from './Canvas'
import { PropertiesPanel } from './PropertiesPanel'
import { SlidePanel } from './SlidePanel'
import { TopBar } from './TopBar'

// ---------------------------------------------------------------------------
// Module-level style constants — no inline objects in JSX
// ---------------------------------------------------------------------------

const ROOT_STYLE: CSSProperties = {
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}

// Background is driven by the Layout.headerBg token set in App.tsx's ConfigProvider.
// No explicit background here — the token is the single source of truth.
const HEADER_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
  height: TOP_BAR_HEIGHT_PX,
  lineHeight: `${TOP_BAR_HEIGHT_PX}px`,
  flexShrink: 0,
}

// Splitter fills all remaining vertical space below the header
const SPLITTER_STYLE: CSSProperties = {
  flex: 1,
  minHeight: 0,
}

// Panel backgrounds reference Ant Design CSS custom properties injected by
// ConfigProvider. This means they stay token-driven: if the shell theme tokens
// change, all panels update automatically without touching these constants.
//   colorBgContainer → white — used for editing panels (SlidePanel, PropertiesPanel)
//   colorBgLayout    → light grey — used for the canvas work area
const SLIDE_PANEL_CONTENT_STYLE: CSSProperties = {
  height: '100%',
  overflowY: 'auto',
  background: 'var(--ant-color-bg-container)',
}

const CANVAS_CONTENT_STYLE: CSSProperties = {
  height: '100%',
  overflow: 'auto',
  background: 'var(--ant-color-bg-layout)',
}

const PROPERTIES_PANEL_CONTENT_STYLE: CSSProperties = {
  height: '100%',
  overflowY: 'auto',
  background: 'var(--ant-color-bg-container)',
}

// Nested dark-algorithm scope for the header.
// Every Ant Design component inside TopBar (Typography, Button, Segmented, Select)
// automatically receives correct light-on-dark colours — no per-component overrides needed.
// React portals maintain context from the React tree (not the DOM tree), so overlay
// elements such as Select dropdowns also inherit this dark algorithm correctly.
//
// Segmented component tokens are explicitly overridden here because the dark-algorithm
// defaults (opaque colorBgLayout / colorBgElevated) render as a visible dark-gray box
// on the navy header background. rgba values make the track and selected pill blend
// naturally into the header while keeping both states clearly distinguishable.
const HEADER_THEME: ThemeConfig = {
  algorithm: antTheme.darkAlgorithm,
  components: {
    Segmented: {
      trackBg: 'rgba(255,255,255,0.1)',
      itemSelectedBg: 'rgba(255,255,255,0.22)',
      itemColor: 'rgba(255,255,255,0.6)',
      itemHoverBg: 'rgba(255,255,255,0.16)',
    },
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || target.isContentEditable
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppShell() {
  const { undo: handleUndo, redo: handleRedo } = useUndoRedo()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isEditableTarget(event.target)) return

      const { ctrlKey, shiftKey, key } = event
      const lowerKey = key.toLowerCase()

      if (ctrlKey && !shiftKey && lowerKey === 'z') {
        event.preventDefault()
        handleUndo()
      } else if ((ctrlKey && shiftKey && lowerKey === 'z') || (ctrlKey && lowerKey === 'y')) {
        event.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleUndo, handleRedo])

  return (
    <Layout style={ROOT_STYLE}>
      <Layout.Header style={HEADER_STYLE}>
        <ConfigProvider theme={HEADER_THEME}>
          <TopBar />
        </ConfigProvider>
      </Layout.Header>

      <Splitter style={SPLITTER_STYLE}>
        <Splitter.Panel
          defaultSize={SLIDE_PANEL_DEFAULT_PX}
          min={SLIDE_PANEL_MIN_PX}
          max={SLIDE_PANEL_MAX_PX}
        >
          <aside style={SLIDE_PANEL_CONTENT_STYLE}>
            <SlidePanel />
          </aside>
        </Splitter.Panel>

        <Splitter.Panel min={CANVAS_MIN_PX}>
          <main style={CANVAS_CONTENT_STYLE}>
            <Canvas />
          </main>
        </Splitter.Panel>

        <Splitter.Panel
          defaultSize={PROPERTIES_PANEL_DEFAULT_PX}
          min={PROPERTIES_PANEL_MIN_PX}
          max={PROPERTIES_PANEL_MAX_PX}
        >
          <aside style={PROPERTIES_PANEL_CONTENT_STYLE}>
            <PropertiesPanel />
          </aside>
        </Splitter.Panel>
      </Splitter>
    </Layout>
  )
}
