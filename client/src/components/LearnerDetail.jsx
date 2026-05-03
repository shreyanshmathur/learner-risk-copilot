import { useEffect } from 'react';

const BAND_CONFIG = {
  'High Risk':   { dot: 'bg-red-600',     text: 'text-red-700',     label: 'High Risk',   sla: '24 hours',  slaColor: 'text-red-600'   },
  'Medium Risk': { dot: 'bg-amber-500',   text: 'text-amber-700',   label: 'Medium Risk', sla: '48 hours',  slaColor: 'text-amber-600' },
  'Low Risk':    { dot: 'bg-emerald-600', text: 'text-emerald-700', label: 'Low Risk',    sla: '72 hours',  slaColor: 'text-stone-400' },
};

function Row({ label, value, good, mono }) {
  const isGood = good == null ? true : good;
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-stone-100 last:border-0 gap-4">
      <span className="text-xs text-stone-500 leading-relaxed flex-shrink-0">{label}</span>
      <span className={`text-xs text-right leading-relaxed ${mono ? 'font-mono' : 'font-medium'} ${
        isGood ? 'text-emerald-700' : 'text-red-600'
      }`}>
        {value}
      </span>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">{children}</p>
  );
}

export default function LearnerDetail({ learner, onClose }) {
  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const band = BAND_CONFIG[learner.riskBand] || BAND_CONFIG['Low Risk'];
  const att  = learner.overallAttendance;
  const cr   = learner.communicationClickRate;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed overlay — no blur, keeps it professional */}
      <div
        className="absolute inset-0 bg-stone-900/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-[460px] h-full bg-white shadow-2xl flex flex-col overflow-hidden">

        {/* Sticky header */}
        <div className="bg-white border-b border-stone-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-stone-900 truncate">{learner.learnerName}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-mono text-[11px] text-stone-400">{learner.learnerId}</span>
                {learner.enrollmentDate && (
                  <>
                    <span className="text-stone-300">·</span>
                    <span className="text-[11px] text-stone-400">Enrolled {learner.enrollmentDate}</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-stone-400 hover:text-stone-700 transition-colors mt-0.5"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Risk strip */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone-100">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${band.dot}`} />
              <span className={`text-xs font-semibold ${band.text}`}>{band.label}</span>
            </div>
            <span className="text-stone-300 text-xs">|</span>
            <span className="font-mono text-xs text-stone-500">
              Score <span className="font-semibold text-stone-800">{learner.riskScore}</span>/15
            </span>
            <span className="text-stone-300 text-xs">|</span>
            <span className={`font-mono text-xs font-semibold ${band.slaColor}`}>
              SLA {band.sla}
            </span>
            {learner.aiGenerated && (
              <span className="ml-auto font-mono text-[10px] text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                AI
              </span>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-6">

          {/* Risk summary */}
          <div>
            <SectionLabel>Risk summary</SectionLabel>
            <p className="text-sm text-stone-700 leading-relaxed">
              {learner.riskSummary || 'No summary available.'}
            </p>
          </div>

          {/* Activation signals */}
          <div>
            <SectionLabel>Activation signals</SectionLabel>
            <div className="border border-stone-200 rounded overflow-hidden">
              <Row
                label="Dashboard Walkthrough"
                value={learner.dashboardWalkthroughCompleted ? 'Completed' : 'Not completed'}
                good={learner.dashboardWalkthroughCompleted}
              />
              <Row
                label="Week 0 sessions"
                value={learner.week0SessionsAttended ?? '—'}
                good={learner.week0SessionsAttended >= 2}
                mono
              />
              <Row
                label="Overall attendance"
                value={att != null ? `${att}%` : '—'}
                good={att != null && att >= 25}
                mono
              />
              <Row
                label="Mentor session"
                value={learner.mentorSessionBooked ? 'Booked' : 'Not booked'}
                good={learner.mentorSessionBooked}
              />
              <Row
                label="Comm. click rate"
                value={cr != null ? `${cr}%` : '—'}
                good={cr != null && cr > 0}
                mono
              />
              <Row
                label="Batch alignment"
                value={`${learner.preferredBatchSlot || '—'} → ${learner.assignedBatchSlot || '—'}`}
                good={learner.preferredBatchSlot === learner.assignedBatchSlot}
              />
            </div>
          </div>

          {/* Risk triggers */}
          {learner.triggers?.length > 0 && (
            <div>
              <SectionLabel>Risk triggers</SectionLabel>
              <div className="space-y-1.5">
                {learner.triggers.map((t, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-stone-600">
                    <span className="font-mono text-red-400 mt-px flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Likely reason + intervention */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <SectionLabel>Likely refund reason</SectionLabel>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${band.dot}`} />
                <span className="text-sm font-medium text-stone-800">
                  {learner.likelyRefundReason || '—'}
                </span>
              </div>
            </div>
            <div>
              <SectionLabel>Recommended action</SectionLabel>
              <p className="text-sm text-stone-700 leading-relaxed">
                {learner.recommendedIntervention || '—'}
              </p>
            </div>
          </div>

          {/* Call script */}
          <div>
            <SectionLabel>Call script</SectionLabel>
            <div className="bg-stone-50 border border-stone-200 rounded p-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <svg className="w-3 h-3 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span className="text-[10px] uppercase tracking-widest font-medium text-stone-400">
                  Suggested opening
                </span>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed italic">
                "{learner.counselorScript || '—'}"
              </p>
            </div>
          </div>

          {/* Field notes */}
          {(learner.refundComments || learner.supportNotes || learner.counselorNotes) && (
            <div>
              <SectionLabel>Field notes</SectionLabel>
              <div className="space-y-3">
                {[
                  ['Refund comment', learner.refundComments],
                  ['Support',        learner.supportNotes],
                  ['Counselor',      learner.counselorNotes],
                ].filter(([, v]) => v).map(([label, val]) => (
                  <div key={label}>
                    <p className="text-[10px] uppercase tracking-widest font-medium text-stone-400 mb-1">{label}</p>
                    <p className="text-xs text-stone-600 leading-relaxed">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
