import { useState } from 'react';

const BAND_STYLES = {
  'High Risk': 'bg-red-100 text-red-700 border-red-200',
  'Medium Risk': 'bg-amber-100 text-amber-700 border-amber-200',
  'Low Risk': 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const SLA_MAP = {
  'High Risk': '24h',
  'Medium Risk': '48h',
  'Low Risk': '72h',
};

const SLA_STYLES = {
  'High Risk': 'text-red-600 font-semibold',
  'Medium Risk': 'text-amber-600 font-semibold',
  'Low Risk': 'text-slate-400',
};

function SortIcon({ column, sortConfig }) {
  if (sortConfig.key !== column) {
    return <span className="text-slate-300 ml-1">↕</span>;
  }
  return <span className="text-slate-700 ml-1">{sortConfig.dir === 'asc' ? '↑' : '↓'}</span>;
}

export default function PriorityQueue({
  learners, allLearners, filterBand, onFilterChange, onSelectLearner, selectedLearner,
}) {
  const [sortConfig, setSortConfig] = useState({ key: 'riskScore', dir: 'desc' });
  const [search, setSearch] = useState('');

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }
    );
  };

  const filtered = learners
    .filter(l => !search || l.learnerName?.toLowerCase().includes(search.toLowerCase()) || l.learnerId?.toLowerCase().includes(search.toLowerCase()))
    .slice()
    .sort((a, b) => {
      let av = a[sortConfig.key], bv = b[sortConfig.key];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortConfig.dir === 'asc' ? -1 : 1;
      if (av > bv) return sortConfig.dir === 'asc' ? 1 : -1;
      return 0;
    });

  const tabs = [
    { label: 'All', value: 'all', count: allLearners.length },
    { label: 'High Risk', value: 'High Risk', count: allLearners.filter(l => l.riskBand === 'High Risk').length },
    { label: 'Medium Risk', value: 'Medium Risk', count: allLearners.filter(l => l.riskBand === 'Medium Risk').length },
    { label: 'Low Risk', value: 'Low Risk', count: allLearners.filter(l => l.riskBand === 'Low Risk').length },
  ];

  const TAB_ACTIVE = {
    'all': 'border-slate-900 text-slate-900',
    'High Risk': 'border-red-500 text-red-600',
    'Medium Risk': 'border-amber-500 text-amber-600',
    'Low Risk': 'border-emerald-500 text-emerald-700',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Priority Intervention Queue</h3>
          <p className="text-xs text-slate-400 mt-0.5">Sorted by risk score · Click a row to view AI insights</p>
        </div>
        <input
          type="text"
          placeholder="Search learner…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 px-6 gap-1 overflow-x-auto">
        {tabs.map(({ label, value, count }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`flex items-center gap-1.5 py-3 px-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              filterBand === value
                ? TAB_ACTIVE[value] || 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
              filterBand === value ? 'bg-slate-100' : 'bg-slate-50'
            }`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {[
                { label: 'Learner', key: 'learnerName' },
                { label: 'Score', key: 'riskScore' },
                { label: 'Band', key: 'riskBand' },
                { label: 'Top Trigger', key: 'topTrigger' },
                { label: 'Likely Reason', key: 'likelyRefundReason' },
                { label: 'SLA', key: 'riskBand' },
              ].map(({ label, key }) => (
                <th
                  key={label}
                  onClick={() => handleSort(key)}
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-800 whitespace-nowrap select-none"
                >
                  {label}
                  <SortIcon column={key} sortConfig={sortConfig} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  No learners match the current filter.
                </td>
              </tr>
            ) : (
              filtered.map(learner => (
                <tr
                  key={learner.learnerId}
                  onClick={() => onSelectLearner(learner)}
                  className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                    selectedLearner?.learnerId === learner.learnerId ? 'bg-blue-50 hover:bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-900">{learner.learnerName}</div>
                    <div className="text-xs text-slate-400">{learner.learnerId}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min((learner.riskScore / 15) * 100, 100)}%`,
                            backgroundColor:
                              learner.riskBand === 'High Risk' ? '#ef4444' :
                              learner.riskBand === 'Medium Risk' ? '#f59e0b' : '#10b981',
                          }}
                        />
                      </div>
                      <span className="font-semibold text-slate-800">{learner.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${BAND_STYLES[learner.riskBand]}`}>
                      {learner.riskBand}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-slate-600 leading-relaxed">{learner.topTrigger}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-slate-500">
                      {learner.likelyRefundReason || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs ${SLA_STYLES[learner.riskBand]}`}>
                      {SLA_MAP[learner.riskBand]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
        <p className="text-xs text-slate-400">{filtered.length} learner{filtered.length !== 1 ? 's' : ''} shown</p>
      </div>
    </div>
  );
}
