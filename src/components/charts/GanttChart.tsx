import { useTranslation } from 'react-i18next'
import type { GanttTask, GanttTaskStatus } from '../../types/chart'
import type { ThemeColors } from '../../types/theme'

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const LABEL_COL_WIDTH = 160
const HEADER_ROW_HEIGHT = 32
const ROW_HEIGHT = 40
const ROW_GAP = 6
const BAR_RADIUS = 6
const BAR_VERTICAL_PADDING = 8
const MONTHS_COUNT = 12
const STATUS_FONT_SIZE = 11
const LABEL_FONT_SIZE = 13
const MONTH_FONT_SIZE = 11

// ---------------------------------------------------------------------------
// Status colour map — fixed design colours not driven by theme chartColors
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<GanttTaskStatus, string> = {
  done: '#0d9488',
  'in-progress': '#38bdf8',
  planned: '#6b7280',
}

const STATUS_TEXT_COLORS: Record<GanttTaskStatus, string> = {
  done: '#ffffff',
  'in-progress': '#0c1a28',
  planned: '#ffffff',
}

// ---------------------------------------------------------------------------
// Month label keys — resolved via i18n
// ---------------------------------------------------------------------------

const MONTH_KEYS = [
  'gantt.months.jan',
  'gantt.months.feb',
  'gantt.months.mar',
  'gantt.months.apr',
  'gantt.months.may',
  'gantt.months.jun',
  'gantt.months.jul',
  'gantt.months.aug',
  'gantt.months.sep',
  'gantt.months.oct',
  'gantt.months.nov',
  'gantt.months.dec',
] as const

// ---------------------------------------------------------------------------
// Status label keys
// ---------------------------------------------------------------------------

const STATUS_LABEL_KEYS: Record<GanttTaskStatus, string> = {
  done: 'gantt.status.done',
  'in-progress': 'gantt.status.inProgress',
  planned: 'gantt.status.planned',
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Column x-start for month index 0-based within the grid area */
function monthX(monthIndex: number, gridWidth: number): number {
  return LABEL_COL_WIDTH + (monthIndex / MONTHS_COUNT) * gridWidth
}

/** Width of one month cell */
function monthWidth(gridWidth: number): number {
  return gridWidth / MONTHS_COUNT
}

/** Y-centre of a task row (0-indexed) */
function rowCentreY(rowIndex: number): number {
  return HEADER_ROW_HEIGHT + rowIndex * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2
}

/** Total SVG height for the given number of tasks */
function svgHeight(taskCount: number): number {
  return HEADER_ROW_HEIGHT + taskCount * (ROW_HEIGHT + ROW_GAP)
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface GanttChartProps {
  tasks: GanttTask[]
  theme: ThemeColors
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GanttChart({ tasks, theme }: GanttChartProps) {
  const { t } = useTranslation()

  if (tasks.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: theme.surface,
          color: theme.muted,
          fontFamily: theme.fontFamily,
          fontSize: '14px',
        }}
      >
        {t('charts.noData')}
      </div>
    )
  }

  const totalHeight = svgHeight(tasks.length)
  const monthLabels = MONTH_KEYS.map((key) => t(key))

  return (
    <div style={{ width: '100%', height: '100%', background: theme.background }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 800 ${totalHeight}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label={t('gantt.ariaLabel')}
        role="img"
      >
        <GanttGrid
          taskCount={tasks.length}
          totalHeight={totalHeight}
          theme={theme}
          monthLabels={monthLabels}
        />
        {tasks.map((task, index) => (
          <GanttRow
            key={task.id}
            task={task}
            rowIndex={index}
            statusLabel={t(STATUS_LABEL_KEYS[task.status])}
            theme={theme}
          />
        ))}
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface GanttGridProps {
  taskCount: number
  totalHeight: number
  theme: ThemeColors
  monthLabels: string[]
}

function GanttGrid({ taskCount, totalHeight, theme, monthLabels }: GanttGridProps) {
  const gridWidth = 800 - LABEL_COL_WIDTH

  return (
    <g>
      {/* Month header labels */}
      {monthLabels.map((label, i) => {
        const x = monthX(i, gridWidth) + monthWidth(gridWidth) / 2
        return (
          <text
            key={label}
            x={x}
            y={HEADER_ROW_HEIGHT / 2 + MONTH_FONT_SIZE / 2}
            textAnchor="middle"
            fontSize={MONTH_FONT_SIZE}
            fill={theme.muted}
            fontFamily={theme.fontFamily}
          >
            {label}
          </text>
        )
      })}

      {/* Vertical month separator lines */}
      {Array.from({ length: MONTHS_COUNT + 1 }, (_, i) => {
        const x = monthX(i, gridWidth)
        return (
          <line
            key={i}
            x1={x}
            y1={HEADER_ROW_HEIGHT}
            x2={x}
            y2={totalHeight}
            stroke={theme.surface}
            strokeWidth={1}
          />
        )
      })}

      {/* Horizontal row separator lines */}
      {Array.from({ length: taskCount }, (_, i) => {
        const y = HEADER_ROW_HEIGHT + i * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT + ROW_GAP / 2
        return (
          <line
            key={i}
            x1={LABEL_COL_WIDTH}
            y1={y}
            x2={800}
            y2={y}
            stroke={theme.surface}
            strokeWidth={1}
          />
        )
      })}
    </g>
  )
}

interface GanttRowProps {
  task: GanttTask
  rowIndex: number
  statusLabel: string
  theme: ThemeColors
}

function GanttRow({ task, rowIndex, statusLabel, theme }: GanttRowProps) {
  const gridWidth = 800 - LABEL_COL_WIDTH
  const centreY = rowCentreY(rowIndex)
  const barY = centreY - ROW_HEIGHT / 2 + BAR_VERTICAL_PADDING
  const barHeight = ROW_HEIGHT - BAR_VERTICAL_PADDING * 2

  // Clamp months to valid range
  const startMonth = Math.max(1, Math.min(12, task.startMonth))
  const endMonth = Math.max(startMonth, Math.min(12, task.endMonth))

  const barX = monthX(startMonth - 1, gridWidth)
  const barWidth = monthX(endMonth, gridWidth) - barX
  const barFill = STATUS_COLORS[task.status]
  const textFill = STATUS_TEXT_COLORS[task.status]

  return (
    <g>
      {/* Task name label */}
      <text
        x={LABEL_COL_WIDTH - 8}
        y={centreY + LABEL_FONT_SIZE / 2 - 1}
        textAnchor="end"
        fontSize={LABEL_FONT_SIZE}
        fill={theme.foreground}
        fontFamily={theme.fontFamily}
      >
        {task.name}
      </text>

      {/* Task bar */}
      <rect
        x={barX}
        y={barY}
        width={barWidth}
        height={barHeight}
        rx={BAR_RADIUS}
        ry={BAR_RADIUS}
        fill={barFill}
      />

      {/* Status label inside bar (only if bar is wide enough) */}
      {barWidth > 40 && (
        <text
          x={barX + barWidth / 2}
          y={barY + barHeight / 2 + STATUS_FONT_SIZE / 2 - 1}
          textAnchor="middle"
          fontSize={STATUS_FONT_SIZE}
          fill={textFill}
          fontFamily={theme.fontFamily}
        >
          {statusLabel}
        </text>
      )}
    </g>
  )
}
