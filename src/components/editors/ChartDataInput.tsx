import type { CSSProperties } from 'react'
import { useState, useMemo, useCallback } from 'react'
import { Input, Button, Segmented } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ChartDataPoint } from '../../types/chart'
import { parseCsv } from '../../services/csvParser'

// ---------------------------------------------------------------------------
// Module-level constants — no inline objects in JSX
// ---------------------------------------------------------------------------

const POINT_ROW_STYLE: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
}

const VALUE_INPUT_STYLE: CSSProperties = { width: 90 }

const INPUT_MODE_VALUES = ['manual', 'csv'] as const
type InputMode = (typeof INPUT_MODE_VALUES)[number]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ChartDataInputProps {
  points: ChartDataPoint[]
  onUpdate: (points: ChartDataPoint[]) => void
  onParseError: (message: string) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChartDataInput({ points, onUpdate, onParseError }: ChartDataInputProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<InputMode>('manual')
  const [csvText, setCsvText] = useState('')

  // Stable keys for list items: preserved via id field on each point.
  // useMemo regenerates keys only when the points reference changes;
  // since every onUpdate call includes ids (assigned below), keys remain
  // stable across edits. One-time key regeneration occurs after undo/redo.
  const pointsWithIds = useMemo(
    () => points.map((pt) => ({ ...pt, id: pt.id ?? crypto.randomUUID() })),
    [points],
  )

  const modeOptions = useMemo(
    () => INPUT_MODE_VALUES.map((m) => ({ value: m, label: t(`editors.${m}`) })),
    [t],
  )

  const handleModeChange = useCallback((v: string | number) => {
    if (v === 'manual' || v === 'csv') setMode(v)
  }, [])

  const handlePointChange = useCallback(
    (idx: number, field: 'label' | 'value', raw: string) => {
      const updated = pointsWithIds.map((p, i) =>
        i === idx ? { ...p, [field]: field === 'value' ? parseFloat(raw) || 0 : raw } : p,
      )
      onUpdate(updated)
    },
    [pointsWithIds, onUpdate],
  )

  const handleAdd = useCallback(() => {
    onUpdate([...pointsWithIds, { id: crypto.randomUUID(), label: '', value: 0 }])
  }, [pointsWithIds, onUpdate])

  const handleDelete = useCallback(
    (idx: number) => {
      onUpdate(pointsWithIds.filter((_, i) => i !== idx))
    },
    [pointsWithIds, onUpdate],
  )

  const handleCsvApply = useCallback(() => {
    try {
      const parsed = parseCsv(csvText)
      onUpdate(parsed.map((p) => ({ ...p, id: crypto.randomUUID() })))
    } catch (err) {
      onParseError(err instanceof Error ? err.message : String(err))
    }
  }, [csvText, onUpdate, onParseError])

  return (
    <div className="flex flex-col gap-2">
      <Segmented options={modeOptions} value={mode} onChange={handleModeChange} />

      {mode === 'manual' ? (
        <>
          {pointsWithIds.map((pt, i) => (
            <div key={pt.id} style={POINT_ROW_STYLE}>
              <Input
                placeholder={t('editors.label')}
                value={pt.label}
                onChange={(e) => handlePointChange(i, 'label', e.target.value)}
              />
              <Input
                placeholder={t('editors.value')}
                value={String(pt.value)}
                style={VALUE_INPUT_STYLE}
                onChange={(e) => handlePointChange(i, 'value', e.target.value)}
              />
              <Button danger size="small" onClick={() => handleDelete(i)}>
                ×
              </Button>
            </div>
          ))}
          <Button onClick={handleAdd}>{t('editors.addRow')}</Button>
        </>
      ) : (
        <>
          <Input.TextArea
            rows={5}
            value={csvText}
            placeholder={t('editors.csvPlaceholder')}
            onChange={(e) => setCsvText(e.target.value)}
          />
          <Button onClick={handleCsvApply}>{t('editors.parseApply')}</Button>
        </>
      )}
    </div>
  )
}
