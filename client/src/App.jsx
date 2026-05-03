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

    if (!mapping.learnerId) newWarnings.push('No Learner ID column detected — auto-generating IDs.');
    if (!mapping.learnerName) newWarnings.push('No Learner Name column detected — using "Unknown Learner".');
    if (!mapping.week0SessionsAttended) newWarnings.push('Week 0 Sessions column not found — scoring that signal as 0.');

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
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header aiStatus={aiStatus} hasData={hasData} onExport={exportToCSV} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div className="space-y-0.5">
              {warnings.map((w, i) => <p key={i} className="text-sm text-amber-800">{w}</p>)}
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
            {/* Reset / upload new */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{learners.length} learners loaded</p>
              <button
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors"
              >
                Upload new file
              </button>
            </div>

            {/* KPI Cards */}
            <KPICards learners={learners} />

            {/* Chart row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <RiskChart learners={learners} />
              </div>
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-1">How risk scoring works</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">Each learner is scored across 6 activation signals and notes analysis. High Risk (≥6) requires outreach within 24h.</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    ['Dashboard Walkthrough not done', '+2'],
                    ['Week 0 sessions = 0', '+3'],
                    ['Week 0 sessions = 1', '+2'],
                    ['Attendance < 25%', '+3'],
                    ['Mentor session not booked', '+1'],
                    ['Zero click rate', '+1'],
                    ['Finance / EMI mention in notes', '+2'],
                    ['Schedule / workload mention', '+2'],
                    ['Personal / medical mention', '+2'],
                    ['Expectation mismatch mention', '+2'],
                  ].map(([label, pts]) => (
                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-xs text-slate-600">{label}</span>
                      <span className="text-xs font-semibold text-slate-800 ml-2">{pts}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-3 flex-wrap">
                  {[
                    { range: '0–2', label: 'Low Risk', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                    { range: '3–5', label: 'Medium Risk', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
                    { range: '6+', label: 'High Risk', cls: 'bg-red-100 text-red-700 border-red-200' },
                  ].map(({ range, label, cls }) => (
                    <span key={label} className={`text-xs px-2.5 py-1 rounded-full font-medium border ${cls}`}>
                      {range} pts → {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Priority Queue */}
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
