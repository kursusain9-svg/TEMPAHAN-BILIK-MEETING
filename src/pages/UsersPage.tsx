import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  UserPlus,
  Shield,
  Briefcase,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  LogIn,
  X,
  Building
} from 'lucide-react';
import { User, Role } from '../types';
import { DEPARTMENTS } from '../services/storage';

export const UsersPage: React.FC = () => {
  const { users, addUser, updateUser, currentUser, setCurrentUser, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('012-3456789');
  const [role, setRole] = useState<Role>('Pengguna');
  const [status, setStatus] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');

  const filteredUsers = users.filter(u => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.position.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (deptFilter !== 'all' && u.department !== deptFilter) return false;
    return true;
  });

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setDepartment(DEPARTMENTS[0]);
    setPosition('');
    setPhone('012-3456789');
    setRole('Pengguna');
    setStatus('Aktif');
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setDepartment(user.department);
    setPosition(user.position);
    setPhone(user.phone);
    setRole(user.role);
    setStatus(user.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        name: name.trim(),
        email: email.trim(),
        department,
        position: position.trim() || 'Pegawai',
        phone: phone.trim(),
        role,
        status,
      });
    } else {
      addUser({
        name: name.trim(),
        email: email.trim(),
        department,
        position: position.trim() || 'Pegawai',
        phone: phone.trim(),
        role,
        status,
        avatar: `https://images.unsplash.com/photo-${Math.floor(1500000000000 + Math.random() * 99999999)}?w=150&auto=format&fit=crop&q=80`,
      });
    }

    setIsModalOpen(false);
  };

  const switchAccount = (user: User) => {
    setCurrentUser(user);
    showToast('Akaun Ditukar', `Kini menggunakan profil: ${user.name} (${user.role})`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pengurusan Pengguna & Kawalan Akses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Senarai kakitangan berdaftar, peranan capaian (RBAC), dan penugasan jabatan ({users.length} akaun)
          </p>
        </div>

        {currentUser.role === 'Admin' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Daftar Pengguna Baharu</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, emel, jawatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Peranan</option>
            <option value="Admin">Admin</option>
            <option value="Pengurus">Pengurus</option>
            <option value="Pengguna">Pengguna</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Jabatan</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Nama & Emel</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">Jawatan</th>
                <th className="py-3 px-4">Peranan (Role)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => {
                const isCurrent = currentUser.id === u.id;
                const roleColors = {
                  Admin: 'bg-purple-50 text-purple-700 border-purple-200',
                  Pengurus: 'bg-sky-50 text-sky-700 border-sky-200',
                  Pengguna: 'bg-slate-100 text-slate-700 border-slate-200',
                };

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {u.name}
                            {isCurrent && (
                              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 rounded">
                                Anda
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                      {u.department}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {u.position}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${roleColors[u.role]}`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        u.status === 'Aktif' ? 'text-emerald-700' : 'text-slate-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${u.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isCurrent && (
                          <button
                            onClick={() => switchAccount(u)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                            title="Log masuk sebagai pengguna ini (Demo)"
                          >
                            <LogIn className="w-3 h-3" />
                            Guna Profil
                          </button>
                        )}

                        {currentUser.role === 'Admin' && (
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                            title="Edit Pengguna"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingUser ? 'Kemaskini Pengguna' : 'Daftar Pengguna Baharu'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Penuh <span className="text-rose-500">*</span>
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
                  Emel Korporat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jawatan</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Contoh: Eksekutif Kanan"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peranan (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Admin">Admin (Akses Penuh)</option>
                    <option value="Pengurus">Pengurus (Kelulusan)</option>
                    <option value="Pengguna">Pengguna (Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Tidak Aktif')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  {editingUser ? 'Simpan' : 'Daftar Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
