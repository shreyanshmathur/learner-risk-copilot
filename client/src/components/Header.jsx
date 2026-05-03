export default function Header({ aiStatus, hasData, onExport }) {
  return (
    <header className="bg-stone-900 border-b border-stone-800 sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-6 h-12 flex items-center justify-between">

        {/* Left — wordmark + breadcrumb */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            {/* Logotype mark */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0">
              <rect x="0" y="10" width="4" height="8" rx="1" fill="#6366F1"/>
              <rect x="7" y="5"  width="4" height="13" rx="1" fill="#818CF8"/>
              <rect x="14" y="0" width="4" height="18" rx="1" fill="#A5B4FC"/>
            </svg>
            <span className="text-white font-semibold text-sm tracking-tight leading-none">
              Learner Risk Copilot
            </span>
          </div>
          <span className="text-stone-600 text-sm select-none">/</span>
          <span className="text-stone-400 text-xs font-normal">Intervention Queue</span>
        </div>

        {/* Right — status + actions */}
        <div className="flex items-center gap-4">
          {aiStatus === 'analyzing' && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
              </span>
              <span className="text-stone-400 text-xs">Generating insights</span>
            </div>
          )}
          {aiStatus === 'done' && (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-stone-400 text-xs">Insights ready</span>
            </div>
          )}
          {aiStatus === 'fallback' && (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-stone-500" />
              <span className="text-stone-500 text-xs">Rule-based mode</span>
            </div>
          )}

          <div className="h-4 w-px bg-stone-700" />

          <span className="text-stone-500 text-xs hidden sm:block">Scaler · Learner Success</span>

          {hasData && (
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-white text-xs font-medium rounded transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
