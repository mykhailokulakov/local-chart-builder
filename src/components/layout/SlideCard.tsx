import type { CSSProperties } from 'react'
import { useCallback, useMemo } from 'react'
import { Button, Dropdown, theme } from 'antd'
import type { MenuProps } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { Slide } from '../../types/slide'
import { SLIDE_TYPE_COLORS } from '../../utils/constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SlideCardProps {
  slide: Slide
  index: number
  isSelected: boolean
  isFirst: boolean
  isLast: boolean
  onSelect: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onDragStart: (index: number) => void
  onDrop: (toIndex: number) => void
}

// ---------------------------------------------------------------------------
// Style constants
// ---------------------------------------------------------------------------

const THUMBNAIL_BASE: CSSProperties = {
  width: '100%',
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px 4px 0 0',
}

const THUMBNAIL_LABEL: CSSProperties = {
  color: '#fff',
  fontSize: 11,
  fontWeight: 600,
  pointerEvents: 'none',
}

const LABEL_ROW: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '2px 4px 2px 6px',
}

const NUMBER_STYLE: CSSProperties = { fontSize: 11, color: 'var(--ant-color-text-tertiary)' }

const MORE_BTN: CSSProperties = { padding: 0, height: 20, minWidth: 20 }

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SlideCard({
  slide,
  index,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDrop,
}: SlideCardProps) {
  const { t } = useTranslation()
  const { token } = theme.useToken()

  const cardStyle: CSSProperties = useMemo(
    () => ({
      border: `2px solid ${isSelected ? token.colorPrimary : 'transparent'}`,
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 8,
      cursor: 'pointer',
      background: token.colorBgContainer,
      transition: 'border-color 0.15s',
    }),
    [isSelected, token.colorPrimary, token.colorBgContainer],
  )

  const thumbnailStyle: CSSProperties = useMemo(
    () => ({ ...THUMBNAIL_BASE, background: SLIDE_TYPE_COLORS[slide.type] }),
    [slide.type],
  )

  const menuItems = useMemo<MenuProps['items']>(
    () => [
      { key: 'duplicate', label: t('slides.duplicate'), onClick: () => onDuplicate(slide.id) },
      {
        key: 'moveUp',
        label: t('slides.moveUp'),
        disabled: isFirst,
        onClick: () => onMoveUp(index),
      },
      {
        key: 'moveDown',
        label: t('slides.moveDown'),
        disabled: isLast,
        onClick: () => onMoveDown(index),
      },
      { type: 'divider' },
      { key: 'delete', label: t('slides.delete'), danger: true, onClick: () => onDelete(slide.id) },
    ],
    [t, slide.id, index, isFirst, isLast, onDuplicate, onMoveUp, onMoveDown, onDelete],
  )

  const handleClick = useCallback(() => onSelect(slide.id), [onSelect, slide.id])
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') onSelect(slide.id)
    },
    [onSelect, slide.id],
  )
  const handleDragStart = useCallback(() => onDragStart(index), [onDragStart, index])
  const handleDrop = useCallback(() => onDrop(index), [onDrop, index])
  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), [])
  const handleMoreClick = useCallback((e: React.MouseEvent) => e.stopPropagation(), [])

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['contextMenu']}>
      <div
        style={cardStyle}
        role="button"
        tabIndex={0}
        aria-label={`${t(`slides.type.${slide.type}`)} ${index + 1}`}
        aria-pressed={isSelected}
        draggable
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div style={thumbnailStyle}>
          <span style={THUMBNAIL_LABEL}>{t(`slides.type.${slide.type}`)}</span>
        </div>
        <div style={LABEL_ROW}>
          <span style={NUMBER_STYLE}>{index + 1}</span>
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              style={MORE_BTN}
              aria-label={t('slides.moreOptions')}
              onClick={handleMoreClick}
            />
          </Dropdown>
        </div>
      </div>
    </Dropdown>
  )
}
