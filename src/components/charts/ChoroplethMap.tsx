import { useMemo, useCallback } from 'react'
import * as d3 from 'd3'
import { useTranslation } from 'react-i18next'
import type { FeatureCollection, MultiPolygon } from 'geojson'
import type { ChoroplethRegionData } from '../../types/chart'
import type { ThemeColors } from '../../types/theme'
import rawGeoJson from '../../assets/ukraine-oblasts.geojson'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAP_WIDTH = 800
const MAP_HEIGHT = 540
const MAP_AREA_H = 460
const LEGEND_H = 28
const LEGEND_W = 280
const LEGEND_Y = 494
const LEGEND_X = (MAP_WIDTH - LEGEND_W) / 2
const LEGEND_FONT_SIZE = 11
const LEGEND_LABEL_GAP = 6
const LEGEND_VALUE_GAP = 14
const VALUE_FONT_SIZE = 9
const CRIMEA_NOTE_FONT_SIZE = 7
const CRIMEA_REGION_ID = 'Автономна Республіка Крим'
const SEVASTOPOL_REGION_ID = 'Севастополь'
const HATCH_DEF_ID = 'ukraine-map-hatch'
const GRADIENT_DEF_ID = 'ukraine-map-grad'
const HATCH_SIZE = 4
const HATCH_STROKE_OPACITY = 0.5
const OBLAST_STROKE_WIDTH = 0.5

// ---------------------------------------------------------------------------
// GeoJSON types
// ---------------------------------------------------------------------------

interface OblastProperties {
  fid: number
  region: string
}

interface ComputedFeature {
  region: string
  d: string
  centroid: [number, number]
}

// Intentional cast: vite-env.d.ts declares *.geojson as unknown; we own this asset.
const geoData = rawGeoJson as FeatureCollection<MultiPolygon, OblastProperties>

// Projection and paths computed once at module level (static asset, fixed viewBox)
const projection = d3.geoMercator().fitSize([MAP_WIDTH, MAP_AREA_H], geoData)
const pathGen = d3.geoPath().projection(projection)

const COMPUTED_FEATURES: readonly ComputedFeature[] = geoData.features.map((f) => ({
  region: f.properties.region,
  d: pathGen(f) ?? '',
  centroid: pathGen.centroid(f) as [number, number],
}))

/** All Ukraine region identifiers derived from GeoJSON (exported for MapEditor) */
export const UKRAINE_REGIONS: readonly string[] = geoData.features.map((f) => f.properties.region)

// ---------------------------------------------------------------------------
// Pure module-level helpers
// ---------------------------------------------------------------------------

function isCrimea(region: string): boolean {
  return region === CRIMEA_REGION_ID || region === SEVASTOPOL_REGION_ID
}

function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function resolveOblastFill(
  region: string,
  dataMap: Map<string, ChoroplethRegionData>,
  colorScale: (v: number) => string,
  surfaceColor: string,
): string {
  if (isCrimea(region)) return `url(#${HATCH_DEF_ID})`
  const rd = dataMap.get(region)
  return rd !== undefined ? colorScale(rd.value) : surfaceColor
}

// ---------------------------------------------------------------------------
// Sub-component props interfaces
// ---------------------------------------------------------------------------

interface HatchPatternProps {
  id: string
  strokeColor: string
}

interface OblastPathsProps {
  features: readonly ComputedFeature[]
  dataMap: Map<string, ChoroplethRegionData>
  colorScale: (v: number) => string
  surfaceColor: string
  strokeColor: string
}

interface OblastLabelsProps {
  features: readonly ComputedFeature[]
  dataMap: Map<string, ChoroplethRegionData>
  fontFamily: string
  foregroundColor: string
}

interface CrimeaNoteProps {
  note: string
  theme: ThemeColors
}

interface MapLegendProps {
  legendLabel: string | undefined
  valueRange: { min: number; max: number }
  gradientId: string
  lightColor: string
  darkColor: string
  theme: ThemeColors
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HatchPattern({ id, strokeColor }: HatchPatternProps) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={HATCH_SIZE} height={HATCH_SIZE}>
      <line
        x1={0}
        y1={HATCH_SIZE}
        x2={HATCH_SIZE}
        y2={0}
        stroke={strokeColor}
        strokeWidth={1}
        opacity={HATCH_STROKE_OPACITY}
      />
    </pattern>
  )
}

function OblastPaths({
  features,
  dataMap,
  colorScale,
  surfaceColor,
  strokeColor,
}: OblastPathsProps) {
  return (
    <g>
      {features.map((f) => (
        <path
          key={f.region}
          d={f.d}
          fill={resolveOblastFill(f.region, dataMap, colorScale, surfaceColor)}
          stroke={strokeColor}
          strokeWidth={OBLAST_STROKE_WIDTH}
        />
      ))}
    </g>
  )
}

function OblastLabels({ features, dataMap, fontFamily, foregroundColor }: OblastLabelsProps) {
  return (
    <g>
      {features
        .filter((f) => !isCrimea(f.region) && dataMap.has(f.region))
        .map((f) => {
          const entry = dataMap.get(f.region)
          if (entry === undefined) return null
          return (
            <text
              key={f.region}
              x={f.centroid[0]}
              y={f.centroid[1]}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={VALUE_FONT_SIZE}
              fill={foregroundColor}
              fontFamily={fontFamily}
            >
              {formatValue(entry.value)}
            </text>
          )
        })}
    </g>
  )
}

function CrimeaNote({ note, theme }: CrimeaNoteProps) {
  const crimeaFeature = COMPUTED_FEATURES.find((f) => f.region === CRIMEA_REGION_ID)
  if (!crimeaFeature) return null

  return (
    <text
      x={crimeaFeature.centroid[0]}
      y={crimeaFeature.centroid[1]}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={CRIMEA_NOTE_FONT_SIZE}
      fill={theme.muted}
      fontFamily={theme.fontFamily}
    >
      {note}
    </text>
  )
}

function MapLegend({
  legendLabel,
  valueRange,
  gradientId,
  lightColor,
  darkColor,
  theme,
}: MapLegendProps) {
  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={lightColor} />
          <stop offset="100%" stopColor={darkColor} />
        </linearGradient>
      </defs>
      {legendLabel && (
        <text
          x={LEGEND_X + LEGEND_W / 2}
          y={LEGEND_Y - LEGEND_LABEL_GAP}
          textAnchor="middle"
          fontSize={LEGEND_FONT_SIZE}
          fill={theme.muted}
          fontFamily={theme.fontFamily}
        >
          {legendLabel}
        </text>
      )}
      <rect
        x={LEGEND_X}
        y={LEGEND_Y}
        width={LEGEND_W}
        height={LEGEND_H}
        fill={`url(#${gradientId})`}
        rx={3}
        ry={3}
      />
      <text
        x={LEGEND_X}
        y={LEGEND_Y + LEGEND_H + LEGEND_VALUE_GAP}
        textAnchor="start"
        fontSize={LEGEND_FONT_SIZE}
        fill={theme.muted}
        fontFamily={theme.fontFamily}
      >
        {formatValue(valueRange.min)}
      </text>
      <text
        x={LEGEND_X + LEGEND_W}
        y={LEGEND_Y + LEGEND_H + LEGEND_VALUE_GAP}
        textAnchor="end"
        fontSize={LEGEND_FONT_SIZE}
        fill={theme.muted}
        fontFamily={theme.fontFamily}
      >
        {formatValue(valueRange.max)}
      </text>
    </g>
  )
}

// ---------------------------------------------------------------------------
// Props & main component
// ---------------------------------------------------------------------------

export interface ChoroplethMapProps {
  data: ChoroplethRegionData[]
  theme: ThemeColors
  valueRange: { min: number; max: number }
  legendLabel?: string
}

export function ChoroplethMap({ data, theme, valueRange, legendLabel }: ChoroplethMapProps) {
  const { t } = useTranslation()

  const dataMap = useMemo(() => {
    const map = new Map<string, ChoroplethRegionData>()
    data.forEach((r) => map.set(r.regionId, r))
    return map
  }, [data])

  const colorScale = useMemo(() => {
    const safeMax = valueRange.max === valueRange.min ? valueRange.min + 1 : valueRange.max
    return d3
      .scaleSequential(d3.interpolateRgb(theme.background, theme.accent))
      .domain([valueRange.min, safeMax])
      .clamp(true)
  }, [theme.background, theme.accent, valueRange])

  const getColorScale = useCallback((v: number) => colorScale(v), [colorScale])

  // Always render the SVG map so the user can see the Ukraine outline.
  // When no data is provided, oblasts render in the surface colour.
  // A hint label is overlaid on the SVG when the data array is empty.

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg
        width="100%"
        height="100%"
        style={{ display: 'block' }}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label={t('map.ariaLabel')}
        role="img"
      >
        <defs>
          <HatchPattern id={HATCH_DEF_ID} strokeColor={theme.foreground} />
        </defs>
        <OblastPaths
          features={COMPUTED_FEATURES}
          dataMap={dataMap}
          colorScale={getColorScale}
          surfaceColor={theme.surface}
          strokeColor={theme.surface}
        />
        <OblastLabels
          features={COMPUTED_FEATURES}
          dataMap={dataMap}
          fontFamily={theme.fontFamily}
          foregroundColor={theme.foreground}
        />
        <CrimeaNote note={t('map.crimeaIsUkraine')} theme={theme} />
        {data.length > 0 ? (
          <MapLegend
            legendLabel={legendLabel}
            valueRange={valueRange}
            gradientId={GRADIENT_DEF_ID}
            lightColor={theme.background}
            darkColor={theme.accent}
            theme={theme}
          />
        ) : (
          <text
            x={MAP_WIDTH / 2}
            y={MAP_AREA_H / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={LEGEND_FONT_SIZE * 1.5}
            fill={theme.muted}
            fontFamily={theme.fontFamily}
          >
            {t('charts.noData')}
          </text>
        )}
      </svg>
    </div>
  )
}
