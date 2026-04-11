import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { useAuth } from '../lib/AuthContext';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import AddJobModal from '../components/AddJobModal';
import { useQueryClient } from '@tanstack/react-query';
import type { JobInput } from '../lib/types';

function FormInput({
  id, label, type = 'text', value, onChange, disabled, placeholder, note,
}: {
  id: string; label: string; type?: string; value: string;
  onChange?: (v: string) => void; disabled?: boolean; placeholder?: string; note?: string;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-wider block"
        style={{ color: '#3e484b' }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-4 py-4 rounded-xl outline-none transition-all"
        style={{
          background: disabled ? '#f2f4f6' : '#e0e3e5',
          color: disabled ? '#9ca3af' : '#191c1e',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'auto',
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 96, 113, 0.2)';
          }
        }}
        onBlur={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = '#e0e3e5';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      />
      {note && <p className="text-xs" style={{ color: '#6e797c' }}>{note}</p>}
    </div>
  );
}

export function Settings() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string }) => api.updateProfile(data),
    onSuccess: (response) => {
      setUser(response.user);
      setProfileMessage('Profile updated successfully!');
      setProfileError('');
      setTimeout(() => setProfileMessage(''), 3000);
    },
    onError: (error: any) => {
      setProfileError(error.message || 'Failed to update profile');
      setProfileMessage('');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.changePassword(data),
    onSuccess: () => {
      setPasswordMessage('Password changed successfully!');
      setPasswordError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(''), 3000);
    },
    onError: (error: any) => {
      setPasswordError(error.message || 'Failed to change password');
      setPasswordMessage('');
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setProfileError('Name is required'); return; }
    updateProfileMutation.mutate({ name: name.trim() });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required'); return;
    }
    if (newPassword.length < 6) { setPasswordError('Min 6 characters'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const SectionCard = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <div className="rounded-2xl shadow-sm p-8" style={{ background: '#ffffff' }}>
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(0, 96, 113, 0.08)', color: '#006071' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{icon}</span>
        </div>
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1e' }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );

  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: '#f7f9fb' }}>
      <Sidebar onAddJob={() => setIsAddModalOpen(true)} />

      <div className="sidebar-layout pt-16 md:pt-0">
        <TopBar title="Settings" />

        <div className="px-8 py-8 max-w-4xl mx-auto space-y-8">
          {/* Profile avatar card */}
          <div
            className="rounded-2xl p-8 relative overflow-hidden shadow-sm"
            style={{ background: 'linear-gradient(135deg, #006071 0%, #007b8f 100%)' }}
          >
            <div className="absolute inset-0 select-none pointer-events-none" style={{ color: 'rgba(255,255,255,0.04)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '300px', position: 'absolute', right: '-40px', bottom: '-60px' }}>person</span>
            </div>
            <div className="relative z-10 flex items-center gap-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold text-white shadow-lg"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
              >
                {userInitial}
              </div>
              <div className="text-white">
                <h2
                  className="text-2xl font-extrabold"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  {user?.name || 'User'}
                </h2>
                <p className="opacity-80 text-sm">{user?.email}</p>
                <span
                  className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  Account Active
                </span>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <SectionCard title="Profile Information" icon="badge">
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <FormInput id="email" label="Email Address" value={user?.email || ''} disabled note="Email cannot be changed" />
              <FormInput id="name" label="Full Name" value={name} onChange={setName} placeholder="Your full name" />

              {profileMessage && (
                <div className="px-4 py-3 rounded-xl text-sm animate-slide-down" style={{ background: '#d1fae5', color: '#065f46' }}>
                  {profileMessage}
                </div>
              )}
              {profileError && (
                <div className="px-4 py-3 rounded-xl text-sm animate-slide-down" style={{ background: '#ffdad6', color: '#93000a' }}>
                  {profileError}
                </div>
              )}

              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="px-6 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(45deg, #006071, #007b8f)' }}
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </SectionCard>

          {/* Preferences */}
          <SectionCard title="Preferences" icon="tune">
            <div className="space-y-4">
              {[
                { label: 'Email Notifications', desc: 'Receive email updates about your applications', checked: false },
                { label: 'Interview Reminders', desc: 'Get reminded before scheduled interviews', checked: true },
                { label: 'Weekly Summary', desc: 'Receive a weekly report of your activity', checked: false },
              ].map((pref) => (
                <div
                  key={pref.label}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: '#f2f4f6' }}
                >
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: '#191c1e' }}>{pref.label}</h3>
                    <p className="text-xs" style={{ color: '#6e797c' }}>{pref.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-not-allowed">
                    <input type="checkbox" className="sr-only peer" defaultChecked={pref.checked} disabled />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600" />
                  </label>
                </div>
              ))}
              <p
                className="text-xs px-1"
                style={{ color: '#f59e0b', background: '#fef3c7', padding: '8px 12px', borderRadius: '8px' }}
              >
                ⚠ Notification features will be available in a future update.
              </p>
            </div>
          </SectionCard>

          {/* Security */}
          <SectionCard title="Security" icon="shield">
            <form onSubmit={handleChangePassword} className="space-y-5">
              <FormInput id="currentPassword" label="Current Password" type="password" value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" />
              <FormInput id="newPassword" label="New Password" type="password" value={newPassword} onChange={setNewPassword} placeholder="••••••••" note="At least 6 characters" />
              <FormInput id="confirmPassword" label="Confirm New Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />

              {passwordMessage && (
                <div className="px-4 py-3 rounded-xl text-sm animate-slide-down" style={{ background: '#d1fae5', color: '#065f46' }}>
                  {passwordMessage}
                </div>
              )}
              {passwordError && (
                <div className="px-4 py-3 rounded-xl text-sm animate-slide-down" style={{ background: '#ffdad6', color: '#93000a' }}>
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="px-6 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(45deg, #006071, #007b8f)' }}
              >
                {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </SectionCard>

          {/* Data Management */}
          <SectionCard title="Data Management" icon="folder">
            <div className="space-y-4">
              <div
                className="flex items-start justify-between p-5 rounded-xl"
                style={{ background: '#f2f4f6' }}
              >
                <div>
                  <h3 className="text-sm font-bold mb-1" style={{ color: '#191c1e' }}>Export Your Data</h3>
                  <p className="text-sm" style={{ color: '#6e797c' }}>Download all your job application data as Excel</p>
                </div>
                <button
                  disabled
                  className="px-4 py-2 rounded-xl text-sm font-bold cursor-not-allowed"
                  style={{ background: '#e0e3e5', color: '#9ca3af' }}
                >
                  Export
                </button>
              </div>

              <div
                className="flex items-start justify-between p-5 rounded-xl"
                style={{ background: '#ffdad6', border: '1px solid rgba(186,26,26,0.15)' }}
              >
                <div>
                  <h3 className="text-sm font-bold mb-1" style={{ color: '#93000a' }}>Delete Account</h3>
                  <p className="text-sm" style={{ color: '#c62828' }}>Permanently delete your account and all data</p>
                </div>
                <button
                  disabled
                  className="px-4 py-2 rounded-xl text-sm font-bold cursor-not-allowed"
                  style={{ background: 'rgba(186,26,26,0.15)', color: '#ba1a1a' }}
                >
                  Delete
                </button>
              </div>

              <p className="text-xs" style={{ color: '#6e797c' }}>Data management features coming soon</p>
            </div>
          </SectionCard>
        </div>
      </div>

      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data: JobInput) => {
          try {
            await api.createJob(data);
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            setIsAddModalOpen(false);
          } catch (error) {
            console.error('Failed to create job:', error);
          }
        }}
      />
    </div>
  );
}
