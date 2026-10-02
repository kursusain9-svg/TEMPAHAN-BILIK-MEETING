import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Plus,
  Clock,
  Building2,
  Users
} from 'lucide-react';
import {
  formatDateISO,
  formatDateMalay,
  formatTime12h,
  MONTH_NAMES_MS,
  DAY_NAMES_MS,
  DAY_NAMES_SHORT_MS
} from '../utils/dateUtils';
import { Booking, BookingStatus } from '../types';

type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export const CalendarPage: React.FC = () => {
  const {
    bookings,
    rooms,
    openBookingDetail,
    openBookingWizard,
  } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    if (selectedRoomFilter !== 'all' && b.roomId !== selectedRoomFilter) return false;
    if (selectedStatusFilter !== 'all' && b.status !== selectedStatusFilter) return false;
    return true;
  });

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() - 7);
    } else if (viewMode === 'day') {
      d.setDate(d.getDate() - 1);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() + 7);
    } else if (viewMode === 'day') {
      d.setDate(d.getDate() + 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Color styles
  const getBookingColor = (status: BookingStatus) => {
    switch (status) {
      case 'Diluluskan':
        return 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700';
      case 'Sedang Berlangsung':
        return 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700 animate-pulse';
      case 'Menunggu Kelulusan':
        return 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600';
      case 'Selesai':
        return 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700';
      case 'Dibatalkan':
        return 'bg-slate-400 text-white border-slate-500 line-through opacity-60';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  // Build Month Grid
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarCells = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const iso = formatDateISO(prevDate);
      calendarCells.push({
        dayNum,
        iso,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    const todayISO = formatDateISO(new Date());
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const iso = formatDateISO(d);
      calendarCells.push({
        dayNum,
        iso,
        isCurrentMonth: true,
        isToday: iso === todayISO,
      });
    }

    // Next month padding (complete 35 or 42 cells)
    const remaining = (7 - (calendarCells.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextDate = new Date(year, month + 1, dayNum);
      const iso = formatDateISO(nextDate);
      calendarCells.push({
        dayNum,
        iso,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Day Header Row */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-slate-700 text-center text-xs font-bold py-2.5">
          {DAY_NAMES_MS.map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[560px]">
          {calendarCells.map((cell, idx) => {
            const dayBookings = filteredBookings.filter(b => b.date === cell.iso);

            return (
              <div
                key={idx}
                onClick={() => {
                  if (cell.isCurrentMonth) {
                    openBookingWizard(undefined, cell.iso);
                  }
                }}
                className={`p-1.5 sm:p-2 flex flex-col justify-between transition-colors min-h-[105px] group cursor-pointer ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-50/50 text-slate-300'
                    : cell.isToday
                    ? 'bg-indigo-50/30'
                    : 'hover:bg-slate-50/80 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      cell.isToday
                        ? 'bg-indigo-600 text-white font-extrabold shadow-xs'
                        : cell.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {dayBookings.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                      {dayBookings.length} mesyuarat
                    </span>
                  )}
                </div>

                {/* Booking badges */}
                <div className="mt-1 space-y-1 overflow-y-auto max-h-[85px]">
                  {dayBookings.slice(0, 3).map(b => (
                    <div
                      key={b.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        openBookingDetail(b);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border truncate cursor-pointer shadow-2xs transition-transform hover:scale-[1.02] ${getBookingColor(
                        b.status
                      )}`}
                      title={`${b.startTime} - ${b.title} (${b.roomName})`}
                    >
                      <span className="font-mono text-[9px] mr-1 opacity-90">{b.startTime}</span>
                      <span>{b.title}</span>
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-[10px] font-bold text-indigo-600 px-1 hover:underline">
                      +{dayBookings.length - 3} lagi...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Build Week View
  const renderWeekView = () => {
    // Find Sunday of the current week
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const iso = formatDateISO(d);
      return {
        date: d,
        iso,
        dayName: DAY_NAMES_MS[i],
        dayShort: DAY_NAMES_SHORT_MS[i],
        dayNum: d.getDate(),
        isToday: iso === formatDateISO(new Date()),
      };
    });

    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Week Header */}
          <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold py-2.5 text-center">
            <div className="text-slate-400">Masa</div>
            {weekDays.map(wd => (
              <div key={wd.iso} className={`${wd.isToday ? 'text-indigo-600 font-extrabold' : ''}`}>
                <div>{wd.dayShort}</div>
                <div className="text-sm">{wd.dayNum}</div>
              </div>
            ))}
          </div>

          {/* Hourly Timeline */}
          <div className="divide-y divide-slate-100">
            {hours.map(hour => {
              return (
                <div key={hour} className="grid grid-cols-8 min-h-[64px] divide-x divide-slate-100">
                  <div className="p-2 text-[11px] font-mono text-slate-400 text-center bg-slate-50/50">
                    {hour}
                  </div>
                  {weekDays.map(wd => {
                    const slotBookings = filteredBookings.filter(
                      b => b.date === wd.iso && b.startTime.startsWith(hour.substring(0, 2))
                    );

                    return (
                      <div
                        key={wd.iso}
                        onClick={() => openBookingWizard(undefined, wd.iso, hour, `${parseInt(hour) + 1}:00`)}
                        className="p-1 hover:bg-slate-50/80 transition-colors relative cursor-pointer"
                      >
                        {slotBookings.map(b => (
                          <div
                            key={b.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openBookingDetail(b);
                            }}
                            className={`p-1.5 rounded text-[10px] font-semibold border mb-1 shadow-2xs ${getBookingColor(
                              b.status
                            )}`}
                          >
                            <p className="truncate font-bold">{b.title}</p>
                            <p className="text-[9px] opacity-80 truncate">{b.roomName}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Build Day View
  const renderDayView = () => {
    const currentISO = formatDateISO(currentDate);
    const dayBookings = filteredBookings
      .filter(b => b.date === currentISO)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Jadual Harian: {formatDateMalay(currentDate)}
            </h3>
            <p className="text-xs text-slate-500">
              {dayBookings.length} mesyuarat dijadualkan untuk hari ini
            </p>
          </div>
          <button
            onClick={() => openBookingWizard(undefined, currentISO)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
          >
            + Tempah Hari Ini
          </button>
        </div>

        {dayBookings.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Tiada mesyuarat berjadual pada tarikh ini. Bilik-bilik mesyuarat sedia untuk ditempah.
          </div>
        ) : (
          <div className="space-y-3">
            {dayBookings.map(b => (
              <div
                key={b.id}
                onClick={() => openBookingDetail(b)}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-24 shrink-0 font-mono text-xs font-bold text-slate-800">
                    <span className="block text-indigo-600">{formatTime12h(b.startTime)}</span>
                    <span className="text-slate-400">{formatTime12h(b.endTime)}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{b.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      <strong>{b.roomName}</strong> · Penganjur: {b.organizerName} ({b.department})
                    </p>
                    {b.purpose && (
                      <p className="text-xs text-slate-400 italic mt-1 line-clamp-1">
                        "{b.purpose}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded ${getBookingColor(b.status)}`}>
                    {b.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openBookingDetail(b);
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Butiran
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Build Agenda View
  const renderAgendaView = () => {
    const todayISO = formatDateISO(new Date());
    const upcoming = filteredBookings
      .filter(b => b.date >= todayISO && b.status !== 'Dibatalkan')
      .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Agenda Mesyuarat Mendatang ({upcoming.length})
        </h3>

        {upcoming.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Tiada mesyuarat akan datang dalam sistem.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcoming.map(b => (
              <div
                key={b.id}
                onClick={() => openBookingDetail(b)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {formatDateMalay(b.date)}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {formatTime12h(b.startTime)} – {formatTime12h(b.endTime)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{b.title}</h4>
                  <p className="text-xs text-slate-500">
                    {b.roomName} · {b.organizerName} ({b.department})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getBookingColor(b.status)}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Header Title
  const getHeaderTitle = () => {
    const month = MONTH_NAMES_MS[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    if (viewMode === 'day') {
      return formatDateMalay(currentDate);
    }
    return `${month} ${year}`;
  };

  return (
    <div className="space-y-5">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Kalendar Tempahan Bilik
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Paparan jadual visual mesyuarat interaktif untuk seluruh organisasi
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode segmented switch */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {(['month', 'week', 'day', 'agenda'] as CalendarViewMode[]).map(mode => {
              const labels = { month: 'Bulan', week: 'Minggu', day: 'Hari', agenda: 'Agenda' };
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 font-medium rounded-md capitalize transition-all ${
                    viewMode === mode
                      ? 'bg-white text-indigo-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labels[mode]}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => openBookingWizard()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tempah</span>
          </button>
        </div>
      </div>

      {/* Navigation & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Hari Ini
          </button>
          <div className="flex items-center">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-l-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              aria-label="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-r-lg border-y border-r border-slate-200 hover:bg-slate-50 text-slate-600 -ml-px"
              aria-label="Seterusnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-bold text-slate-900 ml-2">
            {getHeaderTitle()}
          </span>
        </div>

        {/* Room & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Bilik Mesyuarat</option>
            {rooms.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Status</option>
            <option value="Diluluskan">Diluluskan</option>
            <option value="Sedang Berlangsung">Sedang Berlangsung</option>
            <option value="Menunggu Kelulusan">Menunggu Kelulusan</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 px-1">
        <span className="font-semibold text-slate-700">Petunjuk Warna:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-indigo-600" /> Diluluskan
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-600" /> Sedang Berlangsung
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500" /> Menunggu Kelulusan
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-600" /> Selesai
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-400" /> Dibatalkan
        </span>
      </div>

      {/* Render Current View */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'agenda' && renderAgendaView()}
    </div>
  );
};
