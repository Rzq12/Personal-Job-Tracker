interface QuickActionsProps {
  onAddJob: () => void;
  onExport: () => void;
}

export default function QuickActions({ onAddJob, onExport }: QuickActionsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Add Job Button */}
        <button
          onClick={onAddJob}
          className="group rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-600 to-sky-600 p-6 text-white shadow-md shadow-cyan-700/30 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-lg">Add New Job</p>
              <p className="text-sm text-cyan-100">Track a new opportunity in seconds</p>
            </div>
          </div>
        </button>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-[0.99]"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-lg">Export to Excel</p>
              <p className="text-sm text-slate-500">Download report for backup or sharing</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
