// Intentional exception to the no-class-components rule:
// React's error boundary API (componentDidCatch / getDerivedStateFromError) has
// no functional-component equivalent. This class component's single responsibility
// is catching render errors from slide content — no business logic lives here.

import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

// ---------------------------------------------------------------------------
// Props / State
// ---------------------------------------------------------------------------

interface SlideErrorBoundaryProps {
  /** Content to display when a descendant throws during render. */
  fallback: ReactNode
  children: ReactNode
}

interface SlideErrorBoundaryState {
  hasError: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class SlideErrorBoundary extends Component<
  SlideErrorBoundaryProps,
  SlideErrorBoundaryState
> {
  constructor(props: SlideErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): SlideErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // In production, forward to an error monitoring service here.
    // This app is offline-only, so there is no such service — the error is
    // swallowed intentionally rather than propagating and crashing the app.
    void error
    void info
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
