import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import KPICards from './components/KPICards';
import RiskChart from './components/RiskChart';
import PriorityQueue from './components/PriorityQueue';
import LearnerDetail from './components/LearnerDetail';
import { mapColumns, mapRow } from './utils/columnMapper';
import { calculateRiskScore } from './utils/riskScoring';
import { getFallbackInsights } from './utils/fallbackInsights';
import sampleData from './data/sampleData';

export default function App() {
  const [learners, setLearners] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterBand, setFilterBand] = useState('all');
  const [warnings, setWarnings] = useState([]);
  const [aiStatus, setAiStatus] = useState('idle');

  const processLearners = useCallback(async (rawData) => {
    if (!rawData || rawData.length === 0) {
      setWarnings(['The file appears to be empty or could not be parsed.']);
      return;
    }

    setIsLoading(true);
    setWarnings([]);
    setLearners([]);
    setSelectedLearner(null);
    setAiStatus('idle');

    // Map columns
    const headers = Object.keys(rawData[0]);
    const { mapping } = mapColumns(headers);
    const newWarnings = [];

    if (!mapping.learnerId) newWarnings.push('No Learner ID column detected - auto-generating IDs.');
    if (!mapping.learnerName) newWarnings.push('No Learner Name column detected - using "Unknown Learner".');
    if (!mapping.week0SessionsAttended) newWarnings.push('Week 0 Sessions column not found - scoring that signal as 0.');

    // Map + score
    const scoredLearners = rawData
      .map((row) => {
        const mapped = mapRow(row, mapping);
        const scores = calculateRiskScore(mapped);
        return { ...mapped, ...scores };
      })
      .sort((a, b) => b.riskScore - a.riskScore);

    // Apply fallback insights immediately so UI is responsive
    const withFallback = scoredLearners.map(l => ({
      ...l,
      ...getFallbackInsights(l),
      aiGenerated: false,
    }));

    setLearners(withFallback);
    setWarnings(newWarnings);
    setIsLoading(false);
    setAiStatus('analyzing');

    // Try AI enrichment
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90_000);

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learners: scoredLearners }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const { results } = await res.json();
        setLearners(prev =>
          prev.map((l, i) => ({
            ...l,
            ...(results[i] || {}),
            aiGenerated: true,
          }))
        );
        setSelectedLearner(prev =>
          prev ? { ...prev, ...(results.find((_, i) => withFallback[i]?.learnerId === prev.learnerId) || {}), aiGenerated: true } : null
        );
        setAiStatus('done');
      } else {
        setAiStatus('fallback');
      }
    } catch {
      setAiStatus('fallback');
    }
  }, []);

  const parseFile = useCallback(async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      return new Promise((resolve, reject) =>
        Papa.parse(file, { header: true, skipEmptyLines: true, complete: r => resolve(r.data), error: reject })
      );
    } else if (['xls', 'xlsx'].includes(ext)) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
          try {
            const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
            resolve(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { raw: false }));
          } catch (err) { reject(err); }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    }
    throw new Error('Unsupported file type');
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    try {
      const rawData = await parseFile(file);
      await processLearners(rawData);
    } catch (err) {
      setWarnings([`Failed to parse file: ${err.message}. Please check the format.`]);
    }
  }, [parseFile, processLearners]);

  const handleSampleData = useCallback(() => {
    processLearners(sampleData);
  }, [processLearners]);

  const handleReset = useCallback(() => {
    setLearners([]);
    setSelectedLearner(null);
    setWarnings([]);
    setAiStatus('idle');
    setFilterBand('all');
  }, []);

  const exportToCSV = useCallback(() => {
    if (!learners.length) return;
    const headers = [
      'Learner ID', 'Learner Name', 'Risk Score', 'Risk Band', 'SLA',
      'Top Trigger', 'Likely Refund Reason', 'Recommended Intervention', 'Counselor Script',
      'Dashboard Walkthrough', 'Week 0 Sessions', 'Attendance %',
      'Mentor Booked', 'Click Rate %', 'Enrollment Date',
    ];
    const rows = learners.map(l => [
      l.learnerId, l.learnerName, l.riskScore, l.riskBand,
      l.riskBand === 'High Risk' ? '24h' : l.riskBand === 'Medium Risk' ? '48h' : '72h',
      l.topTrigger, l.likelyRefundReason || '', l.recommendedIntervention || '', l.counselorScript || '',
      l.dashboardWalkthroughCompleted ? 'Yes' : 'No',
      l.week0SessionsAttended ?? '', l.overallAttendance ?? '',
      l.mentorSessionBooked ? 'Yes' : 'No',
      l.communicationClickRate ?? '', l.enrollmentDate || '',
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `risk-queue-${new Date().toISOString().split('T')[0]}.csv`,
    });
    a.click();
    URL.revokeObjectURL(url);
  }, [learners]);

  const hasData = learners.length > 0;
  const filteredLearners = learners.filter(l => filterBand === 'all' || l.riskBand === filterBand);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Header aiStatus={aiStatus} hasData={hasData} onExport={exportToCSV} />

      <main className="max-w-screen-xl mx-auto px-5 sm:px-8 py-7 space-y-5">

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="border border-amber-200 bg-amber-50 rounded px-4 py-3 flex gap-3">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div className="space-y-0.5">
              {warnings.map((w, i) => <p key={i} className="text-xs text-amber-800">{w}</p>)}
            </div>
          </div>
        )}

        {!hasData ? (
          <FileUpload
            onFileUpload={handleFileUpload}
            onSampleData={handleSampleData}
            isLoading={isLoading}
          />
        ) : (
          <>
            {/* Breadcrumb / context bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span className="font-mono">{learners.length} learners</span>
                <span>·</span>
                <span>Today's queue</span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-stone-400 hover:text-stone-700 transition-colors underline underline-offset-2"
              >
                Upload new file
              </button>
            </div>

            {/* KPI strip */}
            <KPICards learners={learners} />

            {/* Chart + Scoring model */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-1">
                <RiskChart learners={learners} />
              </div>

              {/* Scoring reference */}
              <div className="lg:col-span-2 bg-white border border-stone-200 rounded-md p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-stone-800">Scoring model</h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Each learner is scored across activation signals and note sentiment.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-8">
                  {[
                    ['Dashboard Walkthrough not done', '+2'],
                    ['Week 0 sessions = 0',            '+3'],
                    ['Week 0 sessions = 1',            '+2'],
                    ['Attendance below 25%',           '+3'],
                    ['Mentor session not booked',      '+1'],
                    ['Zero communication click rate',  '+1'],
                    ['Finance / EMI note',             '+2'],
                    ['Schedule / workload note',       '+2'],
                    ['Personal / medical note',        '+2'],
                    ['Expectation mismatch note',      '+2'],
                  ].map(([label, pts]) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0 gap-2">
                      <span className="text-xs text-stone-600">{label}</span>
                      <span className="font-mono text-xs font-semibold text-stone-800 flex-shrink-0">{pts}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-4 flex-wrap">
                  {[
                    { range: '0-2', label: 'Low',    dot: 'bg-emerald-600', text: 'text-emerald-700' },
                    { range: '3-5', label: 'Medium', dot: 'bg-amber-500',   text: 'text-amber-700'   },
                    { range: '6+',  label: 'High',   dot: 'bg-red-600',     text: 'text-red-700'     },
                  ].map(({ range, label, dot, text }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      <span className={`font-mono text-xs font-medium ${text}`}>{range} pts</span>
                      <span className="text-xs text-stone-400">→ {label} Risk</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Priority queue table */}
            <PriorityQueue
              learners={filteredLearners}
              allLearners={learners}
              filterBand={filterBand}
              onFilterChange={setFilterBand}
              onSelectLearner={setSelectedLearner}
              selectedLearner={selectedLearner}
            />
          </>
        )}
      </main>

      {selectedLearner && (
        <LearnerDetail learner={selectedLearner} onClose={() => setSelectedLearner(null)} />
      )}
    </div>
  );
}
