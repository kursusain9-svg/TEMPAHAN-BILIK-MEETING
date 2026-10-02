import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  ExternalLink
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    bookings,
    openBookingDetail,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-sky-600 shrink-0" />;
    }
  };

  const handleOpenRelatedBooking = (bookingId?: string) => {
    if (!bookingId) return;
    const b = bookings.find(item => item.id === bookingId);
    if (b) {
      openBookingDetail(b);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600" />
            Pusat Notifikasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Makluman permohonan, status kelulusan, peringatan mesyuarat, dan perubahan jadual
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllNotificationsAsRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Tanda Semua Dibaca</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`pb-2.5 font-bold border-b-2 px-3 transition-colors ${
            filter === 'all'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Semua Notifikasi ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`pb-2.5 font-bold border-b-2 px-3 transition-colors ${
            filter === 'unread'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Belum Dibaca ({notifications.filter(n => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">Tiada notifikasi ditemui</p>
            <p className="mt-0.5">Anda telah selesai menyemak semua makluman terkini.</p>
          </div>
        ) : (
          filteredNotifs.map(notif => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`p-4 flex items-start gap-4 transition-colors hover:bg-slate-50 cursor-pointer ${
                !notif.read ? 'bg-indigo-50/30' : ''
              }`}
            >
              <div className="mt-0.5">{getIcon(notif.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {notif.createdAt}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.bookingId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenRelatedBooking(notif.bookingId);
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>Lihat Tempahan Berkaitan</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notif.id);
                }}
                className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
                title="Padam Makluman"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
