import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  Tv,
  Projector,
  Video,
  Mic,
  Volume2,
  Monitor,
  FileSpreadsheet,
  Check,
  AlertCircle
} from 'lucide-react';
import { ALL_FACILITIES, DEPARTMENTS } from '../services/storage';
import {
  formatDateMalay,
  formatTime12h,
  timeToMinutes
} from '../utils/dateUtils';
import { Room } from '../types';

export const BookingWizardModal: React.FC = () => {
  const {
    isBookingWizardOpen,
    closeBookingWizard,
    rooms,
    bookings,
    currentUser,
    addBooking,
    checkConflict,
    settings,
    openBookingDetail,
    wizardPreselectedRoom,
    wizardPreselectedDate,
    wizardPreselectedStartTime,
    wizardPreselectedEndTime,
  } = useApp();

  const [step, setStep] = useState<number>(1);

  // Form states
  const [date, setDate] = useState<string>(wizardPreselectedDate);
  const [startTime, setStartTime] = useState<string>(wizardPreselectedStartTime);
  const [endTime, setEndTime] = useState<string>(wizardPreselectedEndTime);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [organizerName, setOrganizerName] = useState<string>(currentUser.name);
  const [organizerEmail, setOrganizerEmail] = useState<string>(currentUser.email);
  const [department, setDepartment] = useState<string>(currentUser.department);
  const [attendeesCount, setAttendeesCount] = useState<number>(8);
  const [equipment, setEquipment] = useState<string[]>(['Projektor', 'Whiteboard']);
  const [notes, setNotes] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string>('');

  // Sync initial preselection
  useEffect(() => {
    if (isBookingWizardOpen) {
      setStep(1);
      setErrorMessage('');
      setDate(wizardPreselectedDate || new Date().toISOString().substring(0, 10));
      setStartTime(wizardPreselectedStartTime || '10:00');
      setEndTime(wizardPreselectedEndTime || '11:30');
      setSelectedRoomId(wizardPreselectedRoom ? wizardPreselectedRoom.id : '');
      setOrganizerName(currentUser.name);
      setOrganizerEmail(currentUser.email);
      setDepartment(currentUser.department);
    }
  }, [isBookingWizardOpen, wizardPreselectedRoom, wizardPreselectedDate, wizardPreselectedStartTime, wizardPreselectedEndTime, currentUser]);

  if (!isBookingWizardOpen) return null;

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  // Handle equipment toggle
  const toggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter(e => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    setErrorMessage('');
    if (!date) {
      setErrorMessage('Sila pilih tarikh tempahan.');
      return false;
    }
    if (!startTime || !endTime) {
      setErrorMessage('Sila pilih masa mula dan masa tamat.');
      return false;
    }
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    if (endMin <= startMin) {
      setErrorMessage('Masa tamat mestilah selepas masa mula tempahan.');
      return false;
    }

    const opStartMin = timeToMinutes(settings.operatingStartTime);
    const opEndMin = timeToMinutes(settings.operatingEndTime);
    if (startMin < opStartMin || endMin > opEndMin) {
      setErrorMessage(
        `Waktu tempahan mesti dalam waktu operasi pejabat (${settings.operatingStartTime} – ${settings.operatingEndTime}).`
      );
      return false;
    }

    // Check operating day
    const bookingDate = new Date(date + 'T00:00:00');
    const dayNames = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
    const dayName = dayNames[bookingDate.getDay()];
    if (!settings.operatingDays.includes(dayName)) {
      setErrorMessage(
        `Organisasi tidak beroperasi pada hari ${dayName}. Hari operasi: ${settings.operatingDays.join(', ')}.`
      );
      return false;
    }

    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    setErrorMessage('');
    if (!selectedRoomId) {
      setErrorMessage('Sila pilih bilik mesyuarat.');
      return false;
    }
    const conflict = checkConflict(selectedRoomId, date, startTime, endTime);
    if (conflict.hasConflict) {
      setErrorMessage(conflict.message || 'Bilik ini telah ditempah pada masa yang dipilih.');
      return false;
    }
    return true;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    setErrorMessage('');
    if (!title.trim()) {
      setErrorMessage('Tajuk mesyuarat wajib diisi.');
      return false;
    }
    if (!organizerName.trim()) {
      setErrorMessage('Nama penganjur wajib diisi.');
      return false;
    }
    if (!department) {
      setErrorMessage('Sila pilih jabatan/unit penganjur.');
      return false;
    }
    if (!attendeesCount || attendeesCount <= 0) {
      setErrorMessage('Sila masukkan bilangan peserta yang sah.');
      return false;
    }
    if (selectedRoom && attendeesCount > selectedRoom.capacity) {
      setErrorMessage(
        `Bilangan peserta (${attendeesCount} orang) melebihi kapasiti maksimum bilik ${selectedRoom.name} (${selectedRoom.capacity} orang).`
      );
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    } else if (step === 3) {
      if (validateStep3()) setStep(4);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedRoom) return;

    // Final conflict check
    const conflict = checkConflict(selectedRoomId, date, startTime, endTime);
    if (conflict.hasConflict) {
      setErrorMessage(conflict.message || 'Pertindihan dikesan pada saat akhir.');
      setStep(2);
      return;
    }

    const result = addBooking({
      title: title.trim(),
      purpose: purpose.trim() || 'Mesyuarat Berkala Organisasi',
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      userId: currentUser.id,
      organizerName: organizerName.trim(),
      organizerEmail: organizerEmail.trim(),
      department,
      attendeesCount,
      date,
      startTime,
      endTime,
      equipment,
      notes: notes.trim(),
    });

    if (result.success && result.booking) {
      closeBookingWizard();
      openBookingDetail(result.booking);
    } else {
      setErrorMessage(result.error || 'Gagal menyimpan tempahan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Wizard Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight">Buat Tempahan Bilik Mesyuarat</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Langkah {step} daripada 4: {
                step === 1 ? 'Pilih Tarikh & Masa' :
                step === 2 ? 'Pilih Bilik Mesyuarat' :
                step === 3 ? 'Maklumat Mesyuarat' : 'Semak & Sahkan'
              }
            </p>
          </div>
          <button
            onClick={closeBookingWizard}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-4 bg-slate-100 h-1.5">
          <div className={`h-full bg-indigo-600 transition-all ${step >= 1 ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`h-full bg-indigo-600 transition-all ${step >= 2 ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`h-full bg-indigo-600 transition-all ${step >= 3 ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`h-full bg-indigo-600 transition-all ${step >= 4 ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Wizard Body */}
        <div className="p-6">
          {/* STEP 1: Date & Time */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Waktu Operasi Organisasi:
                </div>
                <p>
                  Hari: <strong className="text-slate-700">{settings.operatingDays.join(', ')}</strong>
                </p>
                <p>
                  Masa: <strong className="text-slate-700">{settings.operatingStartTime} – {settings.operatingEndTime}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tarikh Mesyuarat <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().substring(0, 10)}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                {date && (
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    {formatDateMalay(date)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Masa Mula <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {formatTime12h(startTime)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Masa Tamat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {formatTime12h(endTime)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Choose Room with Real-Time Conflict / Availability Checking */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  Slot Dipilih: <span className="font-semibold text-slate-900">{formatDateMalay(date)}</span> ({formatTime12h(startTime)} – {formatTime12h(endTime)})
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Ubah Masa
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {rooms.map(room => {
                  const conflict = checkConflict(room.id, date, startTime, endTime);
                  const isAvailable = !conflict.hasConflict && room.status === 'Tersedia';
                  const isSelected = selectedRoomId === room.id;

                  return (
                    <div
                      key={room.id}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedRoomId(room.id);
                          setErrorMessage('');
                        }
                      }}
                      className={`p-3.5 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                        !isAvailable
                          ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                          : isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                      }`}
                    >
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {room.name}
                          </h4>
                          <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {room.code}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            Kapasiti: <strong className="text-slate-700">{room.capacity} orang</strong>
                          </span>
                          <span>·</span>
                          <span>{room.floor}</span>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-1.5 font-medium">
                            {isAvailable ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                🟢 Tersedia untuk ditempah
                              </span>
                            ) : (
                              <span className="text-rose-700 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                🔴 {conflict.message || 'Telah Ditempah / Penyelenggaraan'}
                              </span>
                            )}
                          </div>

                          {isSelected && isAvailable && (
                            <span className="text-indigo-600 font-bold flex items-center gap-1 text-[11px]">
                              <Check className="w-3.5 h-3.5" /> Dipilih
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Meeting Information */}
          {step === 3 && (
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tajuk Mesyuarat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Mesyuarat Penyelarasan Projek ICT Fasa 2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Penganjur <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan / Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bilangan Peserta <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRoom?.capacity || 100}
                    value={attendeesCount}
                    onChange={(e) => setAttendeesCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Kapasiti maksimum bilik: {selectedRoom?.capacity} orang
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Emel Penganjur
                  </label>
                  <input
                    type="email"
                    value={organizerEmail}
                    onChange={(e) => setOrganizerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tujuan Mesyuarat
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Semakan pencapaian KPI bulanan & hal-hal berbangkit"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Equipment Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Keperluan Peralatan & Kemudahan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ALL_FACILITIES.map(item => {
                    const isChecked = equipment.includes(item);
                    return (
                      <label
                        key={item}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleEquipment(item)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Tambahan (Pilihan)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Sediakan sambungan telesidang dan air mineral untuk tetamu."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Summary & Confirmation */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                    Ringkasan Tempahan
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{title}</h3>
                  {purpose && <p className="text-xs text-slate-600 mt-0.5">{purpose}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Bilik Mesyuarat</span>
                    <strong className="text-slate-800 font-semibold">{selectedRoom?.name}</strong>
                    <span className="text-slate-500 block text-[11px]">{selectedRoom?.location}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Tarikh & Masa</span>
                    <strong className="text-slate-800 font-semibold">{formatDateMalay(date)}</strong>
                    <span className="text-slate-500 block text-[11px]">
                      {formatTime12h(startTime)} – {formatTime12h(endTime)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Penganjur</span>
                    <strong className="text-slate-800 font-semibold">{organizerName}</strong>
                    <span className="text-slate-500 block text-[11px]">{department}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Jumlah Peserta</span>
                    <strong className="text-slate-800 font-semibold">{attendeesCount} orang</strong>
                    <span className="text-slate-500 block text-[11px]">
                      (Kapasiti bilik: {selectedRoom?.capacity} orang)
                    </span>
                  </div>
                </div>

                {equipment.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[11px] mb-1">Peralatan Dipohon:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {equipment.map(item => (
                        <span
                          key={item}
                          className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {notes && (
                  <div className="pt-2 border-t border-slate-200 text-xs">
                    <span className="text-slate-400 block text-[11px]">Catatan:</span>
                    <p className="text-slate-700 italic mt-0.5">{notes}</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Status Permohonan:</span>
                  <span className="text-[11px] text-indigo-700">
                    {settings.approvalMode === 'auto' || currentUser.role === 'Admin'
                      ? 'Tempahan ini akan terus DILULUSKAN secara automatik.'
                      : 'Tempahan ini memerlukan kelulusan pihak pengurusan pentadbiran.'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                setStep(step - 1);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={closeBookingWizard}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Batal
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <span>Seterusnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmBooking}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sahkan Tempahan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
