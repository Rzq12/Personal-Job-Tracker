import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { JOB_STATUSES, type JobStatus } from '../lib/types';

interface StatusDropdownProps {
  value: JobStatus;
  onChange: (status: JobStatus) => void;
}

const STATUS_CONFIG: Record<JobStatus, { bg: string; text: string; border: string; emoji: string }> = {
  Bookmarked: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', emoji: '🔖' },
  Applying: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', emoji: '✍️' },
  Applied: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', emoji: '📨' },
  Interviewing: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', emoji: '🎤' },
  Negotiating: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', emoji: '🤝' },
  Accepted: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', emoji: '🎉' },
  'I Withdrew': { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', emoji: '🚶' },
  'Not Selected': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', emoji: '❌' },
  'No Response': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', emoji: '👻' },
  Archived: { bg: 'bg-gray-100', text: 'text-gray-400', border: 'border-gray-200', emoji: '📦' },
};

export default function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
    setIsOpen(!isOpen);
  };

  const config = STATUS_CONFIG[value];

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold border 
          ${config.bg} ${config.text} ${config.border}
          hover:shadow-md hover:scale-105 active:scale-100
          transition-all duration-200 flex items-center gap-1.5`}
      >
        <span>{config.emoji}</span>
        {value}
        <svg className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: dropdownPos.top,
              left: dropdownPos.left,
              zIndex: 9999,
            }}
            className="w-52 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl shadow-2xl py-2 animate-fadeSlideUp"
          >
            <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Change Status
            </div>
            {JOB_STATUSES.map((status) => {
              const statusConfig = STATUS_CONFIG[status];
              const isSelected = value === status;
              
              return (
                <button
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(status);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full text-left px-3 py-2 text-sm flex items-center gap-2.5
                    transition-all duration-150
                    ${isSelected 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  <span className={`w-7 h-7 rounded-lg ${statusConfig.bg} flex items-center justify-center text-sm`}>
                    {statusConfig.emoji}
                  </span>
                  <span className="flex-1 font-medium">{status}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
