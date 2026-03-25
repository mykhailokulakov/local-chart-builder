import type { CSSProperties } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useReport } from '../../hooks/useReport'
import { addSlide, removeSlide, reorderSlide, selectSlide } from '../../store/actions'
import { createSlide } from '../../services/slideFactory'
import type { SlideType, Slide } from '../../types/slide'
import { SlideCard } from './SlideCard'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SLIDE_TYPES: SlideType[] = ['title', 'chart', 'divider', 'text', 'ending']

// ---------------------------------------------------------------------------
// Style constants
// ---------------------------------------------------------------------------

const PANEL_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: 8,
  gap: 8,
}

const LIST_STYLE: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
}

const ADD_BTN_STYLE: CSSProperties = {
  width: '100%',
  flexShrink: 0,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SlidePanel() {
  const { t } = useTranslation()
  const { state, dispatch } = useReport()
  const slides = state.present.slides
  const selectedSlideId = state.selectedSlideId
  const dragFromIndex = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleSelect = useCallback((id: string) => dispatch(selectSlide(id)), [dispatch])

  const handleDuplicate = useCallback(
    (id: string) => {
      const original = slides.find((s) => s.id === id)
      if (original === undefined) return
      const copy: Slide = {
        ...original,
        id: crypto.randomUUID(),
        tiles: original.tiles?.map((tile) => ({ ...tile })),
      }
      dispatch(addSlide(copy))
    },
    [slides, dispatch],
  )

  const handleDelete = useCallback((id: string) => dispatch(removeSlide(id)), [dispatch])

  const handleMoveUp = useCallback(
    (index: number) => dispatch(reorderSlide(index, index - 1)),
    [dispatch],
  )

  const handleMoveDown = useCallback(
    (index: number) => dispatch(reorderSlide(index, index + 1)),
    [dispatch],
  )

  const handleDragStart = useCallback((index: number) => {
    dragFromIndex.current = index
  }, [])

  const handleDragEnter = useCallback((index: number) => {
    setDragOverIndex(index)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback(
    (toIndex: number) => {
      setDragOverIndex(null)
      const from = dragFromIndex.current
      if (from === null || from === toIndex) return
      dispatch(reorderSlide(from, toIndex))
      dragFromIndex.current = null
    },
    [dispatch],
  )

  const addMenuItems = useMemo<MenuProps['items']>(
    () =>
      SLIDE_TYPES.map((type) => ({
        key: type,
        label: t(`slides.type.${type}`),
        onClick: () => dispatch(addSlide(createSlide(type))),
      })),
    [t, dispatch],
  )

  return (
    <div style={PANEL_STYLE}>
      <Dropdown menu={{ items: addMenuItems }} trigger={['click']}>
        <Button type="primary" icon={<PlusOutlined />} style={ADD_BTN_STYLE}>
          {t('slides.addSlide')}
        </Button>
      </Dropdown>
      <div style={LIST_STYLE}>
        {slides.map((slide, index) => (
          <SlideCard
            key={slide.id}
            slide={slide}
            index={index}
            isSelected={slide.id === selectedSlideId}
            isFirst={index === 0}
            isLast={index === slides.length - 1}
            isDragTarget={dragOverIndex === index}
            onSelect={handleSelect}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  )
}
