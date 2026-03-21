import type { CSSProperties } from 'react'
import { useEffect } from 'react'
import { Layout } from 'antd'
import { useUndoRedo } from '../../hooks/useUndoRedo'
import { SLIDE_PANEL_WIDTH_PX, PROPERTIES_PANEL_WIDTH_PX } from '../../utils/constants'
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
  flexShrink: 0,
}

const PANELS_STYLE: CSSProperties = {
  display: 'flex',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
}

const SLIDE_PANEL_STYLE: CSSProperties = {
  width: SLIDE_PANEL_WIDTH_PX,
  flexShrink: 0,
  overflowY: 'auto',
  borderRight: '1px solid #f0f0f0',
  background: '#fff',
}

const CANVAS_STYLE: CSSProperties = {
  flex: 1,
  overflow: 'auto',
  background: '#f5f5f5',
}

const PROPERTIES_PANEL_STYLE: CSSProperties = {
  width: PROPERTIES_PANEL_WIDTH_PX,
  flexShrink: 0,
  overflowY: 'auto',
  borderLeft: '1px solid #f0f0f0',
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
      <div style={PANELS_STYLE}>
        <aside style={SLIDE_PANEL_STYLE}>
          <SlidePanel />
        </aside>
        <main style={CANVAS_STYLE}>
          <Canvas />
        </main>
        <aside style={PROPERTIES_PANEL_STYLE}>
          <PropertiesPanel />
        </aside>
      </div>
    </Layout>
  )
}
