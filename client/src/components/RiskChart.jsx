import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
  'High Risk':   '#B91C1C',
  'Medium Risk': '#D97706',
  'Low Risk':    '#16A34A',
};

const DOT_COLORS = {
  'High Risk':   'bg-red-700',
  'Medium Risk': 'bg-amber-600',
  'Low Risk':    'bg-green-600',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-stone-900 text-white text-xs rounded px-3 py-2 shadow-lg">
      <div className="font-medium">{name}</div>
      <div className="font-mono mt-0.5">{value} learners</div>
    </div>
  );
};

export default function RiskChart({ learners }) {
  const counts = {
    'High Risk':   learners.filter(l => l.riskBand === 'High Risk').length,
    'Medium Risk': learners.filter(l => l.riskBand === 'Medium Risk').length,
    'Low Risk':    learners.filter(l => l.riskBand === 'Low Risk').length,
  };
  const total = learners.length;
  const data  = Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white border border-stone-200 rounded-md p-5 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-stone-800">Risk distribution</h3>
        <p className="text-xs text-stone-400 mt-0.5 font-mono">{total} learners</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map(({ name }) => (
                <Cell key={name} fill={COLORS[name]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 space-y-2 border-t border-stone-100 pt-3">
        {Object.entries(counts).map(([band, count]) => (
          <div key={band} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT_COLORS[band]}`} />
              <span className="text-xs text-stone-600">{band}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-medium text-stone-900">{count}</span>
              <span className="font-mono text-xs text-stone-400 w-8 text-right">
                {total ? `${Math.round((count / total) * 100)}%` : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
