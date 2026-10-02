import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Calendar,
  Clock,
  Building2,
  Users,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Printer,
  Edit3,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Layers,
  FileText
} from 'lucide-react';
import { formatFullDateMalay, formatTime12h } from '../utils/dateUtils';
import { CancelConfirmModal } from './CancelConfirmModal';
import { EditBookingModal } from './EditBookingModal';

export const BookingDetailModal: React.FC = () => {
  const {
    selectedBookingForDetail,
    closeBookingDetail,
    currentUser,
    rooms,
    approveBooking,
    rejectBooking,
  } = useApp();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRejectPromptOpen, setIsRejectPromptOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!selectedBookingForDetail) return null;

  const booking = selectedBookingForDetail;
  const room = rooms.find(r => r.id === booking.roomId);

  const canEditOrCancel =
    currentUser.role === 'Admin' ||
    currentUser.role === 'Pengurus' ||
    currentUser.id === booking.userId;

  const canApproveOrReject =
    (currentUser.role === 'Admin' || currentUser.role === 'Pengurus') &&
    booking.status === 'Menunggu Kelulusan';

  const statusStyles = {
    'Menunggu Kelulusan': 'bg-amber-50 text-amber-800 border-amber-200',
    'Diluluskan': 'bg-sky-50 text-sky-800 border-sky-200',
    'Sedang Berlangsung': 'bg-rose-50 text-rose-800 border-rose-200',
    'Selesai': 'bg-slate-100 text-slate-700 border-slate-200',
    'Dibatalkan': 'bg-rose-100 text-rose-700 border-rose-200',
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) return;
    rejectBooking(booking.id, rejectReason.trim());
    setIsRejectPromptOpen(false);
    setRejectReason('');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                #{booking.bookingRef}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${statusStyles[booking.status]}`}>
                {booking.status}
              </span>
            </div>
            <button
              onClick={closeBookingDetail}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Printable Ticket Area */}
          <div className="p-6 space-y-5 print:p-0">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                {booking.title}
              </h2>
              {booking.purpose && (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {booking.purpose}
                </p>
              )}
            </div>

            {/* Room details card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
              {room?.image && (
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-20 h-20 rounded-lg object-cover border border-slate-200 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  Bilik Mesyuarat
                </span>
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {booking.roomName}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {room?.location || 'Lokasi Pejabat'}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Kapasiti: {room?.capacity} orang
                  </span>
                  <span>·</span>
                  <span>{room?.floor}</span>
                </div>
              </div>
            </div>

            {/* Grid of Key Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  Tarikh Mesyuarat
                </span>
                <p className="text-slate-900 font-bold text-sm">
                  {formatFullDateMalay(booking.date)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Masa Mesyuarat
                </span>
                <p className="text-slate-900 font-bold text-sm">
                  {formatTime12h(booking.startTime)} – {formatTime12h(booking.endTime)}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-medium">Penganjur</span>
                <p className="text-slate-900 font-semibold">{booking.organizerName}</p>
                <p className="text-slate-500 text-[11px]">{booking.department}</p>
                {booking.organizerEmail && (
                  <p className="text-slate-400 text-[11px]">{booking.organizerEmail}</p>
                )}
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-medium">Peserta Dijangka</span>
                <p className="text-slate-900 font-semibold">{booking.attendeesCount} orang</p>
                {booking.approvedBy && (
                  <p className="text-emerald-700 text-[11px] mt-1 font-medium">
                    Diluluskan oleh: {booking.approvedBy}
                  </p>
                )}
              </div>
            </div>

            {/* Equipment list */}
            {booking.equipment && booking.equipment.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Keperluan Peralatan & Kemudahan:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {booking.equipment.map(item => (
                    <span
                      key={item}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Catatan Penganjur:
                </span>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic">
                  "{booking.notes}"
                </p>
              </div>
            )}

            {/* Cancellation reason if cancelled */}
            {booking.status === 'Dibatalkan' && (booking.cancellationReason || booking.rejectionReason) && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                <span className="font-bold block">Sebab Pembatalan / Penolakan:</span>
                <p className="mt-0.5">{booking.cancellationReason || booking.rejectionReason}</p>
              </div>
            )}

            {/* Reject prompt box */}
            {isRejectPromptOpen && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-rose-900">
                  Sebab Penolakan Permohonan:
                </label>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Bilik diperlukan untuk mesyuarat kecemasan lembaga pengarah."
                  className="w-full text-xs p-2 rounded border border-rose-300 bg-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsRejectPromptOpen(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleRejectSubmit}
                    disabled={!rejectReason.trim()}
                    className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
                  >
                    Sahkan Penolakan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 no-print">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                title="Cetak Slip Tempahan"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Slip</span>
              </button>

              {canApproveOrReject && (
                <>
                  <button
                    type="button"
                    onClick={() => approveBooking(booking.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Luluskan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRejectPromptOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {canEditOrCancel && booking.status !== 'Dibatalkan' && booking.status !== 'Selesai' && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Batal</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={closeBookingDetail}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub modals */}
      {isCancelModalOpen && (
        <CancelConfirmModal
          booking={booking}
          onClose={() => setIsCancelModalOpen(false)}
        />
      )}

      {isEditModalOpen && (
        <EditBookingModal
          booking={booking}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
};
