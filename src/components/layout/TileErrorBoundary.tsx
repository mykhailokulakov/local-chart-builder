// Intentional exception to the no-class-components rule:
// React's error boundary API (componentDidCatch / getDerivedStateFromError) has
// no functional-component equivalent. This class component's single responsibility
// is catching render errors within a single tile so a broken chart does not
// crash the whole canvas.

import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

// ---------------------------------------------------------------------------
// Props / State
// ---------------------------------------------------------------------------

interface TileErrorBoundaryProps {
  /** Content to render when a descendant throws during render. */
  fallback: ReactNode
  children: ReactNode
}

interface TileErrorBoundaryState {
  hasError: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class TileErrorBoundary extends Component<TileErrorBoundaryProps, TileErrorBoundaryState> {
  constructor(props: TileErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): TileErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Offline-only app — no error monitoring service available.
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
