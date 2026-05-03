function Card({ title, value, sub, accent }) {
  return (
    <div className={`bg-white rounded-xl border p-5 ${accent || 'border-slate-200'}`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">{title}</p>
      <p className={`text-3xl font-bold leading-none mb-1 ${accent ? 'text-red-600' : 'text-slate-900'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function KPICards({ learners }) {
  const total = learners.length;
  const high = learners.filter(l => l.riskBand === 'High Risk').length;
  const medium = learners.filter(l => l.riskBand === 'Medium Risk').length;
  const low = learners.filter(l => l.riskBand === 'Low Risk').length;
  const refundRiskPct = total ? Math.round(((high * 1.0 + medium * 0.4) / total) * 100) : 0;
  const outreach24h = high;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card
        title="Total Learners"
        value={total}
        sub="Enrolled cohort"
      />
      <Card
        title="High Risk"
        value={high}
        sub="Needs 24h outreach"
        accent="border-red-200 bg-red-50"
      />
      <Card
        title="Medium Risk"
        value={medium}
        sub="Needs 48h outreach"
      />
      <Card
        title="Est. Refund Risk"
        value={`${refundRiskPct}%`}
        sub={`${low} learners on track`}
      />
      <Card
        title="24h Outreach"
        value={outreach24h}
        sub="High-priority calls today"
        accent={outreach24h > 0 ? 'border-red-200 bg-red-50' : 'border-slate-200'}
      />
    </div>
  );
}
