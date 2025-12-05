import { PIPELINE_STATUSES, type PipelineStatus } from '../lib/types';

interface PipelineStatusBarProps {
  counts: Record<string, number>;
  onStatusClick?: (status: PipelineStatus) => void;
  activeStatus?: string | null;
}

export default function PipelineStatusBar({
  counts,
  onStatusClick,
  activeStatus,
}: PipelineStatusBarProps) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
      {PIPELINE_STATUSES.map((status, index) => {
        const count = counts[status] || 0;
        const isActive = activeStatus === status;
        const hasCount = count > 0;

        return (
          <button
            key={status}
            onClick={() => onStatusClick?.(status)}
            className={`
              relative flex-1 py-4 px-6 text-center transition-colors
              ${isActive ? 'bg-teal-50' : 'hover:bg-gray-50'}
              ${index !== PIPELINE_STATUSES.length - 1 ? 'border-r border-gray-200' : ''}
            `}
          >
            {/* Arrow decoration */}
            {index !== PIPELINE_STATUSES.length - 1 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                <svg
                  width="20"
                  height="40"
                  viewBox="0 0 20 40"
                  fill="none"
                  className="text-gray-200"
                >
                  <path d="M0 0L20 20L0 40" stroke="currentColor" strokeWidth="1" fill="white" />
                </svg>
              </div>
            )}

            <div
              className={`text-2xl font-semibold ${hasCount ? 'text-teal-700' : 'text-gray-400'}`}
            >
              {hasCount ? count : '—'}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{status}</div>
          </button>
        );
      })}
    </div>
  );
}
