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
    <div className="flex items-center">
      {PIPELINE_STATUSES.map((status, index) => {
        const count = counts[status] || 0;
        const isActive = activeStatus === status;
        const hasCount = count > 0;
        const isFirst = index === 0;
        const isLast = index === PIPELINE_STATUSES.length - 1;

        return (
          <button
            key={status}
            onClick={() => onStatusClick?.(status)}
            className="relative flex-1 group"
            style={{ marginLeft: isFirst ? 0 : -12 }}
          >
            <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="w-full h-14">
              {/* Define clip path for arrow shape */}
              <defs>
                <clipPath id={`arrow-${index}`}>
                  <path
                    d={
                      isFirst
                        ? 'M 0 0 L 185 0 L 200 30 L 185 60 L 0 60 Z'
                        : isLast
                          ? 'M 0 0 L 200 0 L 200 60 L 0 60 L 15 30 Z'
                          : 'M 0 0 L 185 0 L 200 30 L 185 60 L 0 60 L 15 30 Z'
                    }
                  />
                </clipPath>
              </defs>

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
                  ${isActive ? 'fill-teal-500' : 'fill-white group-hover:fill-gray-50'}
                  transition-colors
                `}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            </svg>

            {/* Text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-lg font-bold ${
                  isActive ? 'text-white' : hasCount ? 'text-teal-600' : 'text-gray-400'
                }`}
              >
                {hasCount ? count : '—'}
              </span>
              <span
                className={`text-[9px] uppercase tracking-wider font-medium ${
                  isActive ? 'text-teal-100' : 'text-gray-500'
                }`}
              >
                {status}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
