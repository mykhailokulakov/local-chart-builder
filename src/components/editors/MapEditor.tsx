import { useMemo, useCallback, useState } from 'react'
import type { CSSProperties } from 'react'
import { Button, Input, InputNumber, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ChoroplethData } from '../../types/layout'
import type { ChoroplethRegionData } from '../../types/chart'
import type { TileConfig } from '../../types/layout'
import { useReport } from '../../hooks/useReport'
import { updateTileData, removeTile } from '../../store/actions'
import { UKRAINE_REGIONS } from '../charts/ChoroplethMap'
import { parseMapCsv } from '../../services/mapDataParser'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INPUT_STYLE: CSSProperties = { width: 80 }
const ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
}
const REGION_TEXT_STYLE: CSSProperties = { fontSize: 11, flex: 1, minWidth: 0 }
const HINT_STYLE: CSSProperties = { fontSize: 11 }

// ---------------------------------------------------------------------------
// OblastRow sub-component
// ---------------------------------------------------------------------------

interface OblastRowProps {
  regionId: string
  value: number | undefined
  onChange: (regionId: string, value: number | null) => void
}

function OblastRow({ regionId, value, onChange }: OblastRowProps) {
  const handleChange = useCallback(
    (v: number | null) => onChange(regionId, v),
    [onChange, regionId],
  )
  return (
    <div style={ROW_STYLE}>
      <Typography.Text style={REGION_TEXT_STYLE} ellipsis>
        {regionId}
      </Typography.Text>
      <InputNumber
        aria-label={regionId}
        value={value}
        onChange={handleChange}
        size="small"
        style={INPUT_STYLE}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MapEditorProps {
  tile: TileConfig
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MapEditor({ tile }: MapEditorProps) {
  const { t } = useTranslation()
  const { state, dispatch } = useReport()
  const { selectedSlideId } = state
  const [csvText, setCsvText] = useState('')
  const [csvMode, setCsvMode] = useState(false)

  // Intentional cast: PropertiesPanel routes choropleth tiles to MapEditor,
  // so tile.data is guaranteed to be ChoroplethData.
  const choroplethData = tile.data as ChoroplethData

  const valueMap = useMemo(() => {
    const map = new Map<string, number>()
    choroplethData.regions.forEach((r) => map.set(r.regionId, r.value))
    return map
  }, [choroplethData.regions])

  const handleValueChange = useCallback(
    (regionId: string, value: number | null) => {
      if (!selectedSlideId) return
      const regions = choroplethData.regions
      if (value === null) {
        dispatch(
          updateTileData(selectedSlideId, tile.id, {
            ...choroplethData,
            regions: regions.filter((r) => r.regionId !== regionId),
          }),
        )
      } else {
        const exists = regions.some((r) => r.regionId === regionId)
        const entry: ChoroplethRegionData = { regionId, label: regionId, value }
        const updated = exists
          ? regions.map((r) => (r.regionId === regionId ? entry : r))
          : [...regions, entry]
        dispatch(updateTileData(selectedSlideId, tile.id, { ...choroplethData, regions: updated }))
      }
    },
    [dispatch, selectedSlideId, tile.id, choroplethData],
  )

  const handleLegendLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedSlideId) return
      dispatch(
        updateTileData(selectedSlideId, tile.id, {
          ...choroplethData,
          legendLabel: e.target.value,
        }),
      )
    },
    [dispatch, selectedSlideId, tile.id, choroplethData],
  )

  const handleApplyCSV = useCallback(() => {
    if (!selectedSlideId) return
    const parsed = parseMapCsv(csvText)
    const regions: ChoroplethRegionData[] = []
    parsed.forEach((value, regionId) => {
      if (UKRAINE_REGIONS.includes(regionId)) {
        regions.push({ regionId, label: regionId, value })
      }
    })
    dispatch(updateTileData(selectedSlideId, tile.id, { ...choroplethData, regions }))
    setCsvText('')
    setCsvMode(false)
  }, [csvText, selectedSlideId, tile.id, choroplethData, dispatch])

  const handleDelete = useCallback(() => {
    if (!selectedSlideId) return
    dispatch(removeTile(selectedSlideId, tile.id))
  }, [dispatch, selectedSlideId, tile.id])

  if (!selectedSlideId) return null

  return (
    <div className="flex flex-col gap-4">
      <Typography.Title level={5}>{t('editors.tileEditor')}</Typography.Title>

      <div>
        <label htmlFor={`map-legend-label-${tile.id}`}>
          <Typography.Text strong>{t('editors.mapEditor.legendLabel')}</Typography.Text>
        </label>
        <Input
          id={`map-legend-label-${tile.id}`}
          value={choroplethData.legendLabel ?? ''}
          placeholder={t('editors.mapEditor.legendLabelPlaceholder')}
          onChange={handleLegendLabelChange}
          size="small"
        />
      </div>

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
            {t('editors.mapEditor.csvHint')}
          </Typography.Text>
          <Input.TextArea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={t('editors.csvPlaceholder')}
            rows={6}
            aria-label={t('editors.csv')}
          />
          <Button onClick={handleApplyCSV} block>
            {t('editors.parseApply')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <Typography.Text strong>{t('editors.mapEditor.oblasts')}</Typography.Text>
          {UKRAINE_REGIONS.map((regionId) => (
            <OblastRow
              key={regionId}
              regionId={regionId}
              value={valueMap.get(regionId)}
              onChange={handleValueChange}
            />
          ))}
        </div>
      )}

      <Button danger block onClick={handleDelete}>
        {t('editors.deleteTile')}
      </Button>
    </div>
  )
}
