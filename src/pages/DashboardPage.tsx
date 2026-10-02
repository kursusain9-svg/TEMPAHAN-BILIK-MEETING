import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Calendar,
  Clock,
  DoorOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  formatDateISO,
  formatDateMalay,
  formatTime12h,
  doTimesOverlap
} from '../utils/dateUtils';
import { BarChart, HorizontalBarChart, DonutChart } from '../components/Charts';
import { BookingStatus } from '../types';

export const DashboardPage: React.FC = () => {
  const {
    rooms,
    bookings,
    currentUser,
    openBookingWizard,
    openBookingDetail,
    setActiveTab,
    settings,
  } = useApp();

  const today = formatDateISO(new Date());

  // Current time representation
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  // 1. KPI Calculations
  const totalRooms = rooms.length;

  // Active bookings today
  const todayBookings = bookings.filter(b => b.date === today && b.status !== 'Dibatalkan');

  // Rooms currently in use right now or marked as 'Sedang Berlangsung'
  const currentlyUsedRooms = rooms.filter(room => {
    return bookings.some(b => {
      if (b.roomId !== room.id) return false;
      if (b.date !== today) return false;
      if (b.status === 'Dibatalkan') return false;
      if (b.status === 'Sedang Berlangsung') return true;
      // Check if current time falls within start & end
      return b.startTime <= currentTimeStr && currentTimeStr <= b.endTime;
    });
  });

  const availableRoomsCount = rooms.filter(r => r.status === 'Tersedia' && !currentlyUsedRooms.some(cur => cur.id === r.id)).length;

  const upcomingBookings = bookings.filter(b => {
    if (b.status === 'Dibatalkan' || b.status === 'Selesai') return false;
    if (b.date > today) return true;
    if (b.date === today && b.startTime > currentTimeStr) return true;
    return false;
  });

  const myBookings = bookings.filter(b => b.userId === currentUser.id);

  // Status badge style helper
  const getStatusBadge = (status: BookingStatus) => {
    const map = {
      'Diluluskan': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Sedang Berlangsung': 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
      'Menunggu Kelulusan': 'bg-amber-50 text-amber-700 border-amber-200',
      'Selesai': 'bg-slate-100 text-slate-700 border-slate-200',
      'Dibatalkan': 'bg-slate-50 text-slate-400 border-slate-200 line-through',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  };

  // Chart data: Bookings by day (Last 7 days)
  const dayNamesShort = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = formatDateISO(d);
    const count = bookings.filter(b => b.date === iso && b.status !== 'Dibatalkan').length;
    return {
      label: dayNamesShort[d.getDay()],
      subLabel: `${d.getDate()}/${d.getMonth() + 1}`,
      value: count,
      color: iso === today ? '#4f46e5' : '#818cf8',
    };
  });

  // Chart data: Room usage frequency
  const roomUsageData = rooms.map(room => {
    const count = bookings.filter(b => b.roomId === room.id && b.status !== 'Dibatalkan').length;
    return {
      label: room.name,
      value: count,
      color: room.color || '#0284c7',
      subText: `${room.capacity} org`,
    };
  }).sort((a, b) => b.value - a.value);

  // Chart data: Status breakdown
  const statusCounts = {
    Diluluskan: bookings.filter(b => b.status === 'Diluluskan').length,
    'Sedang Berlangsung': bookings.filter(b => b.status === 'Sedang Berlangsung').length,
    'Menunggu Kelulusan': bookings.filter(b => b.status === 'Menunggu Kelulusan').length,
    Selesai: bookings.filter(b => b.status === 'Selesai').length,
    Dibatalkan: bookings.filter(b => b.status === 'Dibatalkan').length,
  };

  const donutData = [
    { label: 'Diluluskan', value: statusCounts.Diluluskan, color: '#0284c7' },
    { label: 'Sedang Berlangsung', value: statusCounts['Sedang Berlangsung'], color: '#ef4444' },
    { label: 'Menunggu', value: statusCounts['Menunggu Kelulusan'], color: '#f59e0b' },
    { label: 'Selesai', value: statusCounts.Selesai, color: '#10b981' },
    { label: 'Dibatalkan', value: statusCounts.Dibatalkan, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Sistem Berpusat · {formatDateMalay(today)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {currentUser.name}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            {currentUser.role === 'Admin'
              ? 'Anda mempunyai akses penuh pentadbir untuk memantau semua bilik, tempahan, pengguna dan laporan organisasi.'
              : currentUser.role === 'Pengurus'
              ? 'Anda boleh menyemak permohonan tempahan, meluluskan penggunaan bilik, dan memantau ketersediaan masa-nyata.'
              : 'Semak jadual bilik yang tersedia dan buat tempahan mesyuarat pasukan anda dalam beberapa langkah mudah.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => openBookingWizard()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Tempahan Bilik</span>
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-semibold rounded-xl backdrop-blur transition-all border border-white/10"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Semak Ketersediaan Bilik</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 pointer-events-none flex items-center justify-center">
          <Building2 className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* KPI Cards (5 Primary Metrics specified in Prompt) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* 1. Jumlah Bilik */}
        <div
          onClick={() => setActiveTab('rooms')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600">Jumlah Bilik</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{totalRooms}</span>
            <span className="text-xs text-slate-400 font-medium">unit</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Semua blok & aras
          </p>
        </div>

        {/* 2. Bilik Sedang Digunakan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600">Sedang Digunakan</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-600">{currentlyUsedRooms.length}</span>
            <span className="text-xs text-slate-400 font-medium">bilik</span>
          </div>
          <p className="text-[11px] text-rose-700/80 mt-1 truncate">
            {currentlyUsedRooms.length > 0 ? 'Mesyuarat aktif' : 'Tiada mesyuarat aktif'}
          </p>
        </div>

        {/* 3. Tempahan Hari Ini */}
        <div
          onClick={() => setActiveTab('bookings')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600">Tempahan Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{todayBookings.length}</span>
            <span className="text-xs text-slate-400 font-medium">slot</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Jadual hari ini
          </p>
        </div>

        {/* 4. Tempahan Akan Datang */}
        <div
          onClick={() => setActiveTab('calendar')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600">Akan Datang</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{upcomingBookings.length}</span>
            <span className="text-xs text-slate-400 font-medium">tempahan</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Hari mendatang
          </p>
        </div>

        {/* 5. Bilik Tersedia */}
        <div
          onClick={() => setActiveTab('availability')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600">Bilik Tersedia</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600">{availableRoomsCount}</span>
            <span className="text-xs text-slate-400 font-medium">sedia</span>
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-1 truncate">
            Boleh ditempah sekarang
          </p>
        </div>
      </div>

      {/* Main Grid: Tempahan Hari Ini & Bilik Sedang Digunakan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tempahan Hari Ini (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Tempahan Hari Ini
              </h2>
              <p className="text-xs text-slate-500">
                {formatDateMalay(today)} · {todayBookings.length} mesyuarat berjadual
              </p>
            </div>
            <button
              onClick={() => setActiveTab('bookings')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline"
            >
              Lihat Semua &rarr;
            </button>
          </div>

          {todayBookings.length === 0 ? (
            <div className="py-10 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                Tiada tempahan mesyuarat untuk hari ini.
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Semua bilik mesyuarat bebas untuk ditempah.
              </p>
              <button
                onClick={() => openBookingWizard()}
                className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                + Buat Tempahan Sekarang
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {todayBookings.map(b => (
                <div
                  key={b.id}
                  onClick={() => openBookingDetail(b)}
                  className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-20 shrink-0 text-left">
                      <span className="text-xs font-bold text-slate-900 block">
                        {formatTime12h(b.startTime)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatTime12h(b.endTime)}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {b.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{b.roomName}</span>
                        <span>·</span>
                        <span>Penganjur: {b.organizerName}</span>
                        <span>·</span>
                        <span>{b.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getStatusBadge(b.status)}`}>
                      {b.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBookingDetail(b);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded hover:bg-indigo-50"
                    >
                      Butiran
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Bilik Sedang Digunakan & Bilik Tersedia (1 Col) */}
        <div className="space-y-6">
          {/* Active Now Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between mb-3">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                Bilik Sedang Digunakan
              </span>
              <span className="text-xs text-slate-400 font-normal">Masa Sekarang</span>
            </h3>

            {currentlyUsedRooms.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                Tiada bilik mesyuarat yang sedang digunakan pada waktu ini.
              </p>
            ) : (
              <div className="space-y-2.5">
                {currentlyUsedRooms.map(room => {
                  const activeBooking = bookings.find(
                    b => b.roomId === room.id && b.date === today && b.status !== 'Dibatalkan'
                  );
                  return (
                    <div
                      key={room.id}
                      onClick={() => activeBooking && openBookingDetail(activeBooking)}
                      className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 cursor-pointer hover:bg-rose-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{room.name}</h4>
                        <span className="text-[10px] font-semibold bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded">
                          Sedang Berlangsung
                        </span>
                      </div>
                      {activeBooking && (
                        <div className="mt-1 text-[11px] text-slate-600">
                          <p className="font-semibold text-rose-950 truncate">{activeBooking.title}</p>
                          <p className="text-slate-500">
                            {formatTime12h(activeBooking.startTime)} – {formatTime12h(activeBooking.endTime)} · {activeBooking.organizerName}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Available Rooms */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-emerald-600" />
                Bilik Sedia Ditempah
              </h3>
              <button
                onClick={() => setActiveTab('availability')}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                Semak &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {rooms.slice(0, 3).map(room => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{room.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {room.floor} · {room.capacity} org
                    </p>
                  </div>
                  <button
                    onClick={() => openBookingWizard(room)}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded text-xs font-bold transition-colors shrink-0"
                  >
                    Tempah
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section (Section 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend tempahan mengikut hari */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tempahan 7 Hari Terkini
              </h3>
              <p className="text-xs text-slate-500">Kekerapan tempahan mengikut hari</p>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <BarChart data={last7DaysData} height={190} valueSuffix="tempahan" />
        </div>

        {/* Penggunaan Bilik Paling Kerap */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Kadar Penggunaan Bilik
              </h3>
              <p className="text-xs text-slate-500">Jumlah penggunaan terkumpul</p>
            </div>
            <Layers className="w-4 h-4 text-sky-600" />
          </div>
          <div className="pt-2">
            <HorizontalBarChart data={roomUsageData.slice(0, 5)} valueSuffix="kali" />
          </div>
        </div>

        {/* Status Tempahan Donut */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pecahan Status Tempahan
              </h3>
              <p className="text-xs text-slate-500">Keseluruhan rekod sistem</p>
            </div>
          </div>
          <div className="py-2">
            <DonutChart data={donutData} size={170} innerRadius={50} />
          </div>
        </div>
      </div>
    </div>
  );
};
