import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Calendar,
  Clock,
  Building2,
  Users,
  Download,
  Printer,
  Filter,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import {
  formatDateISO,
  formatDateMalay,
  timeToMinutes,
  getDateOffsetISO
} from '../utils/dateUtils';
import { BarChart, HorizontalBarChart, DonutChart } from '../components/Charts';
import { DEPARTMENTS } from '../services/storage';

export const ReportsPage: React.FC = () => {
  const { bookings, rooms, settings, showToast } = useApp();

  // Filters
  const [startDate, setStartDate] = useState(getDateOffsetISO(-30));
  const [endDate, setEndDate] = useState(getDateOffsetISO(30));
  const [selectedRoomId, setSelectedRoomId] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filtered Bookings
  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (startDate && b.date < startDate) return false;
      if (endDate && b.date > endDate) return false;
      if (selectedRoomId !== 'all' && b.roomId !== selectedRoomId) return false;
      if (selectedDepartment !== 'all' && b.department !== selectedDepartment) return false;
      if (selectedStatus !== 'all' && b.status !== selectedStatus) return false;
      return true;
    });
  }, [bookings, startDate, endDate, selectedRoomId, selectedDepartment, selectedStatus]);

  // Key KPI calculations
  const totalBookings = filtered.length;

  const totalMinutes = filtered
    .filter(b => b.status !== 'Dibatalkan')
    .reduce((acc, b) => {
      const dur = Math.max(timeToMinutes(b.endTime) - timeToMinutes(b.startTime), 0);
      return acc + dur;
    }, 0);

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Most used room
  const roomCounts: Record<string, number> = {};
  filtered.filter(b => b.status !== 'Dibatalkan').forEach(b => {
    roomCounts[b.roomName] = (roomCounts[b.roomName] || 0) + 1;
  });
  let topRoom = '-';
  let topRoomCount = 0;
  Object.entries(roomCounts).forEach(([name, count]) => {
    if (count > topRoomCount) {
      topRoom = name;
      topRoomCount = count;
    }
  });

  // Top department
  const deptCounts: Record<string, number> = {};
  filtered.forEach(b => {
    deptCounts[b.department] = (deptCounts[b.department] || 0) + 1;
  });
  let topDept = '-';
  let topDeptCount = 0;
  Object.entries(deptCounts).forEach(([dept, count]) => {
    if (count > topDeptCount) {
      topDept = dept;
      topDeptCount = count;
    }
  });

  // Chart: Bookings by department
  const departmentChartData = DEPARTMENTS.map(dept => {
    const count = filtered.filter(b => b.department === dept).length;
    return {
      label: dept.length > 15 ? dept.substring(0, 15) + '...' : dept,
      value: count,
      color: '#6366f1',
    };
  }).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  // Chart: Room utilization
  const roomChartData = rooms.map(room => {
    const count = filtered.filter(b => b.roomId === room.id && b.status !== 'Dibatalkan').length;
    return {
      label: room.name,
      value: count,
      color: room.color || '#0284c7',
      subText: `${room.capacity} org`,
    };
  }).sort((a, b) => b.value - a.value);

  // Chart: Status breakdown
  const statusCounts = {
    Diluluskan: filtered.filter(b => b.status === 'Diluluskan').length,
    'Sedang Berlangsung': filtered.filter(b => b.status === 'Sedang Berlangsung').length,
    'Menunggu Kelulusan': filtered.filter(b => b.status === 'Menunggu Kelulusan').length,
    Selesai: filtered.filter(b => b.status === 'Selesai').length,
    Dibatalkan: filtered.filter(b => b.status === 'Dibatalkan').length,
  };

  const donutStatusData = [
    { label: 'Diluluskan', value: statusCounts.Diluluskan, color: '#0284c7' },
    { label: 'Sedang Berlangsung', value: statusCounts['Sedang Berlangsung'], color: '#ef4444' },
    { label: 'Menunggu', value: statusCounts['Menunggu Kelulusan'], color: '#f59e0b' },
    { label: 'Selesai', value: statusCounts.Selesai, color: '#10b981' },
    { label: 'Dibatalkan', value: statusCounts.Dibatalkan, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['No Rujukan', 'Tajuk', 'Bilik', 'Tarikh', 'Mula', 'Tamat', 'Penganjur', 'Jabatan', 'Peserta', 'Status'];
    const rows = filtered.map(b => [
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
    link.download = `laporan_tempahan_${formatDateISO(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Laporan Dimuat Turun', 'Fail CSV laporan berjaya dieksport mengikut tapisan.', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Laporan & Analitik Penggunaan Bilik
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Statistik terperinci kekerapan tempahan, jam penggunaan dan trend mesyuarat organisasi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Eksport Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter Card (no-print) */}
      <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tarikh Mula</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tarikh Tamat</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Bilik Mesyuarat</label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Bilik</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Jabatan</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Jabatan</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Status</option>
              <option value="Diluluskan">Diluluskan</option>
              <option value="Sedang Berlangsung">Sedang Berlangsung</option>
              <option value="Menunggu Kelulusan">Menunggu Kelulusan</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Print Title Header (Only visible on print) */}
      <div className="hidden print:block mb-6 text-center border-b pb-4">
        <h1 className="text-xl font-bold">{settings.orgName}</h1>
        <p className="text-sm text-slate-600">Laporan Statistik Penggunaan Bilik Mesyuarat</p>
        <p className="text-xs text-slate-500">
          Tempoh: {formatDateMalay(startDate)} sehingga {formatDateMalay(endDate)}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Jumlah Tempahan</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalBookings}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Sepanjang tempoh dipilih</p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Jumlah Jam Penggunaan</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{totalHours} <span className="text-sm font-semibold">jam</span></div>
          <p className="text-[11px] text-slate-400 mt-0.5">Masa bilik diduduki</p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Bilik Paling Kerap Digunakan</span>
          <div className="text-sm font-black text-slate-900 mt-1 truncate" title={topRoom}>{topRoom}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">{topRoomCount} kali tempahan</p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Jabatan Paling Aktif</span>
          <div className="text-sm font-black text-slate-900 mt-1 truncate" title={topDept}>{topDept}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">{topDeptCount} permohonan</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room usage horizontal bar chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Kekerapan Penggunaan Setiap Bilik
            </h3>
            <p className="text-xs text-slate-500">Jumlah mesyuarat yang dianjurkan di setiap bilik</p>
          </div>
          <div className="pt-2">
            <HorizontalBarChart data={roomChartData} valueSuffix="sesi" />
          </div>
        </div>

        {/* Status Breakdown Donut */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Pecahan Mengikut Status Permohonan
            </h3>
            <p className="text-xs text-slate-500">Kadar kelulusan dan pembatalan mesyuarat</p>
          </div>
          <div className="py-4">
            <DonutChart data={donutStatusData} size={180} innerRadius={55} />
          </div>
        </div>

        {/* Department Usage Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Tempahan Mengikut Jabatan
            </h3>
            <p className="text-xs text-slate-500">Bilangan tempahan yang dibuat oleh setiap bahagian organisasi</p>
          </div>
          <div className="pt-2">
            <HorizontalBarChart data={departmentChartData} valueSuffix="tempahan" />
          </div>
        </div>
      </div>
    </div>
  );
};
