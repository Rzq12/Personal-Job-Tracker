import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { useState } from 'react';
import AddJobModal from '../components/AddJobModal';
import { api } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import type { JobInput } from '../lib/types';

const features = [
  {
    icon: 'schedule',
    iconBg: 'rgba(0, 96, 113, 0.08)',
    iconColor: '#006071',
    title: 'Schedule Tracking',
    desc: 'Automated sync with your calendar to keep all interview stages organized in one architectural view.',
    badge: 'Coming Winter',
    badgeColor: '#006071',
  },
  {
    icon: 'notifications_active',
    iconBg: 'rgba(0, 94, 128, 0.08)',
    iconColor: '#005e80',
    title: 'Reminders',
    desc: 'Smart alerts for pre-interview prep, follow-up emails, and thank-you notes customized for every role.',
    badge: 'Q1 2024',
    badgeColor: '#005e80',
  },
  {
    icon: 'edit_note',
    iconBg: 'rgba(84, 95, 115, 0.08)',
    iconColor: '#545f73',
    title: 'Prep Notes',
    desc: 'A dedicated workspace for STAR method responses and company research embedded in your tracker.',
    badge: 'Beta Access',
    badgeColor: '#545f73',
  },
  {
    icon: 'insights',
    iconBg: 'rgba(0, 96, 113, 0.08)',
    iconColor: '#006071',
    title: 'Analytics',
    desc: 'Visual data on your conversion rates from initial call to final round offer. Refine your strategy.',
    badge: 'Waitlist Open',
    badgeColor: '#006071',
  },
];

export function Interviews() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: '#f7f9fb' }}>
      <Sidebar onAddJob={() => setIsAddModalOpen(true)} />

      <div className="sidebar-layout pt-16 md:pt-0">
        <TopBar title="Interviews" />

        <div className="px-8 py-8 max-w-7xl">
          {/* Hero banner */}
          <div
            className="relative w-full rounded-2xl overflow-hidden mb-12 shadow-sm"
            style={{ aspectRatio: '21/9' }}
          >
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(0,96,113,0.92) 0%, transparent 60%)',
              }}
            />
            {/* Background pattern */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #006071 0%, #007b8f 50%, #0078a3 100%)',
              }}
            />
            {/* Content */}
            <div className="absolute inset-0 flex items-center px-16">
              <div className="max-w-md text-white">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block"
                  style={{ background: 'rgba(0,120,163,0.3)', backdropFilter: 'blur(8px)' }}
                >
                  Module In Progress
                </span>
                <h3
                  className="text-5xl font-extrabold mb-4 leading-tight"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Master Your Interviews.
                </h3>
                <p
                  className="text-lg leading-relaxed mb-8 opacity-90"
                  style={{ color: '#aaedff' }}
                >
                  We are building an intelligent scheduling and live tracking suite to help you
                  secure the offer.
                </p>
                <div className="flex gap-4">
                  <button
                    className="bg-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95"
                    style={{ color: '#006071' }}
                  >
                    Get Early Access
                  </button>
                </div>
              </div>
            </div>
            {/* Decorative icon */}
            <div
              className="absolute right-16 top-1/2 -translate-y-1/2 select-none pointer-events-none hidden md:block"
              style={{ color: 'rgba(255,255,255,0.08)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '200px' }}>
                event_available
              </span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-8 rounded-2xl shadow-sm flex flex-col h-full transition-shadow hover:shadow-md"
                style={{ background: '#ffffff' }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform hover:scale-110"
                  style={{ background: f.iconBg, color: f.iconColor }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                    {f.icon}
                  </span>
                </div>
                <h4
                  className="text-xl font-bold mb-3"
                  style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1e' }}
                >
                  {f.title}
                </h4>
                <p
                  className="text-sm leading-relaxed mb-6 flex-1"
                  style={{ color: '#3e484b' }}
                >
                  {f.desc}
                </p>
                <div className="mt-auto pt-4 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: f.badgeColor }}>
                    {f.badge}
                  </span>
                  <span className="w-8 h-px" style={{ background: '#bec8cc' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Asymmetric Info Block */}
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 space-y-6">
              <h5
                className="text-3xl font-bold"
                style={{ fontFamily: 'Manrope, sans-serif', color: '#006071' }}
              >
                Why we are reinventing the interview tracker.
              </h5>
              <p className="leading-loose" style={{ color: '#3e484b' }}>
                The Digital Architect approach treats the interview not just as a meeting, but as a
                critical structural phase in your career construction. Most tools just give you a
                date. We provide the blueprint for the entire conversation.
              </p>
              <div className="flex gap-12 mt-8">
                <div>
                  <p
                    className="text-3xl font-extrabold"
                    style={{ fontFamily: 'Manrope, sans-serif', color: '#006071' }}
                  >
                    84%
                  </p>
                  <p className="text-xs font-medium uppercase tracking-widest" style={{ color: '#bec8cc' }}>
                    Confidence Boost
                  </p>
                </div>
                <div>
                  <p
                    className="text-3xl font-extrabold"
                    style={{ fontFamily: 'Manrope, sans-serif', color: '#005e80' }}
                  >
                    12h
                  </p>
                  <p className="text-xs font-medium uppercase tracking-widest" style={{ color: '#bec8cc' }}>
                    Weekly Time Saved
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div
                className="aspect-square rounded-2xl relative overflow-hidden flex items-center justify-center p-12"
                style={{ background: '#f2f4f6' }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(0,96,113,0.05) 0%, transparent 70%)',
                  }}
                />
                <div className="relative z-10 text-center">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '120px', color: '#bec8cc' }}
                  >
                    event_available
                  </span>
                  <p className="mt-4 font-semibold" style={{ color: '#6e797c' }}>
                    Interview module coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAB */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-8 right-8 text-white h-14 px-6 rounded-full shadow-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 z-50"
          style={{ background: 'linear-gradient(45deg, #006071, #007b8f)' }}
        >
          <span className="material-symbols-outlined">add</span>
          <span className="font-bold text-sm tracking-wide">Schedule Session</span>
        </button>
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
