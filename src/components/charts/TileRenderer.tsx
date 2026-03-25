// Intentional exception to OCP registry pattern: each tile type requires a
// distinct data transformation from TileData → chart-component props. Registry
// adapter wrappers would add one file per type without reducing complexity.
// The switch below is exhaustively type-checked via assertNever.

import type {
  TileConfig,
  GanttData,
  ChoroplethData,
  DataTableData,
  TextData,
} from '../../types/layout'
import type { ChartData } from '../../types/chart'
import type { ThemeColors } from '../../types/theme'
import { BarChart } from './BarChart'
import { DonutChart } from './DonutChart'
import { LineChart } from './LineChart'
import { GanttChart } from './GanttChart'
import { ChoroplethMap } from './ChoroplethMap'
import { DataTable } from './DataTable'
import { TextTile } from './TextTile'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TileRendererProps {
  tile: TileConfig
  theme: ThemeColors
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function resolveValueRange(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 1 }
  return { min: Math.min(...values), max: Math.max(...values) }
}

function assertNever(x: never): never {
  throw new Error(`Unhandled tile type: ${String(x)}`)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TileRenderer({ tile, theme }: TileRendererProps) {
  switch (tile.type) {
    case 'bar-v':
    case 'bar-h': {
      // Safety: bar tiles are always created with ChartData (see slideFactory)
      const cd = tile.data as ChartData
      const data = (cd.points ?? []).map((p) => ({ label: p.label, value: p.value }))
      const orientation = tile.type === 'bar-v' ? ('vertical' as const) : ('horizontal' as const)
      const options = {
        showValues: tile.options.showValues ?? false,
        showLegend: tile.options.showLegend ?? false,
        showAxis: tile.options.showAxis ?? true,
      }
      return <BarChart data={data} orientation={orientation} options={options} theme={theme} />
    }

    case 'donut': {
      // Safety: donut tiles are always created with ChartData
      const cd = tile.data as ChartData
      const data = (cd.points ?? []).map((p) => ({
        label: p.label,
        value: p.value,
        color: p.color,
      }))
      const options = {
        showValues: tile.options.showValues ?? false,
        showLegend: tile.options.showLegend ?? true,
      }
      return <DonutChart data={data} options={options} theme={theme} />
    }

    case 'line': {
      // Safety: line tiles are always created with ChartData
      const cd = tile.data as ChartData
      const data = cd.series ?? cd.points ?? []
      const options = {
        showValues: tile.options.showValues ?? false,
        showLegend: tile.options.showLegend ?? false,
        showAxis: tile.options.showAxis ?? true,
      }
      return <LineChart data={data} options={options} theme={theme} />
    }

    case 'gantt': {
      // Safety: gantt tiles are always created with GanttData
      const gd = tile.data as GanttData
      return <GanttChart tasks={gd.tasks} theme={theme} />
    }

    case 'choropleth': {
      // Safety: choropleth tiles are always created with ChoroplethData
      const md = tile.data as ChoroplethData
      const valueRange = resolveValueRange(md.regions.map((r) => r.value))
      return (
        <ChoroplethMap
          data={md.regions}
          theme={theme}
          valueRange={valueRange}
          legendLabel={md.legendLabel}
        />
      )
    }

    case 'data-table': {
      // Safety: data-table tiles are always created with DataTableData
      const td = tile.data as DataTableData
      const columns = td.columns.map((c) => ({ key: c.key, label: c.header }))
      const options = {
        showHeader: tile.options.showHeader ?? true,
        striped: tile.options.striped ?? false,
        bordered: tile.options.bordered ?? false,
      }
      return (
        <DataTable
          columns={columns}
          rows={td.rows}
          rowKeys={td.rowIds}
          theme={theme}
          options={options}
        />
      )
    }

    case 'text': {
      // Safety: text tiles are always created with TextData
      const txd = tile.data as TextData
      return <TextTile data={txd} theme={theme} />
    }

    default:
      return assertNever(tile.type)
  }
}
