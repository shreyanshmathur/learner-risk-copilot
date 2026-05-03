import { useRef, useState } from 'react';

const SIGNALS = [
  'Dashboard Walkthrough completion',
  'Week 0 session attendance',
  'Overall attendance percentage',
  'Mentor session booking',
  'Communication click-through rate',
  'Support & counselor note sentiment',
];

export default function FileUpload({ onFileUpload, onSampleData, isLoading }) {
  const inputRef  = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileUpload(file);
  };

  return (
    <div className="min-h-[72vh] grid grid-cols-1 lg:grid-cols-5 gap-0 overflow-hidden rounded-md border border-stone-200 bg-white">

      {/* Left info panel */}
      <div className="lg:col-span-2 bg-stone-900 p-10 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <rect x="0" y="10" width="4" height="8" rx="1" fill="#6366F1"/>
              <rect x="7" y="5"  width="4" height="13" rx="1" fill="#818CF8"/>
              <rect x="14" y="0" width="4" height="18" rx="1" fill="#A5B4FC"/>
            </svg>
            <span className="text-stone-400 text-xs font-medium tracking-wide uppercase">Risk Analysis</span>
          </div>

          <h2 className="text-white text-2xl font-semibold leading-snug mb-3">
            Surface refund risk<br />before it happens.
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed">
            Upload your learner activation data and get a prioritised intervention queue — scored, ranked, and AI-annotated — in under 60 seconds.
          </p>

          <div className="mt-8 space-y-2">
            <p className="text-stone-500 text-xs uppercase tracking-widest font-medium mb-3">Scored signals</p>
            {SIGNALS.map(s => (
              <div key={s} className="flex items-center gap-2.5">
                <span className="w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0" />
                <span className="text-stone-400 text-xs">{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-800 grid grid-cols-3 gap-4">
          {[['24h', 'SLA for high risk'], ['6', 'scored signals'], ['∞', 'learners supported']].map(([val, lbl]) => (
            <div key={lbl}>
              <div className="font-mono text-lg font-medium text-white">{val}</div>
              <div className="text-stone-500 text-[11px] mt-0.5 leading-tight">{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right upload panel */}
      <div className="lg:col-span-3 p-10 flex flex-col justify-center">
        <h3 className="text-stone-800 font-semibold text-base mb-1">Load your data</h3>
        <p className="text-stone-400 text-xs mb-6">Accepts CSV or Excel. Columns are mapped automatically.</p>

        {/* Drop zone */}
        <div
          className={`relative border-2 border-dashed rounded p-10 text-center cursor-pointer transition-all duration-150 ${
            isDragging
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            className="hidden"
            onChange={(e) => e.target.files[0] && onFileUpload(e.target.files[0])}
          />

          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-5 h-5 border-2 border-stone-400 border-t-stone-900 rounded-full animate-spin" />
              <p className="text-sm text-stone-500">Processing…</p>
            </div>
          ) : (
            <>
              <svg className="w-8 h-8 text-stone-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium text-stone-700 mb-1">
                Drop your file here
              </p>
              <p className="text-xs text-stone-400">or click to browse · CSV, XLS, XLSX</p>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400">or</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        <button
          onClick={onSampleData}
          disabled={isLoading}
          className="w-full py-2.5 border border-stone-200 rounded text-sm font-medium text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-colors disabled:opacity-40"
        >
          Load sample dataset
          <span className="ml-2 font-mono text-xs text-stone-400">12 learners</span>
        </button>

        <p className="text-center text-[11px] text-stone-400 mt-5 leading-relaxed">
          Data stays in your browser. Nothing is stored externally.
        </p>
      </div>
    </div>
  );
}
