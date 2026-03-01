import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p>{label}</p>
      <p>{payload[0]?.name}: {payload[0]?.value?.toLocaleString?.()}</p>
    </div>
  );
}

export default function MetricVsTimeChart({ data, metricField, timeField }) {
  const [enlarged, setEnlarged] = useState(false);

  const handleDownload = () => {
    const csv = ['date,value\n' + data.map((d) => `${d.time},${d.value}`).join('\n')];
    const blob = new Blob([csv.join('')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${metricField}_vs_${timeField}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const chart = (
    <ResponsiveContainer width="100%" height={enlarged ? 400 : 280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
        <XAxis
          dataKey="time"
          tickFormatter={(v) => (v ? new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '')}
          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="value" name={metricField} stroke="#818cf8" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div
      className={`metric-vs-time-chart ${enlarged ? 'enlarged' : ''}`}
      onClick={() => setEnlarged((e) => !e)}
      role="button"
      tabIndex={0}
      onKeyDown={(ev) => ev.key === 'Enter' && setEnlarged((e) => !e)}
      aria-label={enlarged ? 'Shrink chart' : 'Enlarge chart'}
    >
      <div className="chart-actions" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => setEnlarged((e) => !e)}>
          {enlarged ? 'Shrink' : 'Enlarge'}
        </button>
        <button type="button" onClick={handleDownload}>
          Download CSV
        </button>
      </div>
      {chart}
    </div>
  );
}
