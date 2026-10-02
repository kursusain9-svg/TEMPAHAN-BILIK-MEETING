import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  History,
  Search,
  Filter,
  Shield,
  Clock,
  Layers,
  FileText
} from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { auditLogs, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.ip && log.ip.includes(q));
      if (!match) return false;
    }
    if (selectedModule !== 'all' && log.module !== selectedModule) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-600" />
          Log Aktiviti & Audit Keselamatan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Rekod jejak audit menyeluruh setiap tindakan pentadbir, kelulusan, pembatalan, dan pengubahsuaian jadual
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari tindakan, pengguna, butiran, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Modul</option>
            <option value="Tempahan">Tempahan</option>
            <option value="Bilik">Bilik</option>
            <option value="Pengguna">Pengguna</option>
            <option value="Tetapan">Tetapan</option>
            <option value="Sistem">Sistem</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Tarikh & Masa</th>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Modul</th>
                <th className="py-3 px-4">Tindakan</th>
                <th className="py-3 px-4">Butiran Aktiviti</th>
                <th className="py-3 px-4 text-right">Alamat IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => {
                const moduleBadge = {
                  Tempahan: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                  Bilik: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  Pengguna: 'bg-purple-50 text-purple-700 border-purple-200',
                  Tetapan: 'bg-amber-50 text-amber-700 border-amber-200',
                  Sistem: 'bg-slate-100 text-slate-700 border-slate-200',
                }[log.module] || 'bg-slate-100 text-slate-700 border-slate-200';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {log.timestamp}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{log.userName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {log.userRole}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${moduleBadge}`}>
                        {log.module}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-800">
                      {log.action}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-md">
                      <p className="line-clamp-2 leading-relaxed">{log.details}</p>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {log.ip || '127.0.0.1'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
