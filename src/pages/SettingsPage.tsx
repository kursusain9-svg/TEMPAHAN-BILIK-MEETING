import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Building2,
  Clock,
  Calendar,
  ShieldCheck,
  Bell,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { OrganizationSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetAllDataToDemo, currentUser } = useApp();

  const [form, setForm] = useState<OrganizationSettings>(settings);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const daysOfWeek = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'];

  const toggleDay = (day: string) => {
    if (form.operatingDays.includes(day)) {
      if (form.operatingDays.length === 1) return; // keep at least 1 day
      setForm({ ...form, operatingDays: form.operatingDays.filter(d => d !== day) });
    } else {
      setForm({ ...form, operatingDays: [...form.operatingDays, day] });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  const isAdmin = currentUser.role === 'Admin';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          Tetapan Sistem & Polisi Organisasi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Konfigurasikan maklumat organisasi, jadual waktu operasi, peraturan tempahan dan mod kelulusan
        </p>
      </div>

      {!isAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Akses Paparan Sahaja (Bukan Admin)</p>
            <p className="mt-0.5">
              Hanya pengguna dengan peranan <strong>Admin</strong> dibenarkan untuk mengubah tetapan sistem. Anda boleh beralih ke akaun Admin menggunakan menu atas kanan.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Maklumat Organisasi */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Maklumat Organisasi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Organisasi / Kompleks Pejabat
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={form.orgName}
                onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Slogan / Keterangan Ringkas
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Waktu & Hari Operasi */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-indigo-600" />
            Waktu & Hari Operasi Pejabat
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Hari Operasi yang Dibenarkan untuk Tempahan
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map(day => {
                const isActive = form.operatingDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    disabled={!isAdmin}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Tempahan pada hari di luar senarai ini akan disekat oleh sistem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Waktu Mula Operasi
              </label>
              <input
                type="time"
                disabled={!isAdmin}
                value={form.operatingStartTime}
                onChange={(e) => setForm({ ...form, operatingStartTime: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Waktu Tamat Operasi
              </label>
              <input
                type="time"
                disabled={!isAdmin}
                value={form.operatingEndTime}
                onChange={(e) => setForm({ ...form, operatingEndTime: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Mod Kelulusan & Peraturan */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Polisi Tempahan & Mod Kelulusan
          </h2>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Mod Kelulusan Tempahan (Approval Workflow)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  form.approvalMode === 'auto'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="approvalMode"
                  value="auto"
                  disabled={!isAdmin}
                  checked={form.approvalMode === 'auto'}
                  onChange={() => setForm({ ...form, approvalMode: 'auto' })}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">Mod Auto Approval</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Tempahan bilik terus diluluskan secara automatik sekiranya tiada sebarang pertindihan masa.
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  form.approvalMode === 'manual'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="approvalMode"
                  value="manual"
                  disabled={!isAdmin}
                  checked={form.approvalMode === 'manual'}
                  onChange={() => setForm({ ...form, approvalMode: 'manual' })}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">Mod Approval (Perlu Kelulusan)</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Tempahan dari kakitangan biasa berstatus "Menunggu Kelulusan" sehingga diluluskan oleh Pengurus/Admin.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tempoh Minimum Tempahan (Minit)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                disabled={!isAdmin}
                value={form.minDurationMinutes}
                onChange={(e) => setForm({ ...form, minDurationMinutes: parseInt(e.target.value, 10) || 30 })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tempoh Maksimum Tempahan (Minit)
              </label>
              <input
                type="number"
                min="60"
                step="30"
                disabled={!isAdmin}
                value={form.maxDurationMinutes}
                onChange={(e) => setForm({ ...form, maxDurationMinutes: parseInt(e.target.value, 10) || 480 })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {Math.floor(form.maxDurationMinutes / 60)} jam tempahan berterusan.
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isAdmin && (
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Semua Tetapan</span>
            </button>
          </div>
        )}
      </form>

      {/* Danger Zone: Reset Data Demo */}
      <div className="bg-rose-50/60 p-6 rounded-xl border border-rose-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-rose-600" />
          Zon Penyelenggaraan: Set Semula Data Demo
        </h3>
        <p className="text-xs text-rose-700/80 leading-relaxed">
          Gunakan butang ini jika anda ingin mengembalikan pangkalan data tempahan, bilik, pengguna, dan log aktiviti kepada keadaan awal demo asal.
        </p>

        {!isResetConfirmOpen ? (
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            Set Semula ke Data Asal Demo
          </button>
        ) : (
          <div className="p-4 bg-white rounded-lg border border-rose-300 space-y-3">
            <p className="text-xs font-bold text-rose-900">
              Adakah anda benar-benar pasti? Semua tempahan dan pengubahsuaian baharu akan dipadamkan.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={resetAllDataToDemo}
                className="px-4 py-1.5 bg-rose-700 text-white text-xs font-bold rounded-lg hover:bg-rose-800"
              >
                Ya, Muat Semula Data Demo Sekarang
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
