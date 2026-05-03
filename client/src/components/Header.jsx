export default function Header({ aiStatus, hasData, onExport }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900 leading-tight">Learner Risk Copilot</h1>
              <p className="text-xs text-slate-500 leading-tight">Day 0–14 refund prevention queue</p>
            </div>
          </div>

          {aiStatus === 'analyzing' && (
            <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
              <span className="w-2 h-2 border border-blue-600 border-t-transparent rounded-full animate-spin" />
              Generating AI insights…
            </div>
          )}
          {aiStatus === 'done' && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
              <span className="text-emerald-500">✓</span> AI insights ready
            </div>
          )}
          {aiStatus === 'fallback' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
              Rule-based mode
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:block">Scaler · Learner Success</span>
          {hasData && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
