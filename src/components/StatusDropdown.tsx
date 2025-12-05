import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { JOB_STATUSES, type JobStatus } from '../lib/types';

interface StatusDropdownProps {
  value: JobStatus;
  onChange: (status: JobStatus) => void;
}

const STATUS_COLORS: Record<JobStatus, string> = {
  Bookmarked: 'bg-gray-100 text-gray-700 border-gray-300',
  Applying: 'bg-blue-100 text-blue-700 border-blue-300',
  Applied: 'bg-teal-100 text-teal-700 border-teal-300',
  Interviewing: 'bg-purple-100 text-purple-700 border-purple-300',
  Negotiating: 'bg-orange-100 text-orange-700 border-orange-300',
  Accepted: 'bg-green-100 text-green-700 border-green-300',
  'I Withdrew': 'bg-gray-100 text-gray-500 border-gray-300',
  'Not Selected': 'bg-red-100 text-red-700 border-red-300',
  'No Response': 'bg-pink-100 text-pink-700 border-pink-300',
  Archived: 'bg-gray-100 text-gray-400 border-gray-300',
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

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[value]} hover:opacity-80 transition-opacity`}
      >
        {value}
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
            className="w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-1"
          >
            {JOB_STATUSES.map((status) => (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
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
          </div>,
          document.body
        )}
    </>
  );
}
