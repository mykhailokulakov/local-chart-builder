import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SlidePreview } from '../../src/components/layout/SlidePreview'
import type { Slide } from '../../src/types/slide'

function renderSlide(slide: Slide) {
  return render(<SlidePreview slide={slide} />)
}

describe('SlidePreview', () => {
  it('renders title slides with left-aligned heading and subtitle', () => {
    renderSlide({
      id: 'title-1',
      type: 'title',
      data: {
        type: 'title',
        heading: 'Digital Transformation Report 2026',
        subheading: 'Ministry briefing',
      },
    })

    expect(screen.getByText('Digital Transformation Report 2026')).toHaveStyle({
      textAlign: 'left',
    })
    expect(screen.getByText('Ministry briefing')).toHaveStyle({ textAlign: 'left' })
  })

  it('renders ending slides with left-aligned message, contact, and footnote', () => {
    renderSlide({
      id: 'ending-1',
      type: 'ending',
      data: {
        type: 'ending',
        message: 'Thank you',
        contact: 'analytics@min.digital.gov.ua',
        footnote: 'Confidential',
      },
    })

    expect(screen.getByText('Thank you')).toHaveStyle({ textAlign: 'left' })
    expect(screen.getByText('analytics@min.digital.gov.ua')).toHaveStyle({ textAlign: 'left' })
    expect(screen.getByText('Confidential')).toHaveStyle({ textAlign: 'left' })
  })
})
