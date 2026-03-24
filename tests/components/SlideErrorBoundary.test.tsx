import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SlideErrorBoundary } from '../../src/components/layout/SlideErrorBoundary'

// Suppress React's expected console.error output when an error boundary catches.
// Without this suppression the test output is noisy even on a passing test.
function suppressBoundaryError() {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  return () => spy.mockRestore()
}

function ThrowingComponent(): never {
  throw new Error('test render error')
}

describe('SlideErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('renders children when no error occurs', () => {
    render(
      <SlideErrorBoundary fallback={<div>Error fallback</div>}>
        <div>Normal slide content</div>
      </SlideErrorBoundary>,
    )
    expect(screen.getByText('Normal slide content')).toBeInTheDocument()
    expect(screen.queryByText('Error fallback')).not.toBeInTheDocument()
  })

  test('renders the fallback when a child throws during render', () => {
    const restore = suppressBoundaryError()

    render(
      <SlideErrorBoundary fallback={<div>Error fallback</div>}>
        <ThrowingComponent />
      </SlideErrorBoundary>,
    )

    expect(screen.getByText('Error fallback')).toBeInTheDocument()
    restore()
  })

  test('renders children again after remounting with a new key', () => {
    const restore = suppressBoundaryError()

    const { rerender } = render(
      <SlideErrorBoundary key="slide-a" fallback={<div>Error fallback</div>}>
        <ThrowingComponent />
      </SlideErrorBoundary>,
    )

    expect(screen.getByText('Error fallback')).toBeInTheDocument()
    restore()

    // Changing the key forces a remount — the boundary resets to a clean state
    rerender(
      <SlideErrorBoundary key="slide-b" fallback={<div>Error fallback</div>}>
        <div>Recovered content</div>
      </SlideErrorBoundary>,
    )

    expect(screen.getByText('Recovered content')).toBeInTheDocument()
    expect(screen.queryByText('Error fallback')).not.toBeInTheDocument()
  })
})
