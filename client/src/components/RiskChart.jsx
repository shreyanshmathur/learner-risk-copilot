import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  'High Risk': '#ef4444',
  'Medium Risk': '#f59e0b',
  'Low Risk': '#10b981',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm px-3 py-2">
      <p className="text-xs font-semibold text-slate-800">{name}</p>
      <p className="text-sm font-bold text-slate-900">{value} learners</p>
    </div>
  );
};

export default function RiskChart({ learners }) {
  const counts = {
    'High Risk': learners.filter(l => l.riskBand === 'High Risk').length,
    'Medium Risk': learners.filter(l => l.riskBand === 'Medium Risk').length,
    'Low Risk': learners.filter(l => l.riskBand === 'Low Risk').length,
  };

  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const total = learners.length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
      <h3 className="text-sm font-semibold text-slate-800 mb-1">Risk Distribution</h3>
      <p className="text-xs text-slate-400 mb-4">{total} learners analysed</p>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map(({ name }) => (
              <Cell key={name} fill={COLORS[name]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-2 mt-2">
        {Object.entries(counts).map(([band, count]) => (
          <div key={band} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[band] }}
              />
              <span className="text-xs text-slate-600">{band}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900">{count}</span>
              <span className="text-xs text-slate-400">
                {total ? `${Math.round((count / total) * 100)}%` : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
