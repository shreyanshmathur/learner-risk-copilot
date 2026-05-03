import { useRef, useState } from 'react';

export default function FileUpload({ onFileUpload, onSampleData, isLoading }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileUpload(file);
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Identify learners at refund risk</h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
            Upload your learner activation data to generate a prioritised intervention queue. The tool scores each learner and recommends a personalised outreach action.
          </p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
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
              <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-600 font-medium">Processing learner data…</p>
            </div>
          ) : (
            <>
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-900 mb-1">Drop your file here or click to browse</p>
              <p className="text-xs text-slate-400">Supports CSV and Excel (.xls, .xlsx)</p>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <button
          onClick={onSampleData}
          disabled={isLoading}
          className="mt-4 w-full py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Use sample dataset (12 learners)
        </button>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Risk scoring', desc: 'Rule-based signals from 6 activation metrics' },
            { label: 'AI insights', desc: 'Groq-powered summaries and counselor scripts' },
            { label: 'Export queue', desc: 'Download prioritised CSV for your team' },
          ].map(({ label, desc }) => (
            <div key={label} className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-800 mb-1">{label}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
