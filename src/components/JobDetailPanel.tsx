import { useState, useEffect } from 'react';
import type { Job, JobStatus } from '../lib/types';
import StarRating from './StarRating';

interface JobDetailPanelProps {
  job: Job;
  onClose: () => void;
  onUpdate: (job: Partial<Job>) => void;
  onDelete: () => void;
}

type TabType = 'info' | 'notes';

export default function JobDetailPanel({ job, onClose, onUpdate, onDelete }: JobDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [notes, setNotes] = useState(job.notes || '');
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Editable fields
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    position: job.position,
    company: job.company,
    location: job.location || '',
    link: job.link || '',
    minSalary: job.minSalary?.toString() || '',
    maxSalary: job.maxSalary?.toString() || '',
    jobDescription: job.jobDescription || '',
  });

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  // Update notes and edit values when job changes
  useEffect(() => {
    setNotes(job.notes || '');
    setEditValues({
      position: job.position,
      company: job.company,
      location: job.location || '',
      link: job.link || '',
      minSalary: job.minSalary?.toString() || '',
      maxSalary: job.maxSalary?.toString() || '',
      jobDescription: job.jobDescription || '',
    });
  }, [
    job.id,
    job.notes,
    job.position,
    job.company,
    job.location,
    job.link,
    job.minSalary,
    job.maxSalary,
    job.jobDescription,
  ]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleFieldSave = (field: string) => {
    const value = editValues[field as keyof typeof editValues];
    if (field === 'minSalary' || field === 'maxSalary') {
      onUpdate({ [field]: value ? parseInt(value) : null });
    } else {
      onUpdate({ [field]: value || null });
    }
    setEditingField(null);
  };

  const handleFieldCancel = (field: string) => {
    // Reset to original value
    setEditValues((prev) => ({
      ...prev,
      [field]:
        field === 'minSalary'
          ? job.minSalary?.toString() || ''
          : field === 'maxSalary'
            ? job.maxSalary?.toString() || ''
            : (job[field as keyof Job] as string) || '',
    }));
    setEditingField(null);
  };

  const EditableField = ({
    field,
    displayValue,
    placeholder,
    type = 'text',
    multiline = false,
  }: {
    field: string;
    displayValue: string;
    placeholder: string;
    type?: string;
    multiline?: boolean;
  }) => {
    const isEditing = editingField === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          {multiline ? (
            <textarea
              value={editValues[field as keyof typeof editValues]}
              onChange={(e) => setEditValues((prev) => ({ ...prev, [field]: e.target.value }))}
              placeholder={placeholder}
              className="flex-1 px-2 py-1 text-sm border border-teal-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={4}
              autoFocus
            />
          ) : (
            <input
              type={type}
              value={editValues[field as keyof typeof editValues]}
              onChange={(e) => setEditValues((prev) => ({ ...prev, [field]: e.target.value }))}
              placeholder={placeholder}
              className="flex-1 px-2 py-1 text-sm border border-teal-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFieldSave(field);
                if (e.key === 'Escape') handleFieldCancel(field);
              }}
            />
          )}
          <button
            onClick={() => handleFieldSave(field)}
            className="p-1 text-teal-600 hover:bg-teal-50 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
          <button
            onClick={() => handleFieldCancel(field)}
            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      );
    }

    return (
      <span
        onClick={() => setEditingField(field)}
        className="cursor-pointer hover:bg-gray-100 px-1 -mx-1 rounded transition-colors inline-flex items-center gap-1 group"
        title="Click to edit"
      >
        {displayValue || <span className="text-gray-400 italic">{placeholder}</span>}
        <svg
          className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      </span>
    );
  };

  const tabs = [
    { id: 'info' as const, label: 'Job Info', icon: 'ℹ️' },
    { id: 'notes' as const, label: 'Notes', icon: '📝' },
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const handleSaveNotes = () => {
    onUpdate({ notes });
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 lg:hidden ${
          isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`
          fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 
          flex flex-col z-50 shadow-2xl
          transform transition-all duration-300 ease-out
          ${isVisible && !isClosing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1 animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-900">
                <EditableField
                  field="position"
                  displayValue={job.position}
                  placeholder="Job Position"
                />
              </h2>
              <p className="text-gray-600">
                <EditableField
                  field="company"
                  displayValue={job.company}
                  placeholder="Company Name"
                />{' '}
                —{' '}
                <EditableField
                  field="location"
                  displayValue={job.location || 'Remote'}
                  placeholder="Location"
                />
              </p>
              <p className="text-sm text-gray-400 mt-1">Saved {formatDate(job.dateSaved)}</p>
            </div>
            <div className="flex items-center gap-2">
              <StarRating
                rating={job.excitement}
                onChange={(rating) => onUpdate({ excitement: rating })}
                size="md"
              />
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-all duration-200 hover:rotate-90"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Status Pipeline */}
          <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-2">
            {['Bookmarked', 'Applying', 'Applied', 'Interviewing', 'Negotiating', 'Accepted'].map(
              (status, index) => {
                const isActive = job.status === status;
                const isPast =
                  [
                    'Bookmarked',
                    'Applying',
                    'Applied',
                    'Interviewing',
                    'Negotiating',
                    'Accepted',
                  ].indexOf(job.status) >= index;

                return (
                  <button
                    key={status}
                    onClick={() => onUpdate({ status: status as JobStatus })}
                    className={`
                    px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap 
                    transition-all duration-200 transform hover:scale-105
                    ${isActive ? 'bg-teal-600 text-white shadow-md' : isPast ? 'bg-teal-100 text-teal-700 hover:bg-teal-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                  `}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {status}
                  </button>
                );
              }
            )}
            <button
              onClick={handleClose}
              className="px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-full whitespace-nowrap transition-colors duration-200"
            >
              Close Job
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
              flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-1
              transition-all duration-200 relative
              ${
                activeTab === tab.id
                  ? 'text-teal-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
            >
              <span className="transition-transform duration-200 hover:scale-110">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 animate-scale-x" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div key={activeTab} className="animate-fade-slide-in">
            {activeTab === 'info' && (
              <div className="space-y-4">
                <section className="animate-fade-in" style={{ animationDelay: '0ms' }}>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Dates</h3>
                  <div className="space-y-2 text-sm bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between hover:bg-gray-100 p-1 rounded transition-colors">
                      <span className="text-gray-500">Date Saved</span>
                      <span className="font-medium">{formatDate(job.dateSaved)}</span>
                    </div>
                    <div className="flex justify-between hover:bg-gray-100 p-1 rounded transition-colors">
                      <span className="text-gray-500">Deadline</span>
                      <span className="font-medium">{formatDate(job.deadline)}</span>
                    </div>
                    <div className="flex justify-between hover:bg-gray-100 p-1 rounded transition-colors">
                      <span className="text-gray-500">Date Applied</span>
                      <span className="font-medium">{formatDate(job.dateApplied)}</span>
                    </div>
                    <div className="flex justify-between hover:bg-gray-100 p-1 rounded transition-colors">
                      <span className="text-gray-500">Follow Up</span>
                      <span className="font-medium">{formatDate(job.followUp)}</span>
                    </div>
                  </div>
                </section>

                <section className="animate-fade-in" style={{ animationDelay: '50ms' }}>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Salary</h3>
                  <div className="text-sm bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <EditableField
                      field="minSalary"
                      displayValue={job.minSalary?.toLocaleString() || ''}
                      placeholder="Min"
                      type="number"
                    />
                    <span className="text-gray-400">-</span>
                    <span className="text-gray-500">$</span>
                    <EditableField
                      field="maxSalary"
                      displayValue={job.maxSalary?.toLocaleString() || ''}
                      placeholder="Max"
                      type="number"
                    />
                  </div>
                </section>

                <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Job Link</h3>
                  <div className="text-sm bg-gray-50 rounded-lg p-3">
                    {editingField === 'link' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={editValues.link}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, link: e.target.value }))
                          }
                          placeholder="https://..."
                          className="flex-1 px-2 py-1 text-sm border border-teal-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleFieldSave('link');
                            if (e.key === 'Escape') handleFieldCancel('link');
                          }}
                        />
                        <button
                          onClick={() => handleFieldSave('link')}
                          className="p-1 text-teal-600 hover:bg-teal-50 rounded"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleFieldCancel('link')}
                          className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : job.link ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 hover:underline break-all flex items-center gap-1 flex-1"
                        >
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          <span className="truncate">{job.link}</span>
                        </a>
                        <button
                          onClick={() => setEditingField('link')}
                          className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                          title="Edit link"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <span
                        onClick={() => setEditingField('link')}
                        className="text-gray-400 cursor-pointer hover:text-gray-600 flex items-center gap-1"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add job link
                      </span>
                    )}
                  </div>
                </section>

                <section className="animate-fade-in" style={{ animationDelay: '150ms' }}>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Job Description</h3>
                  <div className="text-sm bg-gray-50 rounded-lg p-3">
                    {editingField === 'jobDescription' ? (
                      <div className="space-y-2">
                        <textarea
                          value={editValues.jobDescription}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, jobDescription: e.target.value }))
                          }
                          placeholder="Paste the job description here..."
                          className="w-full px-2 py-1 text-sm border border-teal-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                          rows={6}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleFieldCancel('jobDescription')}
                            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleFieldSave('jobDescription')}
                            className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : job.jobDescription ? (
                      <div
                        onClick={() => setEditingField('jobDescription')}
                        className="text-gray-700 whitespace-pre-wrap cursor-pointer hover:bg-gray-100 -m-2 p-2 rounded transition-colors group"
                        title="Click to edit"
                      >
                        {job.jobDescription}
                        <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 ml-2">
                          (click to edit)
                        </span>
                      </div>
                    ) : (
                      <span
                        onClick={() => setEditingField('jobDescription')}
                        className="text-gray-400 cursor-pointer hover:text-gray-600 flex items-center gap-1"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add job description
                      </span>
                    )}
                  </div>
                </section>

                {job.keywords && job.keywords.length > 0 && (
                  <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {job.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs rounded-full border border-teal-200 
                        hover:bg-teal-100 transition-colors cursor-default transform hover:scale-105 duration-200"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes here..."
                  className="w-full h-64 p-3 border border-gray-200 rounded-lg text-sm resize-none 
                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                transition-all duration-200"
                />
                <button
                  onClick={handleSaveNotes}
                  className="w-full py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium 
                hover:bg-teal-700 active:scale-[0.98] transition-all duration-200 
                shadow-md hover:shadow-lg"
                >
                  Save Notes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <button
            onClick={() => onUpdate({ archived: !job.archived })}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 
          hover:bg-gray-50 active:scale-[0.98] transition-all duration-200"
          >
            {job.archived ? 'Unarchive' : 'Archive'}
          </button>
          <button
            onClick={onDelete}
            className="flex-1 py-2.5 border border-red-300 rounded-lg text-sm font-medium text-red-600 
          hover:bg-red-50 active:scale-[0.98] transition-all duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
