import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  Building2,
  Users,
  BarChart3,
  Bell,
  Settings,
  History,
  CheckCircle,
  Plus,
  DoorOpen,
  X
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    unreadNotificationsCount,
    bookings,
    currentUser,
    openBookingWizard,
    settings,
  } = useApp();

  const pendingApprovalsCount = bookings.filter(b => b.status === 'Menunggu Kelulusan').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'bookings',
      label: 'Tempahan',
      icon: CalendarDays,
      badge: (currentUser.role === 'Admin' || currentUser.role === 'Pengurus') && pendingApprovalsCount > 0
        ? pendingApprovalsCount
        : undefined,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    { id: 'calendar', label: 'Kalendar', icon: CalendarRange },
    { id: 'availability', label: 'Ketersediaan Bilik', icon: DoorOpen },
    { id: 'rooms', label: 'Bilik Mesyuarat', icon: Building2 },
    {
      id: 'users',
      label: 'Pengguna',
      icon: Users,
      roleRequired: ['Admin', 'Pengurus']
    },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    {
      id: 'notifications',
      label: 'Notifikasi',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-700'
    },
    {
      id: 'audit-log',
      label: 'Log Aktiviti',
      icon: History,
      roleRequired: ['Admin']
    },
    { id: 'settings', label: 'Tetapan', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
                TEMPAHAN BILIK
              </h1>
              <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                {settings.orgName}
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-4">
          <button
            onClick={() => {
              openBookingWizard();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Tempahan Baru</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            if (item.roleRequired && !item.roleRequired.includes(currentUser.role)) {
              return null;
            }

            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-indigo-700' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] text-slate-400">Mod Kelulusan:</span>
            <span className="text-[11px] font-semibold text-emerald-400 capitalize">
              {settings.approvalMode === 'auto' ? 'Auto Lulus' : 'Perlu Kelulusan'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] text-slate-400">Waktu Operasi:</span>
            <span className="text-[11px] text-slate-300">
              {settings.operatingStartTime} – {settings.operatingEndTime}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
