import React, { useState } from 'react';
import { Booking } from '../types';
import { useApp } from '../context/AppContext';
import { AlertTriangle, X } from 'lucide-react';

interface CancelConfirmModalProps {
  booking: Booking;
  onClose: () => void;
}

export const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({ booking, onClose }) => {
  const { cancelBooking } = useApp();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Sila nyatakan sebab pembatalan tempahan.');
      return;
    }
    cancelBooking(booking.id, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900">
                Batal Tempahan Mesyuarat?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Adakah anda pasti mahu membatalkan tempahan{' '}
                <strong className="text-slate-800 font-semibold">#{booking.bookingRef} ({booking.title})</strong>?
                Tindakan ini akan membebaskan bilik untuk pengguna lain.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sebab Pembatalan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
              placeholder="Contoh: Mesyuarat dipinda ke tarikh lain atas arahan Pengurusan Tertinggi."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              required
            />
            {error && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{error}</p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
            >
              Teruskan Pembatalan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
