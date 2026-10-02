import React, { useState } from 'react';
import { Booking } from '../types';
import { useApp } from '../context/AppContext';
import { ALL_FACILITIES, DEPARTMENTS } from '../services/storage';
import { X, AlertCircle, Save } from 'lucide-react';
import { timeToMinutes, formatDateMalay } from '../utils/dateUtils';

interface EditBookingModalProps {
  booking: Booking;
  onClose: () => void;
}

export const EditBookingModal: React.FC<EditBookingModalProps> = ({ booking, onClose }) => {
  const { rooms, updateBooking, checkConflict, settings } = useApp();

  const [title, setTitle] = useState(booking.title);
  const [purpose, setPurpose] = useState(booking.purpose || '');
  const [roomId, setRoomId] = useState(booking.roomId);
  const [date, setDate] = useState(booking.date);
  const [startTime, setStartTime] = useState(booking.startTime);
  const [endTime, setEndTime] = useState(booking.endTime);
  const [attendeesCount, setAttendeesCount] = useState(booking.attendeesCount);
  const [equipment, setEquipment] = useState<string[]>(booking.equipment || []);
  const [notes, setNotes] = useState(booking.notes || '');
  const [errorMessage, setErrorMessage] = useState('');

  const selectedRoom = rooms.find(r => r.id === roomId);

  const toggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter(e => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Tajuk mesyuarat wajib diisi.');
      return;
    }

    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    if (endMin <= startMin) {
      setErrorMessage('Masa tamat mestilah selepas masa mula.');
      return;
    }

    // Operating hours check
    const opStartMin = timeToMinutes(settings.operatingStartTime);
    const opEndMin = timeToMinutes(settings.operatingEndTime);
    if (startMin < opStartMin || endMin > opEndMin) {
      setErrorMessage(`Masa mestilah dalam waktu operasi (${settings.operatingStartTime} – ${settings.operatingEndTime}).`);
      return;
    }

    // Capacity check
    if (selectedRoom && attendeesCount > selectedRoom.capacity) {
      setErrorMessage(`Peserta (${attendeesCount} orang) melebihi kapasiti bilik ${selectedRoom.name} (${selectedRoom.capacity} orang).`);
      return;
    }

    // Conflict Check (excluding current booking ID)
    const conflict = checkConflict(roomId, date, startTime, endTime, booking.id);
    if (conflict.hasConflict) {
      setErrorMessage(conflict.message || 'Terdapat pertindihan dengan tempahan lain pada masa tersebut.');
      return;
    }

    const res = updateBooking(booking.id, {
      title: title.trim(),
      purpose: purpose.trim(),
      roomId,
      roomName: selectedRoom ? selectedRoom.name : booking.roomName,
      date,
      startTime,
      endTime,
      attendeesCount,
      equipment,
      notes: notes.trim(),
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Gagal mengemaskini tempahan.');
    }
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Edit Tempahan #{booking.bookingRef}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Kemaskini maklumat dan jadual mesyuarat</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tajuk Mesyuarat</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bilik Mesyuarat</label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.capacity} org)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tarikh</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Masa Mula</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Masa Tamat</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bilangan Peserta</label>
              <input
                type="number"
                min="1"
                value={attendeesCount}
                onChange={(e) => setAttendeesCount(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tujuan</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Kemudahan & Peralatan</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_FACILITIES.map(item => (
                <label key={item} className="flex items-center gap-2 p-2 border rounded text-xs bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={equipment.includes(item)}
                    onChange={() => toggleEquipment(item)}
                    className="rounded text-indigo-600"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catatan</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
