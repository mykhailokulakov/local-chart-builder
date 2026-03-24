import type { ReactElement } from 'react'
import type { Slide } from '../../types/slide'
import { TitleSlide } from '../slides/TitleSlide'
import { DividerSlide } from '../slides/DividerSlide'
import { TextSlide } from '../slides/TextSlide'
import { EndingSlide } from '../slides/EndingSlide'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SlidePreviewProps {
  slide: Slide
}

// ---------------------------------------------------------------------------
// Component
//
// Dispatches to the type-specific renderer based on slide.data.type.
// The switch is exhaustive over the SlideData discriminated union — TypeScript
// will report a compile error if a new SlideType is added without a renderer.
// Chart slides are handled by ChartSlideCanvas in Canvas.tsx and never reach
// this component; the 'chart' case returns null as a compile-time guard.
// ---------------------------------------------------------------------------

export function SlidePreview({ slide }: SlidePreviewProps): ReactElement | null {
  switch (slide.data.type) {
    case 'title':
      return <TitleSlide data={slide.data} />
    case 'divider':
      return <DividerSlide data={slide.data} />
    case 'text':
      return <TextSlide data={slide.data} />
    case 'ending':
      return <EndingSlide data={slide.data} />
    case 'chart':
      // Canvas.tsx routes chart slides to ChartSlideCanvas before reaching here.
      return null
  }
}
