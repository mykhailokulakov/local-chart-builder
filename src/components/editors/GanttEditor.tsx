import type { CSSProperties } from 'react'
import { useCallback } from 'react'
import { Button, Input, Select, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { GanttTask, GanttTaskStatus } from '../../types/chart'
import type { GanttData, TileConfig } from '../../types/layout'
import { useReport } from '../../hooks/useReport'
import { updateTileData, removeTile } from '../../store/actions'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1),
}))

const STATUS_OPTIONS: { value: GanttTaskStatus; labelKey: string }[] = [
  { value: 'done', labelKey: 'gantt.status.done' },
  { value: 'in-progress', labelKey: 'gantt.status.inProgress' },
  { value: 'planned', labelKey: 'gantt.status.planned' },
]

const TASK_ROW_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 56px 56px 100px 28px',
  gap: 4,
  alignItems: 'center',
}

const HEADER_ROW_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 56px 56px 100px 28px',
  gap: 4,
}

const COLUMN_LABEL_STYLE: CSSProperties = {
  fontSize: 11,
  opacity: 0.7,
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GanttEditorProps {
  tile: TileConfig
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GanttEditor({ tile }: GanttEditorProps) {
  const { t } = useTranslation()
  const { state, dispatch } = useReport()
  const { selectedSlideId } = state

  // Intentional cast: PropertiesPanel routes gantt tiles to GanttEditor,
  // so tile.data is guaranteed to be GanttData.
  const ganttData = tile.data as GanttData
  const tasks = ganttData.tasks

  const updateTasks = useCallback(
    (updated: GanttTask[]) => {
      if (selectedSlideId === null) return
      dispatch(updateTileData(selectedSlideId, tile.id, { tasks: updated }))
    },
    [dispatch, selectedSlideId, tile.id],
  )

  const handleAddTask = useCallback(() => {
    const newTask: GanttTask = {
      id: crypto.randomUUID(),
      name: '',
      startMonth: 1,
      endMonth: 3,
      status: 'planned',
    }
    updateTasks([...tasks, newTask])
  }, [tasks, updateTasks])

  const handleRemoveTask = useCallback(
    (id: string) => {
      updateTasks(tasks.filter((task) => task.id !== id))
    },
    [tasks, updateTasks],
  )

  const handleNameChange = useCallback(
    (id: string, name: string) => {
      updateTasks(tasks.map((task) => (task.id === id ? { ...task, name } : task)))
    },
    [tasks, updateTasks],
  )

  const handleStartMonthChange = useCallback(
    (id: string, startMonth: number) => {
      updateTasks(tasks.map((task) => (task.id === id ? { ...task, startMonth } : task)))
    },
    [tasks, updateTasks],
  )

  const handleEndMonthChange = useCallback(
    (id: string, endMonth: number) => {
      updateTasks(tasks.map((task) => (task.id === id ? { ...task, endMonth } : task)))
    },
    [tasks, updateTasks],
  )

  const handleStatusChange = useCallback(
    (id: string, status: GanttTaskStatus) => {
      updateTasks(tasks.map((task) => (task.id === id ? { ...task, status } : task)))
    },
    [tasks, updateTasks],
  )

  const handleDelete = useCallback(() => {
    if (selectedSlideId === null) return
    dispatch(removeTile(selectedSlideId, tile.id))
  }, [dispatch, selectedSlideId, tile.id])

  const statusOptions = STATUS_OPTIONS.map(({ value, labelKey }) => ({
    value,
    label: t(labelKey),
  }))

  if (selectedSlideId === null) return null

  return (
    <div className="flex flex-col gap-4">
      <Typography.Title level={5}>{t('editors.tileEditor')}</Typography.Title>

      <Typography.Text strong>{t('gantt.tasks')}</Typography.Text>

      {tasks.length > 0 && (
        <div style={HEADER_ROW_STYLE}>
          <span style={COLUMN_LABEL_STYLE}>{t('gantt.taskName')}</span>
          <span style={COLUMN_LABEL_STYLE}>{t('gantt.start')}</span>
          <span style={COLUMN_LABEL_STYLE}>{t('gantt.end')}</span>
          <span style={COLUMN_LABEL_STYLE}>{t('gantt.statusColumn')}</span>
          <span />
        </div>
      )}

      {tasks.map((task) => (
        <div key={task.id} style={TASK_ROW_STYLE}>
          <Input
            aria-label={t('gantt.taskName')}
            value={task.name}
            placeholder={t('gantt.taskNamePlaceholder')}
            onChange={(e) => handleNameChange(task.id, e.target.value)}
            size="small"
          />
          <Select
            aria-label={t('gantt.start')}
            value={task.startMonth}
            options={MONTH_OPTIONS}
            onChange={(v) => handleStartMonthChange(task.id, v)}
            size="small"
            style={{ width: '100%' }}
          />
          <Select
            aria-label={t('gantt.end')}
            value={task.endMonth}
            options={MONTH_OPTIONS}
            onChange={(v) => handleEndMonthChange(task.id, v)}
            size="small"
            style={{ width: '100%' }}
          />
          <Select
            aria-label={t('gantt.statusColumn')}
            value={task.status}
            options={statusOptions}
            onChange={(v) => handleStatusChange(task.id, v)}
            size="small"
            style={{ width: '100%' }}
          />
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveTask(task.id)}
            aria-label={t('gantt.removeTask')}
          />
        </div>
      ))}

      <Button icon={<PlusOutlined />} onClick={handleAddTask} block>
        {t('gantt.addTask')}
      </Button>

      <Button danger block onClick={handleDelete}>
        {t('editors.deleteTile')}
      </Button>
    </div>
  )
}
