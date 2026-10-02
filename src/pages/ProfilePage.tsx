import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  Shield,
  Key,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  Check
} from 'lucide-react';
import { DEPARTMENTS } from '../services/storage';
import { formatDateMalay, formatTime12h } from '../utils/dateUtils';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateUser, bookings, openBookingDetail, showToast } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [department, setDepartment] = useState(currentUser.department);
  const [position, setPosition] = useState(currentUser.position);
  const [phone, setPhone] = useState(currentUser.phone);
  const [avatar, setAvatar] = useState(currentUser.avatar);

  // Password change simulation
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // User's own bookings
  const userBookings = bookings.filter(b => b.userId === currentUser.id);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, {
      name,
      email,
      department,
      position,
      phone,
      avatar,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMsg('Sila isi semua ruangan kata laluan.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Kata laluan baharu dan pengesahan tidak sepadan.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg('Kata laluan baharu mestilah sekurang-kurangnya 6 aksara.');
      return;
    }

    setIsPasswordModalOpen(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMsg('');
    showToast('Kata Laluan Dikemaskini', 'Kata laluan akaun anda telah berjaya ditukar.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-600" />
          Profil Pengguna
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Urus maklumat peribadi, nombor perhubungan dan keselamatan akaun anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <img
              src={avatar}
              alt={currentUser.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-indigo-600 p-0.5 shadow-md"
            />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">{currentUser.name}</h2>
            <p className="text-xs text-slate-500">{currentUser.position}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Peranan: {currentUser.role}
            </span>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 text-left text-xs space-y-2.5 text-slate-600">
            <p className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{currentUser.department}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{currentUser.email}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{currentUser.phone}</span>
            </p>
          </div>

          <div className="w-full pt-2">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Tukar Kata Laluan</span>
            </button>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
            Kemaskini Maklumat Profil
          </h3>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Penuh
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Emel
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jabatan / Bahagian
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jawatan Semasa
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. Telefon
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Gambar Profil
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* User's Own Bookings History */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Sejarah Tempahan Saya ({userBookings.length})
            </h3>
            <p className="text-xs text-slate-500">
              Semua tempahan bilik mesyuarat yang didaftarkan menggunakan akaun ini
            </p>
          </div>
        </div>

        {userBookings.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Anda belum membuat sebarang tempahan bilik mesyuarat.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {userBookings.map(b => (
              <div
                key={b.id}
                onClick={() => openBookingDetail(b)}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">#{b.bookingRef}</span>
                    <h4 className="text-xs font-bold text-slate-900">{b.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {b.roomName} · {formatDateMalay(b.date)} ({formatTime12h(b.startTime)} - {formatTime12h(b.endTime)})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded border bg-slate-50 text-slate-700">
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Tukar Kata Laluan</h3>
            {passwordMsg && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {passwordMsg}
              </p>
            )}
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Laluan Semasa
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Laluan Baharu
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sahkan Kata Laluan Baharu
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Simpan Kata Laluan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
