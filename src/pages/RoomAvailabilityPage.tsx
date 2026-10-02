import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  DoorOpen,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Building2,
  Tv,
  ArrowRight,
  Filter
} from 'lucide-react';
import {
  formatDateISO,
  formatDateMalay,
  formatTime12h,
  doTimesOverlap
} from '../utils/dateUtils';
import { Room } from '../types';

export const RoomAvailabilityPage: React.FC = () => {
  const { rooms, bookings, openBookingWizard, settings } = useApp();

  const [date, setDate] = useState<string>(formatDateISO(new Date()));
  const [startTime, setStartTime] = useState<string>('10:00');
  const [endTime, setEndTime] = useState<string>('12:00');
  const [attendeesCount, setAttendeesCount] = useState<number>(10);
  const [selectedFloor, setSelectedFloor] = useState<string>('all');

  // Floors list
  const floors = ['all', ...Array.from(new Set(rooms.map(r => r.floor)))];

  // Evaluate rooms
  const evaluatedRooms = rooms.map(room => {
    // Check floor filter
    if (selectedFloor !== 'all' && room.floor !== selectedFloor) {
      return null;
    }

    // Capacity matching
    const isCapacitySufficient = room.capacity >= attendeesCount;

    // Active maintenance check
    const isMaintenance = room.status === 'Penyelenggaraan';
    const isInactive = room.status === 'Tidak Aktif';

    // Conflict check
    const conflictingBooking = bookings.find(b => {
      if (b.roomId !== room.id) return false;
      if (b.date !== date) return false;
      if (b.status === 'Dibatalkan') return false;
      return doTimesOverlap(startTime, endTime, b.startTime, b.endTime);
    });

    const isAvailable = !conflictingBooking && room.status === 'Tersedia' && isCapacitySufficient;

    return {
      room,
      isAvailable,
      isCapacitySufficient,
      isMaintenance,
      isInactive,
      conflictingBooking,
    };
  }).filter(Boolean) as {
    room: Room;
    isAvailable: boolean;
    isCapacitySufficient: boolean;
    isMaintenance: boolean;
    isInactive: boolean;
    conflictingBooking?: typeof bookings[0];
  }[];

  const availableCount = evaluatedRooms.filter(e => e.isAvailable).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <DoorOpen className="w-6 h-6 text-indigo-600" />
          Semakan Ketersediaan Bilik Mesyuarat
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Pilih tarikh, waktu, dan anggaran peserta untuk melihat senarai bilik yang sedia ditempah secara masa-nyata.
        </p>
      </div>

      {/* Query Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Tarikh */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tarikh Mesyuarat
            </label>
            <input
              type="date"
              value={date}
              min={formatDateISO(new Date())}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Masa Mula */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Masa Mula
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Masa Tamat */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Masa Tamat
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Bilangan Peserta */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bil. Peserta (Orang)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={attendeesCount}
              onChange={(e) => setAttendeesCount(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Aras / Tingkat */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tingkat / Aras
            </label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Aras</option>
              {floors.filter(f => f !== 'all').map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Query Summary Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div>
            Slot carian: <strong className="text-slate-900">{formatDateMalay(date)}</strong> (
            {formatTime12h(startTime)} – {formatTime12h(endTime)}) untuk{' '}
            <strong className="text-slate-900">{attendeesCount} orang peserta</strong>.
          </div>
          <div className="font-semibold">
            {availableCount > 0 ? (
              <span className="text-emerald-700 font-bold">
                ✓ {availableCount} daripada {evaluatedRooms.length} bilik sedia ditempah
              </span>
            ) : (
              <span className="text-rose-600 font-bold">
                ✕ Tiada bilik yang tersedia untuk kriteria ini
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Rooms Availability Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {evaluatedRooms.map(({ room, isAvailable, isCapacitySufficient, isMaintenance, isInactive, conflictingBooking }) => {
          return (
            <div
              key={room.id}
              className={`bg-white rounded-xl border overflow-hidden flex flex-col transition-all shadow-xs ${
                isAvailable
                  ? 'border-emerald-300 ring-1 ring-emerald-500/20 hover:shadow-md'
                  : 'border-slate-200 opacity-80'
              }`}
            >
              {/* Image & Status Badge */}
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5">
                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      🟢 Tersedia
                    </span>
                  ) : isMaintenance ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-600 text-white shadow-md">
                      Penyelenggaraan
                    </span>
                  ) : isInactive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-600 text-white shadow-md">
                      Tidak Aktif
                    </span>
                  ) : !isCapacitySufficient ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-600 text-white shadow-md">
                      Kapasiti Kecil ({room.capacity} org)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-600 text-white shadow-md">
                      🔴 Telah Ditempah
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2 left-2.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900/80 text-white backdrop-blur">
                    {room.code}
                  </span>
                </div>
              </div>

              {/* Room Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{room.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{room.location}</p>

                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-2 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Maksimum: <strong>{room.capacity} orang</strong>
                    </span>
                    <span>·</span>
                    <span>{room.floor}</span>
                  </div>

                  {/* Facilities */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {room.facilities.slice(0, 4).map(fac => (
                      <span
                        key={fac}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium"
                      >
                        {fac}
                      </span>
                    ))}
                    {room.facilities.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-400 font-medium">
                        +{room.facilities.length - 4} lagi
                      </span>
                    )}
                  </div>

                  {/* Conflict Notice if booked */}
                  {conflictingBooking && (
                    <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                      <p className="font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Ditempah oleh: {conflictingBooking.organizerName}
                      </p>
                      <p className="text-[11px] text-rose-600 mt-0.5">
                        {conflictingBooking.title} ({formatTime12h(conflictingBooking.startTime)} - {formatTime12h(conflictingBooking.endTime)})
                      </p>
                    </div>
                  )}

                  {!isCapacitySufficient && (
                    <div className="mt-3 p-2 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800">
                      Bilik ini hanya menampung {room.capacity} orang. (Anda perlukan {attendeesCount} orang).
                    </div>
                  )}
                </div>

                {/* Booking Button */}
                <div className="pt-2 border-t border-slate-100">
                  {isAvailable ? (
                    <button
                      onClick={() => openBookingWizard(room, date, startTime, endTime)}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Tempah Bilik Ini Sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 px-3 bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold cursor-not-allowed"
                    >
                      Tidak Tersedia
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
