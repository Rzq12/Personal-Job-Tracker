import { useState } from 'react';
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
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{job.position}</h2>
            <p className="text-gray-600">
              {job.company} — {job.location || 'Remote'}
            </p>
            <p className="text-sm text-gray-400 mt-1">Saved {formatDate(job.dateSaved)}</p>
          </div>
          <div className="flex items-center gap-2">
            <StarRating
              rating={job.excitement}
              onChange={(rating) => onUpdate({ excitement: rating })}
              size="md"
            />
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
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
                  px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors
                  ${isActive ? 'bg-teal-600 text-white' : isPast ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}
                `}
                >
                  {status}
                </button>
              );
            }
          )}
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-full whitespace-nowrap"
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
              ${
                activeTab === tab.id
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'info' && (
          <div className="space-y-4">
            <section>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Dates</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date Saved</span>
                  <span>{formatDate(job.dateSaved)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deadline</span>
                  <span>{formatDate(job.deadline)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date Applied</span>
                  <span>{formatDate(job.dateApplied)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Follow Up</span>
                  <span>{formatDate(job.followUp)}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Salary</h3>
              <div className="text-sm">
                {job.minSalary || job.maxSalary ? (
                  <span>
                    ${job.minSalary?.toLocaleString() || '?'} - $
                    {job.maxSalary?.toLocaleString() || '?'}
                  </span>
                ) : (
                  <span className="text-gray-400">Not specified</span>
                )}
              </div>
            </section>

            {job.link && (
              <section>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Job Link</h3>
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-600 hover:underline break-all"
                >
                  {job.link}
                </a>
              </section>
            )}

            {job.jobDescription && (
              <section>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Job Description</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.jobDescription}</p>
              </section>
            )}

            {job.keywords && job.keywords.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-1">
                  {job.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
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
              className="w-full h-64 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={handleSaveNotes}
              className="w-full py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              Save Notes
            </button>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 flex gap-2">
        <button
          onClick={() => onUpdate({ archived: !job.archived })}
          className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {job.archived ? 'Unarchive' : 'Archive'}
        </button>
        <button
          onClick={onDelete}
          className="flex-1 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
