import { PIPELINE_STATUSES, type PipelineStatus } from '../lib/types';

interface PipelineStatusBarProps {
  counts: Record<string, number>;
  onStatusClick?: (status: PipelineStatus) => void;
  activeStatus?: string | null;
}

// Color mapping for each status
const statusColors: Record<PipelineStatus, { bg: string; activeBg: string; text: string; border: string }> = {
  Bookmarked: { bg: 'fill-slate-50', activeBg: 'fill-slate-500', text: 'text-slate-600', border: '#cbd5e1' },
  Applying: { bg: 'fill-blue-50', activeBg: 'fill-blue-500', text: 'text-blue-600', border: '#93c5fd' },
  Applied: { bg: 'fill-indigo-50', activeBg: 'fill-indigo-500', text: 'text-indigo-600', border: '#a5b4fc' },
  Interviewing: { bg: 'fill-amber-50', activeBg: 'fill-amber-500', text: 'text-amber-600', border: '#fcd34d' },
  Negotiating: { bg: 'fill-purple-50', activeBg: 'fill-purple-500', text: 'text-purple-600', border: '#c4b5fd' },
  Accepted: { bg: 'fill-emerald-50', activeBg: 'fill-emerald-500', text: 'text-emerald-600', border: '#6ee7b7' },
};

export default function PipelineStatusBar({
  counts,
  onStatusClick,
  activeStatus,
}: PipelineStatusBarProps) {
  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* Header with total count */}
      <div className="flex items-center justify-end mb-3">
        <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">
          {totalCount} total
        </span>
      </div>

      {/* Pipeline arrows */}
      <div className="flex items-center">
        {PIPELINE_STATUSES.map((status, index) => {
          const count = counts[status] || 0;
          const isActive = activeStatus === status;
          const hasCount = count > 0;
          const isFirst = index === 0;
          const isLast = index === PIPELINE_STATUSES.length - 1;
          const colors = statusColors[status];

          return (
            <button
              key={status}
              onClick={() => onStatusClick?.(status)}
              className="relative flex-1 group focus:outline-none focus:z-10"
              style={{ marginLeft: isFirst ? 0 : -12 }}
            >
              <svg 
                viewBox="0 0 200 60" 
                preserveAspectRatio="none" 
                className="w-full h-14 drop-shadow-sm transition-all duration-300 group-hover:drop-shadow-md group-hover:scale-[1.02] group-active:scale-[0.98]"
              >
                {/* Background */}
                <path
                  d={
                    isFirst
                      ? 'M 0 0 L 185 0 L 200 30 L 185 60 L 0 60 Z'
                      : isLast
                        ? 'M 0 0 L 200 0 L 200 60 L 0 60 L 15 30 Z'
                        : 'M 0 0 L 185 0 L 200 30 L 185 60 L 0 60 L 15 30 Z'
                  }
                  className={`
                    ${isActive ? colors.activeBg : `${colors.bg} group-hover:brightness-95`}
                    transition-all duration-300
                  `}
                  stroke={isActive ? 'transparent' : colors.border}
                  strokeWidth="1.5"
                />
              </svg>

              {/* Text overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <span
                  className={`text-xl font-bold transition-all duration-300 ${
                    isActive 
                      ? 'text-white drop-shadow-sm' 
                      : hasCount 
                        ? colors.text 
                        : 'text-gray-300'
                  } ${hasCount && !isActive ? 'group-hover:scale-110' : ''}`}
                >
                  {count}
                </span>
                <span
                  className={`text-[9px] uppercase tracking-wider font-semibold transition-colors duration-300 ${
                    isActive ? 'text-white/90' : 'text-gray-500 group-hover:text-gray-700'
                  }`}
                >
                  {status}
                </span>
              </div>

              {/* Active indicator pulse */}
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping opacity-75 absolute top-2 right-6" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Active filter indicator */}
      {activeStatus && (
        <div className="mt-3 flex items-center justify-center">
          <span className="text-xs text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
            <span>Filtering by</span>
            <span className={`font-semibold ${statusColors[activeStatus as PipelineStatus].text}`}>
              {activeStatus}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusClick?.(activeStatus as PipelineStatus);
              }}
              className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
