import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Bell,
  CheckCheck,
  Trash2,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  Calendar,
  ShieldCheck,
  Briefcase,
  Menu,
  Clock,
  Sparkles
} from 'lucide-react';
import { Role } from '../types';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    currentUser,
    switchRole,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    setActiveTab,
    setIsGlobalSearchOpen,
    openBookingWizard,
    settings,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
      {/* Left: Mobile hamburger & search trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-hidden"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search trigger bar */}
        <button
          type="button"
          onClick={() => setIsGlobalSearchOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 rounded-lg border border-slate-200 transition-colors w-48 sm:w-72 md:w-80 text-left cursor-pointer group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          <span className="truncate">Cari bilik, mesyuarat, penganjur...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Role Switcher Demo, Quick Book, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher for seamless testing */}
        <div className="hidden xl:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium px-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            Peranan:
          </span>
          {(['Admin', 'Pengurus', 'Pengguna'] as Role[]).map(role => (
            <button
              key={role}
              onClick={() => switchRole(role)}
              className={`px-2.5 py-1 font-medium rounded-md transition-all ${
                currentUser.role === role
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Quick Booking Button */}
        <button
          onClick={() => openBookingWizard()}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-xs"
        >
          <Calendar className="w-4 h-4" />
          <span>+ Buat Tempahan</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Pusat Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Notifikasi</h3>
                  <p className="text-xs text-slate-500">
                    {unreadNotificationsCount} notifikasi belum dibaca
                  </p>
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 hover:underline"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tanda Semua Dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Tiada notifikasi pada masa ini.
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !notif.read ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div
                        className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                          !notif.read ? 'bg-indigo-600' : 'bg-transparent'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {notif.createdAt}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="text-slate-300 hover:text-rose-500 p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
                        title="Padam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    setActiveTab('notifications');
                  }}
                  className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Lihat Semua Notifikasi &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
            aria-label="Profil Pengguna"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                {currentUser.name}
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  {currentUser.role}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 truncate max-w-[130px]">
                {currentUser.department}
              </div>
            </div>
          </button>

          {/* Profile Menu Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs text-slate-400 font-medium">Log Masuk Sebagai</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                <div className="mt-2 text-[11px] inline-flex items-center gap-1 text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                  <Briefcase className="w-3 h-3" />
                  {currentUser.position}
                </div>
              </div>

              {/* Role Switcher in profile for mobile screens */}
              <div className="xl:hidden px-4 py-2 border-b border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Tukar Peranan (Demo)
                </p>
                <div className="flex gap-1">
                  {(['Admin', 'Pengurus', 'Pengguna'] as Role[]).map(role => (
                    <button
                      key={role}
                      onClick={() => {
                        switchRole(role);
                        setIsProfileMenuOpen(false);
                      }}
                      className={`flex-1 py-1 text-xs rounded text-center transition-colors ${
                        currentUser.role === role
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setActiveTab('profile');
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 text-left"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Profil Pengguna
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setActiveTab('settings');
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 text-left"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  Tetapan Organisasi
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    switchRole('Pengguna');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Log Keluar / Reset Sesi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
