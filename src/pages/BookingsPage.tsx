import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Download,
  Building2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import {
  formatDateMalay,
  formatTime12h,
  formatDateISO
} from '../utils/dateUtils';
import { Booking, BookingStatus } from '../types';
import { DEPARTMENTS } from '../services/storage';
import { CancelConfirmModal } from '../components/CancelConfirmModal';
import { EditBookingModal } from '../components/EditBookingModal';

export const BookingsPage: React.FC = () => {
  const {
    bookings,
    rooms,
    currentUser,
    openBookingWizard,
    openBookingDetail,
    approveBooking,
    showToast,
  } = useApp();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          b.title.toLowerCase().includes(q) ||
          b.bookingRef.toLowerCase().includes(q) ||
          b.organizerName.toLowerCase().includes(q) ||
          b.roomName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Room
      if (selectedRoomId !== 'all' && b.roomId !== selectedRoomId) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && b.status !== selectedStatus) {
        return false;
      }

      // Department
      if (selectedDepartment !== 'all' && b.department !== selectedDepartment) {
        return false;
      }

      // Date
      if (dateFilter && b.date !== dateFilter) {
        return false;
      }

      return true;
    });
  }, [bookings, search, selectedRoomId, selectedStatus, selectedDepartment, dateFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage]);

  const resetFilters = () => {
    setSearch('');
    setSelectedRoomId('all');
    setSelectedStatus('all');
    setSelectedDepartment('all');
    setDateFilter('');
    setCurrentPage(1);
  };

  const getStatusBadge = (status: BookingStatus) => {
    const map = {
      'Diluluskan': 'bg-sky-50 text-sky-800 border-sky-200',
      'Sedang Berlangsung': 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse',
      'Menunggu Kelulusan': 'bg-amber-50 text-amber-800 border-amber-200',
      'Selesai': 'bg-emerald-50 text-emerald-800 border-emerald-200',
      'Dibatalkan': 'bg-slate-100 text-slate-500 border-slate-200 line-through',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['No Rujukan', 'Tajuk Mesyuarat', 'Bilik', 'Tarikh', 'Masa Mula', 'Masa Tamat', 'Penganjur', 'Jabatan', 'Peserta', 'Status'];
    const rows = filteredBookings.map(b => [
      b.bookingRef,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.roomName}"`,
      b.date,
      b.startTime,
      b.endTime,
      `"${b.organizerName}"`,
      `"${b.department}"`,
      b.attendeesCount,
      b.status
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `senarai_tempahan_${formatDateISO(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Eksport Berjaya', 'Fail CSV senarai tempahan telah dimuat turun.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pengurusan Tempahan Bilik
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Senarai keseluruhan tempahan mesyuarat dalam organisasi ({filteredBookings.length} rekod dijumpai)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            title="Eksport ke format Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Eksport CSV</span>
          </button>

          <button
            onClick={() => openBookingWizard()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Tempahan</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari tajuk, no rujukan, penganjur..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Filter Bilik */}
          <div>
            <select
              value={selectedRoomId}
              onChange={(e) => {
                setSelectedRoomId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="all">Semua Bilik Mesyuarat</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="Menunggu Kelulusan">Menunggu Kelulusan</option>
              <option value="Diluluskan">Diluluskan</option>
              <option value="Sedang Berlangsung">Sedang Berlangsung</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          {/* Filter Tarikh */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Active filter badges & reset */}
        {(search || selectedRoomId !== 'all' || selectedStatus !== 'all' || selectedDepartment !== 'all' || dateFilter) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Tapisan aktif digunakan. Menunjukkan {filteredBookings.length} hasil.
            </span>
            <button
              onClick={resetFilters}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Set Semula Tapisan
            </button>
          </div>
        )}
      </div>

      {/* Bookings Table (Desktop) & Card List (Mobile) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {paginatedBookings.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Tiada tempahan ditemui</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tiada rekod tempahan yang sepadan dengan kriteria carian anda. Sila ubah tapisan atau buat tempahan baru.
            </p>
            <button
              onClick={() => openBookingWizard()}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              + Buat Tempahan Baru
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Tarikh & Masa</th>
                    <th className="py-3 px-4">Mesyuarat</th>
                    <th className="py-3 px-4">Bilik</th>
                    <th className="py-3 px-4">Penganjur</th>
                    <th className="py-3 px-4">Peserta</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedBookings.map(b => (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => openBookingDetail(b)}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block text-xs">
                          {formatDateMalay(b.date)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatTime12h(b.startTime)} – {formatTime12h(b.endTime)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-medium text-slate-400">
                            #{b.bookingRef}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 block text-xs truncate max-w-xs">
                          {b.title}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{b.roomName}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-900 block">{b.organizerName}</span>
                        <span className="text-[11px] text-slate-400">{b.department}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">{b.attendeesCount} org</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${getStatusBadge(b.status)}`}>
                          {b.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openBookingDetail(b)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Lihat Butiran"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {(currentUser.role === 'Admin' || currentUser.role === 'Pengurus' || currentUser.id === b.userId) &&
                            b.status !== 'Dibatalkan' &&
                            b.status !== 'Selesai' && (
                              <>
                                <button
                                  onClick={() => setEditingBooking(b)}
                                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                                  title="Edit Tempahan"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setCancellingBooking(b)}
                                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                  title="Batal Tempahan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                          {(currentUser.role === 'Admin' || currentUser.role === 'Pengurus') && b.status === 'Menunggu Kelulusan' && (
                            <button
                              onClick={() => approveBooking(b.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-xs transition-colors"
                              title="Luluskan Tempahan Ini"
                            >
                              Lulus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedBookings.map(b => (
                <div
                  key={b.id}
                  onClick={() => openBookingDetail(b)}
                  className="p-4 space-y-2.5 active:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">#{b.bookingRef}</span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{b.title}</h4>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${getStatusBadge(b.status)}`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <strong className="text-slate-700">{b.roomName}</strong>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDateMalay(b.date)} ({formatTime12h(b.startTime)} - {formatTime12h(b.endTime)})
                    </p>
                    <p>
                      Penganjur: {b.organizerName} · {b.department}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openBookingDetail(b)}
                      className="px-2.5 py-1 text-xs text-indigo-600 font-semibold"
                    >
                      Lihat
                    </button>
                    {(currentUser.role === 'Admin' || currentUser.role === 'Pengurus' || currentUser.id === b.userId) &&
                      b.status !== 'Dibatalkan' &&
                      b.status !== 'Selesai' && (
                        <button
                          onClick={() => setCancellingBooking(b)}
                          className="px-2.5 py-1 text-xs text-rose-600 font-semibold"
                        >
                          Batal
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div>
                Halaman <strong className="text-slate-800">{currentPage}</strong> daripada{' '}
                <strong className="text-slate-800">{totalPages}</strong> (Jumlah: {filteredBookings.length})
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sub modals */}
      {cancellingBooking && (
        <CancelConfirmModal
          booking={cancellingBooking}
          onClose={() => setCancellingBooking(null)}
        />
      )}

      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
        />
      )}
    </div>
  );
};
