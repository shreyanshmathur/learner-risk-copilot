function Stat({ label, value, note, highlight }) {
  return (
    <div className="flex-1 px-6 py-5 min-w-0">
      <div className={`font-mono text-2xl font-medium leading-none tracking-tight ${highlight ? 'text-red-700' : 'text-stone-900'}`}>
        {value}
      </div>
      <div className="text-xs text-stone-500 mt-1.5 font-normal leading-snug">{label}</div>
      {note && (
        <div className={`text-[11px] mt-1 font-mono ${highlight ? 'text-red-500' : 'text-stone-400'}`}>
          {note}
        </div>
      )}
    </div>
  );
}

export default function KPICards({ learners }) {
  const total  = learners.length;
  const high   = learners.filter(l => l.riskBand === 'High Risk').length;
  const medium = learners.filter(l => l.riskBand === 'Medium Risk').length;
  const low    = learners.filter(l => l.riskBand === 'Low Risk').length;
  const riskPct = total ? Math.round(((high * 1.0 + medium * 0.4) / total) * 100) : 0;

  return (
    <div className="bg-white border border-stone-200 rounded-md overflow-hidden">
      <div className="flex divide-x divide-stone-200">
        <Stat
          label="Total learners"
          value={total}
          note="enrolled cohort"
        />
        <Stat
          label="High risk"
          value={high}
          note="24h SLA"
          highlight={high > 0}
        />
        <Stat
          label="Medium risk"
          value={medium}
          note="48h SLA"
        />
        <Stat
          label="Low risk"
          value={low}
          note="on track"
        />
        <Stat
          label="Est. refund exposure"
          value={`${riskPct}%`}
          note={`${high} urgent · ${medium} watch`}
          highlight={riskPct > 30}
        />
      </div>
    </div>
  );
}
