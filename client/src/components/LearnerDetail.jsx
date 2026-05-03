import { useEffect } from 'react';

const BAND_STYLES = {
  'High Risk': 'bg-red-100 text-red-700 border-red-200',
  'Medium Risk': 'bg-amber-100 text-amber-700 border-amber-200',
  'Low Risk': 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const SLA_MAP = { 'High Risk': '24 hours', 'Medium Risk': '48 hours', 'Low Risk': '72 hours' };

function Signal({ label, value, good }) {
  const isGood = good != null ? good : true;
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-slate-100 last:border-0 gap-3">
      <span className="text-xs text-slate-500 leading-relaxed">{label}</span>
      <span className={`text-xs font-medium text-right leading-relaxed ${isGood ? 'text-emerald-700' : 'text-red-600'}`}>
        {value}
      </span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{title}</p>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

export default function LearnerDetail({ learner, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const att = learner.overallAttendance;
  const cr = learner.communicationClickRate;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-slate-50 shadow-2xl overflow-y-auto scrollbar-thin flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{learner.learnerName}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{learner.learnerId} · Enrolled {learner.enrollmentDate || '—'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors ml-4 mt-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 space-y-4">
          {/* Risk badge + SLA */}
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${BAND_STYLES[learner.riskBand]}`}>
              {learner.riskBand}
            </span>
            <span className="text-xs text-slate-500">
              Risk score: <strong className="text-slate-800">{learner.riskScore}</strong> · SLA:{' '}
              <strong className={learner.riskBand === 'High Risk' ? 'text-red-600' : 'text-amber-600'}>
                {SLA_MAP[learner.riskBand]}
              </strong>
            </span>
            {learner.aiGenerated && (
              <span className="ml-auto text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                AI-generated
              </span>
            )}
          </div>

          {/* AI Risk Summary */}
          <Section title="Risk Summary">
            <p className="text-sm text-slate-700 leading-relaxed py-3">
              {learner.riskSummary || 'No summary available.'}
            </p>
          </Section>

          {/* Activation Signals */}
          <Section title="Activation Signals">
            <Signal
              label="Dashboard Walkthrough"
              value={learner.dashboardWalkthroughCompleted ? 'Completed' : 'Not completed'}
              good={learner.dashboardWalkthroughCompleted}
            />
            <Signal
              label="Week 0 Sessions Attended"
              value={learner.week0SessionsAttended ?? '—'}
              good={learner.week0SessionsAttended >= 2}
            />
            <Signal
              label="Overall Attendance"
              value={att != null ? `${att}%` : '—'}
              good={att != null && att >= 25}
            />
            <Signal
              label="Mentor Session Booked"
              value={learner.mentorSessionBooked ? 'Yes' : 'No'}
              good={learner.mentorSessionBooked}
            />
            <Signal
              label="Communication Click Rate"
              value={cr != null ? `${cr}%` : '—'}
              good={cr != null && cr > 0}
            />
            <Signal
              label="Preferred / Assigned Batch"
              value={`${learner.preferredBatchSlot || '—'} / ${learner.assignedBatchSlot || '—'}`}
              good={learner.preferredBatchSlot === learner.assignedBatchSlot}
            />
          </Section>

          {/* Risk Triggers */}
          {learner.triggers?.length > 0 && (
            <Section title="Risk Triggers Detected">
              <ul className="py-2 space-y-1.5">
                {learner.triggers.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">▸</span>
                    {t}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Likely Reason */}
          <Section title="Likely Refund Reason">
            <p className="text-sm font-medium text-slate-800 py-3">
              {learner.likelyRefundReason || '—'}
            </p>
          </Section>

          {/* Recommended Intervention */}
          <Section title="Recommended Intervention">
            <p className="text-sm text-slate-700 leading-relaxed py-3">
              {learner.recommendedIntervention || '—'}
            </p>
          </Section>

          {/* Counselor Script */}
          <Section title="Suggested Call Script">
            <div className="py-3">
              <div className="bg-slate-100 rounded-lg px-4 py-3 border-l-4 border-slate-400">
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{learner.counselorScript || '—'}"
                </p>
              </div>
            </div>
          </Section>

          {/* Notes (if any) */}
          {(learner.supportNotes || learner.counselorNotes || learner.refundComments) && (
            <Section title="Field Notes">
              {learner.refundComments && (
                <div className="py-2">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Refund Comments</p>
                  <p className="text-xs text-slate-600">{learner.refundComments}</p>
                </div>
              )}
              {learner.supportNotes && (
                <div className="py-2">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Support Notes</p>
                  <p className="text-xs text-slate-600">{learner.supportNotes}</p>
                </div>
              )}
              {learner.counselorNotes && (
                <div className="py-2">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Counselor Notes</p>
                  <p className="text-xs text-slate-600">{learner.counselorNotes}</p>
                </div>
              )}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
