import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TitleSlide } from '../../src/components/slides/TitleSlide'
import { DividerSlide } from '../../src/components/slides/DividerSlide'
import { TextSlide } from '../../src/components/slides/TextSlide'
import { EndingSlide } from '../../src/components/slides/EndingSlide'

// ---------------------------------------------------------------------------
// TitleSlide
// ---------------------------------------------------------------------------

describe('TitleSlide', () => {
  it('renders the heading', () => {
    render(<TitleSlide data={{ type: 'title', heading: 'Annual Report 2024' }} />)
    expect(screen.getByText('Annual Report 2024')).toBeInTheDocument()
  })

  it('renders subheading when provided', () => {
    render(
      <TitleSlide
        data={{ type: 'title', heading: 'H', subheading: 'Ministry of Digital Transformation' }}
      />,
    )
    expect(screen.getByText('Ministry of Digital Transformation')).toBeInTheDocument()
  })

  it('renders author and date in footer when provided', () => {
    render(<TitleSlide data={{ type: 'title', heading: 'H', author: 'Dept A', date: '2024' }} />)
    expect(screen.getByText('Dept A')).toBeInTheDocument()
    expect(screen.getByText('2024')).toBeInTheDocument()
  })

  it('omits footer when neither author nor date is provided', () => {
    const { container } = render(<TitleSlide data={{ type: 'title', heading: 'H' }} />)
    // Footer div has a borderTop style — absence means no footer rendered
    const footer = container.querySelector('[style*="border-top"]')
    expect(footer).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// DividerSlide
// ---------------------------------------------------------------------------

describe('DividerSlide', () => {
  it('renders the section label', () => {
    render(<DividerSlide data={{ type: 'divider', label: 'Section 2' }} />)
    expect(screen.getByText('Section 2')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<DividerSlide data={{ type: 'divider', label: 'L', description: 'Overview' }} />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })

  it('omits description when not provided', () => {
    render(<DividerSlide data={{ type: 'divider', label: 'L' }} />)
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TextSlide
// ---------------------------------------------------------------------------

describe('TextSlide', () => {
  it('renders heading and body', () => {
    render(<TextSlide data={{ type: 'text', heading: 'Key Findings', body: 'Results here.' }} />)
    expect(screen.getByText('Key Findings')).toBeInTheDocument()
    expect(screen.getByText('Results here.')).toBeInTheDocument()
  })

  it('omits body paragraph when body is empty', () => {
    render(<TextSlide data={{ type: 'text', heading: 'H', body: '' }} />)
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// EndingSlide
// ---------------------------------------------------------------------------

describe('EndingSlide', () => {
  it('renders the closing message', () => {
    render(<EndingSlide data={{ type: 'ending', message: 'Дякуємо!' }} />)
    expect(screen.getByText('Дякуємо!')).toBeInTheDocument()
  })

  it('renders contact info when provided', () => {
    render(<EndingSlide data={{ type: 'ending', message: 'M', contact: 'info@gov.ua' }} />)
    expect(screen.getByText('info@gov.ua')).toBeInTheDocument()
  })

  it('renders footnote when provided', () => {
    render(<EndingSlide data={{ type: 'ending', message: 'M', footnote: 'Confidential' }} />)
    expect(screen.getByText('Confidential')).toBeInTheDocument()
  })

  it('omits contact and footnote when not provided', () => {
    render(<EndingSlide data={{ type: 'ending', message: 'M' }} />)
    // Only the heading-level element for the message should be present
    expect(screen.getAllByRole('heading')).toHaveLength(1)
  })
})
