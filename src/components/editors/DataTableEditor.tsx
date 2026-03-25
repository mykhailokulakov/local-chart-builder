import type { CSSProperties } from 'react'
import { useState, useCallback, useMemo } from 'react'
import { Button, Input, Switch, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { DataTableRow, ChartOptions } from '../../types/chart'
import type { DataTableData, TileConfig } from '../../types/layout'
import { useReport } from '../../hooks/useReport'
import { updateTileData, updateTileOptions, removeTile } from '../../store/actions'
import { parseTableCsv } from '../../services/tableDataParser'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLUMN_ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
}

const DISPLAY_ROW_STYLE: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const HINT_STYLE: CSSProperties = { fontSize: 11 }

const DISPLAY_TOGGLES = ['showHeader', 'striped', 'bordered'] as const
type TableToggleKey = (typeof DISPLAY_TOGGLES)[number]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DataTableEditorProps {
  tile: TileConfig
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DataTableEditor({ tile }: DataTableEditorProps) {
  const { t } = useTranslation()
  const { state, dispatch } = useReport()
  const { selectedSlideId } = state
  const [csvMode, setCsvMode] = useState(false)
  const [csvText, setCsvText] = useState('')

  // Intentional cast: PropertiesPanel routes data-table tiles to DataTableEditor,
  // so tile.data is guaranteed to be DataTableData.
  const tableData = tile.data as DataTableData
  const { columns, rows, rowIds } = tableData

  const updateData = useCallback(
    (patch: Partial<DataTableData>) => {
      if (!selectedSlideId) return
      dispatch(updateTileData(selectedSlideId, tile.id, { ...tableData, ...patch }))
    },
    [dispatch, selectedSlideId, tile.id, tableData],
  )

  const handleOptionChange = useCallback(
    (key: TableToggleKey, value: boolean) => {
      if (!selectedSlideId) return
      const updated: ChartOptions = { ...tile.options, [key]: value }
      dispatch(updateTileOptions(selectedSlideId, tile.id, updated))
    },
    [dispatch, selectedSlideId, tile.id, tile.options],
  )

  const handleAddColumn = useCallback(() => {
    const key = `col_${String(Date.now())}`
    updateData({ columns: [...columns, { key, header: '' }] })
  }, [columns, updateData])

  const handleRemoveColumn = useCallback(
    (key: string) => {
      const updatedRows = rows.map((row) => {
        // Intentional: destructure to exclude the removed column key from the row
        const { [key]: _dropped, ...rest } = row
        void _dropped
        return rest
      })
      updateData({ columns: columns.filter((c) => c.key !== key), rows: updatedRows })
    },
    [columns, rows, updateData],
  )

  const handleColumnHeaderChange = useCallback(
    (key: string, header: string) => {
      updateData({ columns: columns.map((c) => (c.key === key ? { ...c, header } : c)) })
    },
    [columns, updateData],
  )

  const handleAddRow = useCallback(() => {
    const row: DataTableRow = {}
    columns.forEach((c) => {
      row[c.key] = ''
    })
    updateData({ rows: [...rows, row], rowIds: [...rowIds, crypto.randomUUID()] })
  }, [columns, rows, rowIds, updateData])

  const handleRemoveRow = useCallback(
    (rowIndex: number) => {
      updateData({
        rows: rows.filter((_, i) => i !== rowIndex),
        rowIds: rowIds.filter((_, i) => i !== rowIndex),
      })
    },
    [rows, rowIds, updateData],
  )

  const handleCellChange = useCallback(
    (rowIndex: number, key: string, value: string) => {
      const num = Number(value)
      const parsed: string | number = value !== '' && !isNaN(num) ? num : value
      const updated = rows.map((row, i) => (i === rowIndex ? { ...row, [key]: parsed } : row))
      updateData({ rows: updated })
    },
    [rows, updateData],
  )

  const handleApplyCsv = useCallback(() => {
    const parsed = parseTableCsv(csvText)
    updateData(parsed)
    setCsvText('')
    setCsvMode(false)
  }, [csvText, updateData])

  const handleDelete = useCallback(() => {
    if (!selectedSlideId) return
    dispatch(removeTile(selectedSlideId, tile.id))
  }, [dispatch, selectedSlideId, tile.id])

  const rowGridTemplate = useMemo(
    () => `repeat(${String(columns.length)}, 1fr) 28px`,
    [columns.length],
  )

  if (!selectedSlideId) return null

  return (
    <div className="flex flex-col gap-4">
      <Typography.Title level={5}>{t('editors.tileEditor')}</Typography.Title>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          size="small"
          type={csvMode ? 'default' : 'primary'}
          onClick={() => setCsvMode(false)}
        >
          {t('editors.manual')}
        </Button>
        <Button
          size="small"
          type={csvMode ? 'primary' : 'default'}
          onClick={() => setCsvMode(true)}
        >
          {t('editors.csv')}
        </Button>
      </div>

      {csvMode ? (
        <div className="flex flex-col gap-2">
          <Typography.Text type="secondary" style={HINT_STYLE}>
            {t('dataTable.csvHint')}
          </Typography.Text>
          <Input.TextArea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={t('editors.csvPlaceholder')}
            rows={6}
            aria-label={t('editors.csv')}
          />
          <Button onClick={handleApplyCsv} block>
            {t('editors.parseApply')}
          </Button>
        </div>
      ) : (
        <>
          <Typography.Text strong>{t('dataTable.columns')}</Typography.Text>
          {columns.map((col) => (
            <div key={col.key} style={COLUMN_ROW_STYLE}>
              <label htmlFor={`col-header-${col.key}`} className="sr-only">
                {t('dataTable.columnHeader')}
              </label>
              <Input
                id={`col-header-${col.key}`}
                value={col.header}
                placeholder={t('dataTable.columnHeaderPlaceholder')}
                onChange={(e) => handleColumnHeaderChange(col.key, e.target.value)}
                size="small"
                style={{ flex: 1 }}
              />
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveColumn(col.key)}
                aria-label={t('dataTable.removeColumn')}
              />
            </div>
          ))}
          <Button icon={<PlusOutlined />} onClick={handleAddColumn} block size="small">
            {t('dataTable.addColumn')}
          </Button>

          <Typography.Text strong>{t('dataTable.rows')}</Typography.Text>
          {rows.map((row, rowIndex) => (
            <div
              key={rowIds[rowIndex]}
              style={{ display: 'grid', gridTemplateColumns: rowGridTemplate, gap: 4 }}
            >
              {columns.map((col) => (
                <Input
                  key={col.key}
                  aria-label={col.header || col.key}
                  value={String(row[col.key] ?? '')}
                  onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
                  size="small"
                />
              ))}
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveRow(rowIndex)}
                aria-label={t('dataTable.removeRow')}
              />
            </div>
          ))}
          <Button icon={<PlusOutlined />} onClick={handleAddRow} block size="small">
            {t('dataTable.addRow')}
          </Button>
        </>
      )}

      <Typography.Text strong>{t('editors.display')}</Typography.Text>
      {DISPLAY_TOGGLES.map((key) => (
        <div key={key} style={DISPLAY_ROW_STYLE}>
          <label>{t(`dataTable.${key}`)}</label>
          <Switch
            checked={tile.options[key] ?? key === 'showHeader'}
            onChange={(v) => handleOptionChange(key, v)}
          />
        </div>
      ))}

      <Button danger block onClick={handleDelete}>
        {t('editors.deleteTile')}
      </Button>
    </div>
  )
}
