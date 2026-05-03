import { useState } from 'react';

const BAND_DOT = {
  'High Risk':   'bg-red-600',
  'Medium Risk': 'bg-amber-500',
  'Low Risk':    'bg-emerald-600',
};

const BAND_TEXT = {
  'High Risk':   'text-red-700',
  'Medium Risk': 'text-amber-700',
  'Low Risk':    'text-emerald-700',
};

const ROW_ACCENT = {
  'High Risk':   'row-high',
  'Medium Risk': 'row-med',
  'Low Risk':    'row-low',
};

const SLA = {
  'High Risk':   { label: '24h', cls: 'text-red-600' },
  'Medium Risk': { label: '48h', cls: 'text-amber-600' },
  'Low Risk':    { label: '72h', cls: 'text-stone-400' },
};

function ChevronIcon({ up }) {
  return (
    <svg className="w-3 h-3 inline-block ml-1" viewBox="0 0 12 12" fill="currentColor">
      <path d={up ? 'M6 3l4 5H2l4-5z' : 'M6 9L2 4h8L6 9z'} />
    </svg>
  );
}

export default function PriorityQueue({
  learners, allLearners, filterBand, onFilterChange, onSelectLearner, selectedLearner,
}) {
  const [sort, setSort]   = useState({ key: 'riskScore', dir: 'desc' });
  const [search, setSearch] = useState('');

  const handleSort = (key) =>
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' });

  const filtered = learners
    .filter(l =>
      !search ||
      l.learnerName?.toLowerCase().includes(search.toLowerCase()) ||
      l.learnerId?.toLowerCase().includes(search.toLowerCase())
    )
    .slice()
    .sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ?  1 : -1;
      return 0;
    });

  const counts = {
    all:          allLearners.length,
    'High Risk':  allLearners.filter(l => l.riskBand === 'High Risk').length,
    'Medium Risk':allLearners.filter(l => l.riskBand === 'Medium Risk').length,
    'Low Risk':   allLearners.filter(l => l.riskBand === 'Low Risk').length,
  };

  const FILTER_TABS = [
    { label: 'All',         value: 'all',         active: 'text-stone-900 border-stone-900' },
    { label: 'High risk',   value: 'High Risk',   active: 'text-red-700 border-red-500' },
    { label: 'Medium risk', value: 'Medium Risk', active: 'text-amber-700 border-amber-500' },
    { label: 'Low risk',    value: 'Low Risk',    active: 'text-emerald-700 border-emerald-600' },
  ];

  const COL_HEADERS = [
    { label: 'Learner',        key: 'learnerName',        width: 'w-44' },
    { label: 'Score',          key: 'riskScore',          width: 'w-24' },
    { label: 'Risk',           key: 'riskBand',           width: 'w-28' },
    { label: 'Primary trigger',key: 'topTrigger',         width: '' },
    { label: 'Likely reason',  key: 'likelyRefundReason', width: 'w-44' },
    { label: 'SLA',            key: null,                 width: 'w-16' },
  ];

  return (
    <div className="bg-white border border-stone-200 rounded-md overflow-hidden">

      {/* Toolbar */}
      <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-stone-800">Intervention queue</h3>
          <p className="text-xs text-stone-400 mt-0.5">Click a row to open the learner profile</p>
        </div>
        <input
          type="text"
          placeholder="Search name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 text-sm border border-stone-200 rounded bg-stone-50 placeholder-stone-300 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 w-52 transition"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-stone-100 px-5 gap-0 overflow-x-auto">
        {FILTER_TABS.map(({ label, value, active }) => {
          const n = counts[value] ?? 0;
          const isActive = filterBand === value;
          return (
            <button
              key={value}
              onClick={() => onFilterChange(value)}
              className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive ? `${active} border-current` : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              {label}
              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                isActive ? 'bg-stone-100 text-stone-700' : 'bg-stone-50 text-stone-400'
              }`}>{n}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              {COL_HEADERS.map(({ label, key, width }) => (
                <th
                  key={label}
                  onClick={() => key && handleSort(key)}
                  className={`text-left px-4 py-2.5 text-[11px] font-semibold text-stone-500 uppercase tracking-wider ${
                    key ? 'cursor-pointer hover:text-stone-800 select-none' : ''
                  } ${width}`}
                >
                  {label}
                  {key && sort.key === key && (
                    <ChevronIcon up={sort.dir === 'asc'} />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-stone-400">
                  No learners match the current filter.
                </td>
              </tr>
            ) : (
              filtered.map(learner => {
                const isActive = selectedLearner?.learnerId === learner.learnerId;
                return (
                  <tr
                    key={learner.learnerId}
                    onClick={() => onSelectLearner(learner)}
                    className={`cursor-pointer transition-colors border-b border-stone-100 last:border-0 ${ROW_ACCENT[learner.riskBand]} ${
                      isActive ? 'table-row-active' : 'table-row-hover'
                    }`}
                  >
                    {/* Learner */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-stone-900 text-sm leading-tight">
                        {learner.learnerName}
                      </div>
                      <div className="font-mono text-[10px] text-stone-400 mt-0.5">
                        {learner.learnerId}
                      </div>
                    </td>

                    {/* Score */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-16 h-1 bg-stone-100 rounded-full overflow-hidden flex-shrink-0">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min((learner.riskScore / 15) * 100, 100)}%`,
                              backgroundColor:
                                learner.riskBand === 'High Risk'   ? '#B91C1C' :
                                learner.riskBand === 'Medium Risk' ? '#D97706' : '#16A34A',
                            }}
                          />
                        </div>
                        <span className="font-mono text-sm font-medium text-stone-800">
                          {learner.riskScore}
                        </span>
                      </div>
                    </td>

                    {/* Risk band */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${BAND_DOT[learner.riskBand]}`} />
                        <span className={`text-xs font-medium ${BAND_TEXT[learner.riskBand]}`}>
                          {learner.riskBand.replace(' Risk', '')}
                        </span>
                      </div>
                    </td>

                    {/* Top trigger */}
                    <td className="px-4 py-3 max-w-xs">
                      <span className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                        {learner.topTrigger}
                      </span>
                    </td>

                    {/* Likely reason */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-stone-500 leading-relaxed">
                        {learner.likelyRefundReason || '-'}
                      </span>
                    </td>

                    {/* SLA */}
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs font-semibold ${SLA[learner.riskBand]?.cls}`}>
                        {SLA[learner.riskBand]?.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
        <span className="font-mono text-[11px] text-stone-400">
          {filtered.length} of {allLearners.length} learners
        </span>
        {filterBand !== 'all' && (
          <button
            onClick={() => onFilterChange('all')}
            className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
}
