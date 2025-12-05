import { useState, useRef, useEffect } from 'react';

type GroupByOption = 'None' | 'Status';

interface GroupByDropdownProps {
  value: GroupByOption;
  onChange: (value: GroupByOption) => void;
}

export default function GroupByDropdown({ value, onChange }: GroupByDropdownProps) {
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

  const options: GroupByOption[] = ['None', 'Status'];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded flex items-center gap-1"
      >
        Group by: {value}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-3 py-2 text-sm hover:bg-gray-50
                ${value === option ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}
              `}
            >
              Group by: {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
