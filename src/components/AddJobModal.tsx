import { useState } from 'react';
import type { Job, JobInput, JobStatus } from '../lib/types';
import StarRating from './StarRating';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: JobInput) => void;
  initialData?: Job;
}

export default function AddJobModal({ isOpen, onClose, onSubmit, initialData }: AddJobModalProps) {
  const [formData, setFormData] = useState<JobInput>({
    position: initialData?.position || '',
    company: initialData?.company || '',
    location: initialData?.location || '',
    minSalary: initialData?.minSalary || null,
    maxSalary: initialData?.maxSalary || null,
    status: initialData?.status || 'Bookmarked',
    dateSaved: initialData?.dateSaved?.split('T')[0] || new Date().toISOString().split('T')[0],
    deadline: initialData?.deadline?.split('T')[0] || null,
    dateApplied: initialData?.dateApplied?.split('T')[0] || null,
    followUp: initialData?.followUp?.split('T')[0] || null,
    excitement: initialData?.excitement || 3,
    jobDescription: initialData?.jobDescription || '',
    link: initialData?.link || '',
    notes: initialData?.notes || '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const statuses: JobStatus[] = [
    'Bookmarked',
    'Applying',
    'Applied',
    'Interviewing',
    'Negotiating',
    'Accepted',
    'I Withdrew',
    'Not Selected',
    'No Response',
    'Archived',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{initialData ? 'Edit Job' : 'Add a New Job'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            {/* Position & Company */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Position *
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Acme Corp"
                />
              </div>
            </div>

            {/* Location & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Remote, Jakarta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as JobStatus })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                <input
                  type="number"
                  value={formData.minSalary || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minSalary: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                <input
                  type="number"
                  value={formData.maxSalary || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxSalary: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Saved</label>
                <input
                  type="date"
                  value={formData.dateSaved || ''}
                  onChange={(e) => setFormData({ ...formData, dateSaved: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Applied</label>
                <input
                  type="date"
                  value={formData.dateApplied || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, dateApplied: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Follow Up Date
                </label>
                <input
                  type="date"
                  value={formData.followUp || ''}
                  onChange={(e) => setFormData({ ...formData, followUp: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Excitement Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Excitement</label>
              <StarRating
                rating={formData.excitement || 3}
                onChange={(rating) => setFormData({ ...formData, excitement: rating })}
                size="lg"
              />
            </div>

            {/* Job Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Posting URL
              </label>
              <input
                type="url"
                value={formData.link || ''}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="https://..."
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <textarea
                value={formData.jobDescription || ''}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="Paste the job description here..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="Your personal notes..."
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
          >
            {initialData ? 'Save Changes' : 'Add Job'}
          </button>
        </div>
      </div>
    </div>
  );
}
