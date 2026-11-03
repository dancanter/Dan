import { useState, type ReactNode } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTokens } from '@/hooks/useTheme';
import { cx } from './ui';

// One chart system: hairline solid grid, 2 px lines, ≤24 px bars with a
// rounded data end, legends for 2+ series, and a table view for every chart.

export interface SeriesDef {
  key: string;
  label: string;
  colour: 's1' | 's2' | 's3';
}

function Legend({ series }: { series: SeriesDef[] }) {
  const t = useTokens();
  if (series.length < 2) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
      {series.map((s) => (
        <span key={s.key} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-3 rounded-sm" style={{ background: t[s.colour] }} aria-hidden />
          {s.label}
        </span>
      ))}
    </div>
  );
}

function TooltipBox({ active, payload, label, format, labelFormat }: { active?: boolean; payload?: { name: string; value: number; color: string; dataKey: string }[]; label?: string; format?: (v: number, key: string) => string; labelFormat?: (l: string) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-card">
      <div className="mb-1 font-medium text-ink">{labelFormat ? labelFormat(String(label)) : label}</div>
      {payload
        .filter((p) => p.value != null)
        .map((p) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-ink-2">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} aria-hidden />
            <span>{p.name}</span>
            <span className="ml-auto tabular font-medium text-ink">{format ? format(p.value, p.dataKey) : p.value}</span>
          </div>
        ))}
    </div>
  );
}

export function ChartFrame({ title, subtitle, children, table, className }: { title: ReactNode; subtitle?: ReactNode; children: ReactNode; table?: { columns: string[]; rows: (string | number)[][] }; className?: string }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <figure className={cx('rounded-2xl border border-line bg-surface p-5 shadow-card', className)}>
      <figcaption className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">{title}</div>
          {subtitle && <div className="text-xs text-muted">{subtitle}</div>}
        </div>
        {table && (
          <button type="button" onClick={() => setShowTable((v) => !v)} className="text-xs text-muted underline underline-offset-2 hover:text-ink">
            {showTable ? 'Chart' : 'Table'}
          </button>
        )}
      </figcaption>
      {showTable && table ? (
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-left text-xs tabular">
            <thead className="sticky top-0 bg-surface text-muted">
              <tr>{table.columns.map((c) => <th key={c} className="py-1 pr-3 font-medium">{c}</th>)}</tr>
            </thead>
            <tbody>
              {table.rows.map((r, i) => (
                <tr key={i} className="border-t border-line">
                  {r.map((c, j) => <td key={j} className="py-1 pr-3">{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </figure>
  );
}

type Row = Record<string, string | number | null | undefined>;

export function LinesChart({ data, x, series, height = 220, yDomain, band, format, xFormat, dots, dotsLabel }: { data: Row[]; x: string; series: SeriesDef[]; height?: number; yDomain?: [number | 'auto', number | 'auto']; band?: [number, number]; format?: (v: number, key: string) => string; xFormat?: (v: string) => string; dots?: string; dotsLabel?: string }) {
  const t = useTokens();
  return (
    <>
      <Legend series={series} />
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -4 }}>
          <CartesianGrid stroke={t.grid} vertical={false} />
          <XAxis dataKey={x} tickLine={false} axisLine={{ stroke: t.grid }} tickFormatter={xFormat} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} domain={yDomain ?? ['auto', 'auto']} width={52} tickFormatter={(v) => (format ? format(v, '') : String(v))} />
          {band && <ReferenceArea y1={band[0]} y2={band[1]} fill={t.goodSoft} fillOpacity={0.7} stroke="none" />}
          <Tooltip content={<TooltipBox format={format} labelFormat={xFormat} />} />
          {dots && <Scatter dataKey={dots} name={dotsLabel ?? dots} fill={t.muted} shape={(p: { cx?: number; cy?: number }) => <circle cx={p.cx} cy={p.cy} r={2.5} fill={t.muted} opacity={0.55} />} />}
          {series.filter((s) => s.key !== dots).map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={t[s.colour]} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: t.surface, strokeWidth: 2 }} connectNulls strokeLinecap="round" />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
}

export function BarsChart({ data, x, series, height = 220, stacked, format, xFormat, band }: { data: Row[]; x: string; series: SeriesDef[]; height?: number; stacked?: boolean; format?: (v: number, key: string) => string; xFormat?: (v: string) => string; band?: [number, number] }) {
  const t = useTokens();
  return (
    <>
      <Legend series={series} />
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -4 }} barCategoryGap="28%">
          <CartesianGrid stroke={t.grid} vertical={false} />
          <XAxis dataKey={x} tickLine={false} axisLine={{ stroke: t.grid }} tickFormatter={xFormat} minTickGap={12} />
          <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={(v) => (format ? format(v, '') : String(v))} />
          {band && <ReferenceArea y1={band[0]} y2={band[1]} fill={t.goodSoft} fillOpacity={0.7} stroke="none" />}
          <Tooltip cursor={{ fill: t.grid, opacity: 0.4 }} content={<TooltipBox format={format} labelFormat={xFormat} />} />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stackId={stacked ? 'a' : undefined}
              fill={t[s.colour]}
              maxBarSize={24}
              stroke={stacked ? t.surface : undefined}
              strokeWidth={stacked ? 2 : 0}
              radius={!stacked || i === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

export function Sparkline({ data, k, height = 36 }: { data: Row[]; k: string; height?: number }) {
  const t = useTokens();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
        <Line type="monotone" dataKey={k} stroke={t.s1} strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AreaWash({ data, x, k, label, height = 180, format, xFormat }: { data: Row[]; x: string; k: string; label: string; height?: number; format?: (v: number, key: string) => string; xFormat?: (v: string) => string }) {
  const t = useTokens();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -4 }}>
        <CartesianGrid stroke={t.grid} vertical={false} />
        <XAxis dataKey={x} tickLine={false} axisLine={{ stroke: t.grid }} tickFormatter={xFormat} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} width={52} />
        <Tooltip content={<TooltipBox format={format} labelFormat={xFormat} />} />
        <Area type="monotone" dataKey={k} name={label} stroke={t.s1} strokeWidth={2} fill={t.s1} fillOpacity={0.1} connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
