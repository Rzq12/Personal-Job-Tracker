import { useState, useRef, useEffect } from 'react';
import { JOB_STATUSES, type JobStatus } from '../lib/types';

interface StatusDropdownProps {
  value: JobStatus;
  onChange: (status: JobStatus) => void;
}

const STATUS_COLORS: Record<JobStatus, string> = {
  Bookmarked: 'bg-gray-100 text-gray-700',
  Applying: 'bg-blue-100 text-blue-700',
  Applied: 'bg-teal-100 text-teal-700',
  Interviewing: 'bg-purple-100 text-purple-700',
  Negotiating: 'bg-orange-100 text-orange-700',
  Accepted: 'bg-green-100 text-green-700',
  'I Withdrew': 'bg-gray-100 text-gray-500',
  'Not Selected': 'bg-red-100 text-red-700',
  'No Response': 'bg-pink-100 text-pink-700',
  Archived: 'bg-gray-100 text-gray-400',
};

export default function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1 rounded text-sm font-medium ${STATUS_COLORS[value]} hover:opacity-80 transition-opacity`}
      >
        {value}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          {JOB_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => {
                onChange(status);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2
                ${value === status ? 'bg-teal-50' : ''}
              `}
            >
              <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[status].split(' ')[0]}`} />
              {status}
              {status === 'No Response' && <span className="ml-auto">👻</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
