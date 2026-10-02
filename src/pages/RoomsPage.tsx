import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Users,
  Plus,
  Edit2,
  Trash2,
  Power,
  Tv,
  X,
  Search,
  CheckCircle,
  AlertTriangle,
  DoorOpen
} from 'lucide-react';
import { Room, RoomStatus } from '../types';
import { ALL_FACILITIES } from '../services/storage';

export const RoomsPage: React.FC = () => {
  const { rooms, addRoom, updateRoom, deleteRoom, currentUser, openBookingWizard } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [floor, setFloor] = useState('Aras 1');
  const [capacity, setCapacity] = useState(15);
  const [status, setStatus] = useState<RoomStatus>('Tersedia');
  const [facilities, setFacilities] = useState<string[]>(['Projektor', 'Whiteboard', 'Air Conditioner']);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#0284c7');

  const isAdminOrManager = currentUser.role === 'Admin' || currentUser.role === 'Pengurus';

  const filteredRooms = rooms.filter(r => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!r.name.toLowerCase().includes(q) && !r.code.toLowerCase().includes(q) && !r.location.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (statusFilter !== 'all' && r.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const openAddModal = () => {
    setEditingRoom(null);
    setName('');
    setCode(`BM-${Math.floor(100 + Math.random() * 900)}`);
    setLocation('Blok Pentadbiran, Aras 1');
    setFloor('Aras 1');
    setCapacity(15);
    setStatus('Tersedia');
    setFacilities(['Projektor', 'Whiteboard', 'Air Conditioner']);
    setImage('https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80');
    setDescription('');
    setColor('#0284c7');
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setName(room.name);
    setCode(room.code);
    setLocation(room.location);
    setFloor(room.floor);
    setCapacity(room.capacity);
    setStatus(room.status);
    setFacilities(room.facilities);
    setImage(room.image);
    setDescription(room.description);
    setColor(room.color || '#0284c7');
    setIsModalOpen(true);
  };

  const handleFacilityToggle = (item: string) => {
    if (facilities.includes(item)) {
      setFacilities(facilities.filter(f => f !== item));
    } else {
      setFacilities([...facilities, item]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingRoom) {
      updateRoom(editingRoom.id, {
        name: name.trim(),
        code: code.trim(),
        location: location.trim(),
        floor,
        capacity,
        status,
        facilities,
        image: image.trim() || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
        description: description.trim(),
        color,
      });
    } else {
      addRoom({
        name: name.trim(),
        code: code.trim(),
        location: location.trim(),
        floor,
        capacity,
        status,
        facilities,
        image: image.trim() || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
        description: description.trim(),
        color,
      });
    }

    setIsModalOpen(false);
  };

  const toggleStatusDirect = (room: Room) => {
    const nextStatus: RoomStatus =
      room.status === 'Tersedia'
        ? 'Penyelenggaraan'
        : room.status === 'Penyelenggaraan'
        ? 'Tidak Aktif'
        : 'Tersedia';

    updateRoom(room.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pengurusan Bilik Mesyuarat
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Senarai bilik persidangan, kelengkapan fasiliti, dan kapasiti bagi seluruh blok pejabat ({rooms.length} bilik)
          </p>
        </div>

        {isAdminOrManager && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Bilik Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari bilik, kod, lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Status</option>
            <option value="Tersedia">Tersedia</option>
            <option value="Penyelenggaraan">Penyelenggaraan</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Rooms Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map(room => {
          const statusColors = {
            'Tersedia': 'bg-emerald-50 text-emerald-800 border-emerald-200',
            'Penyelenggaraan': 'bg-amber-50 text-amber-800 border-amber-200',
            'Tidak Aktif': 'bg-rose-50 text-rose-800 border-rose-200',
          };

          return (
            <div
              key={room.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                {/* Room Image */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900/80 text-white backdrop-blur">
                      {room.code}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border backdrop-blur ${statusColors[room.status]}`}>
                      {room.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{room.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{room.location}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Kapasiti: <strong className="text-slate-900">{room.capacity} orang</strong>
                    </span>
                    <span>·</span>
                    <span>{room.floor}</span>
                  </div>

                  {room.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>
                  )}

                  {/* Facilities */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Kemudahan
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {room.facilities.map(fac => (
                        <span
                          key={fac}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                <button
                  onClick={() => openBookingWizard(room)}
                  disabled={room.status !== 'Tersedia'}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  {room.status === 'Tersedia' ? 'Tempah Bilik' : 'Tidak Sedia'}
                </button>

                {isAdminOrManager && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleStatusDirect(room)}
                      title={`Tukar status (kini: ${room.status})`}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-white rounded-md transition-colors"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(room)}
                      title="Edit Maklumat Bilik"
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {currentUser.role === 'Admin' && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Adakah anda pasti mahu memadam bilik "${room.name}"?`)) {
                            deleteRoom(room.id);
                          }
                        }}
                        title="Padam Bilik"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingRoom ? 'Kemaskini Bilik Mesyuarat' : 'Daftar Bilik Mesyuarat Baharu'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Bilik <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Bilik Mesyuarat Melor"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kod Bilik <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Contoh: BM-M07"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tingkat / Aras
                  </label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="Contoh: Aras 2"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kapasiti (Orang) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lokasi Pejabat
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Blok B, Sayap Barat, Aras 2"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Bilik
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RoomStatus)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Penyelenggaraan">Penyelenggaraan</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Gambar Bilik
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kemudahan & Fasiliti
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_FACILITIES.map(fac => (
                    <label key={fac} className="flex items-center gap-2 p-2 border rounded text-xs bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facilities.includes(fac)}
                        onChange={() => handleFacilityToggle(fac)}
                        className="rounded text-indigo-600"
                      />
                      <span>{fac}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Bilik
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan mengenai keluasan, suasana, atau garis panduan bilik..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
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
                  {editingRoom ? 'Simpan Kemaskini' : 'Tambah Bilik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
