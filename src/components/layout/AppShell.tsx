import type { CSSProperties } from 'react'
import { useEffect } from 'react'
import { Layout, Splitter } from 'antd'
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
  TOPBAR_BG_COLOR,
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

const HEADER_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
  height: TOP_BAR_HEIGHT_PX,
  lineHeight: `${TOP_BAR_HEIGHT_PX}px`,
  flexShrink: 0,
  background: TOPBAR_BG_COLOR,
}

// Splitter fills all remaining vertical space below the header
const SPLITTER_STYLE: CSSProperties = {
  flex: 1,
  minHeight: 0,
}

// Panel content styles — each fills its Splitter.Panel fully
const SLIDE_PANEL_CONTENT_STYLE: CSSProperties = {
  height: '100%',
  overflowY: 'auto',
  background: '#fff',
}

const CANVAS_CONTENT_STYLE: CSSProperties = {
  height: '100%',
  overflow: 'auto',
  background: '#f5f5f5',
}

const PROPERTIES_PANEL_CONTENT_STYLE: CSSProperties = {
  height: '100%',
  overflowY: 'auto',
  background: '#fff',
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
        <TopBar />
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
