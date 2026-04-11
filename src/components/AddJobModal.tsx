import { useState, useEffect } from 'react';
import type { Job, JobInput, JobStatus } from '../lib/types';
import StarRating from './StarRating';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: JobInput) => void;
  initialData?: Job;
}

const getDefaultFormData = (initialData?: Job): JobInput => ({
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

export default function AddJobModal({ isOpen, onClose, onSubmit, initialData }: AddJobModalProps) {
  const [formData, setFormData] = useState<JobInput>(getDefaultFormData(initialData));
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setFormData(getDefaultFormData(initialData));
      // Trigger animation after mount
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialData]);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!shouldRender) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    onSubmit(formData);
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={initialData ? 'Edit job modal' : 'Add new job modal'}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-h-[95vh] overflow-hidden shadow-2xl sm:max-h-[90vh] sm:max-w-2xl 
          transform transition-all duration-300 ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
        style={{ background: '#ffffff', borderRadius: '1.5rem' }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 p-6"
          style={{ borderBottom: '1px solid #e0e3e5', background: '#f7f9fb' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(45deg, #006071, #007b8f)' }}
              >
                <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>
                  {initialData ? 'edit' : 'add_circle'}
                </span>
              </div>
              <h2 className="text-lg font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1e' }}>
                {initialData ? 'Edit Job' : 'Add New Job'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl transition-colors"
              style={{ background: '#e0e3e5', color: '#3e484b' }}
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-180px)]"
        >
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            <div className="space-y-4">
              {/* Position & Company - Stack on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{ background: '#e0e3e5', color: '#191c1e', border: 'none' }}
                    onFocus={(e) => { e.currentTarget.style.background='#ffffff'; e.currentTarget.style.boxShadow='0 0 0 2px rgba(0,96,113,0.2)'; }}
                    onBlur={(e) => { e.currentTarget.style.background='#e0e3e5'; e.currentTarget.style.boxShadow='none'; }}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{ background: '#e0e3e5', color: '#191c1e', border: 'none' }}
                    onFocus={(e) => { e.currentTarget.style.background='#ffffff'; e.currentTarget.style.boxShadow='0 0 0 2px rgba(0,96,113,0.2)'; }}
                    onBlur={(e) => { e.currentTarget.style.background='#e0e3e5'; e.currentTarget.style.boxShadow='none'; }}
                    placeholder="e.g., Acme Corp"
                  />
                </div>
              </div>

              {/* Location & Status - Stack on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{ background: '#e0e3e5', color: '#191c1e', border: 'none' }}
                    onFocus={(e) => { e.currentTarget.style.background='#ffffff'; e.currentTarget.style.boxShadow='0 0 0 2px rgba(0,96,113,0.2)'; }}
                    onBlur={(e) => { e.currentTarget.style.background='#e0e3e5'; e.currentTarget.style.boxShadow='none'; }}
                    placeholder="e.g., Remote, Jakarta"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as JobStatus })
                    }
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{ background: '#e0e3e5', color: '#191c1e', border: 'none' }}
                    onFocus={(e) => { e.currentTarget.style.background='#ffffff'; e.currentTarget.style.boxShadow='0 0 0 2px rgba(0,96,113,0.2)'; }}
                    onBlur={(e) => { e.currentTarget.style.background='#e0e3e5'; e.currentTarget.style.boxShadow='none'; }}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Min Salary
                  </label>
                  <input
                    type="number"
                    value={formData.minSalary || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minSalary: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{ background: '#e0e3e5', color: '#191c1e', border: 'none' }}
                    onFocus={(e) => { e.currentTarget.style.background='#ffffff'; e.currentTarget.style.boxShadow='0 0 0 2px rgba(0,96,113,0.2)'; }}
                    onBlur={(e) => { e.currentTarget.style.background='#e0e3e5'; e.currentTarget.style.boxShadow='none'; }}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Max Salary
                  </label>
                  <input
                    type="number"
                    value={formData.maxSalary || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxSalary: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{ background: '#e0e3e5', color: '#191c1e', border: 'none' }}
                    onFocus={(e) => { e.currentTarget.style.background='#ffffff'; e.currentTarget.style.boxShadow='0 0 0 2px rgba(0,96,113,0.2)'; }}
                    onBlur={(e) => { e.currentTarget.style.background='#e0e3e5'; e.currentTarget.style.boxShadow='none'; }}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Date Saved
                  </label>
                  <input
                    type="date"
                    value={formData.dateSaved || ''}
                    onChange={(e) => setFormData({ ...formData, dateSaved: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline || ''}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value || null })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Date Applied
                  </label>
                  <input
                    type="date"
                    value={formData.dateApplied || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, dateApplied: e.target.value || null })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Follow Up Date
                  </label>
                  <input
                    type="date"
                    value={formData.followUp || ''}
                    onChange={(e) => setFormData({ ...formData, followUp: e.target.value || null })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Excitement Rating */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Excitement
                </label>
                <StarRating
                  rating={formData.excitement || 3}
                  onChange={(rating) => setFormData({ ...formData, excitement: rating })}
                  size="lg"
                />
              </div>

              {/* Job Link */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Job Posting URL
                </label>
                <input
                  type="url"
                  value={formData.link || ''}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="https://..."
                />
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Job Description
                </label>
                <textarea
                  value={formData.jobDescription || ''}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Paste the job description here..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Your personal notes..."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="p-5 flex flex-col-reverse sm:flex-row justify-end gap-3 flex-shrink-0"
            style={{ background: '#f7f9fb', borderTop: '1px solid #e0e3e5' }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold transition-colors touch-manipulation"
              style={{ background: '#e0e3e5', color: '#3e484b' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 text-white rounded-xl text-sm font-bold transition-all duration-200 touch-manipulation active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(45deg, #006071, #007b8f)', boxShadow: '0 4px 12px rgba(0,96,113,0.2)' }}
            >
              {initialData ? 'Save Changes' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
