import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Building2, Calendar, User, X, ArrowRight } from 'lucide-react';
import { formatTime12h, formatDateMalay } from '../utils/dateUtils';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    rooms,
    bookings,
    users,
    openBookingDetail,
    setActiveTab,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [isGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const matchedRooms = cleanQuery
    ? rooms.filter(
        r =>
          r.name.toLowerCase().includes(cleanQuery) ||
          r.code.toLowerCase().includes(cleanQuery) ||
          r.location.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchedBookings = cleanQuery
    ? bookings.filter(
        b =>
          b.title.toLowerCase().includes(cleanQuery) ||
          b.bookingRef.toLowerCase().includes(cleanQuery) ||
          b.organizerName.toLowerCase().includes(cleanQuery) ||
          b.department.toLowerCase().includes(cleanQuery) ||
          b.roomName.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchedUsers = cleanQuery
    ? users.filter(
        u =>
          u.name.toLowerCase().includes(cleanQuery) ||
          u.email.toLowerCase().includes(cleanQuery) ||
          u.department.toLowerCase().includes(cleanQuery) ||
          u.position.toLowerCase().includes(cleanQuery)
      )
    : [];

  const totalResults = matchedRooms.length + matchedBookings.length + matchedUsers.length;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Search input bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari bilik mesyuarat, kod, nama penganjur, tajuk mesyuarat, jabatan..."
            className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Search Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!cleanQuery ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <p className="font-semibold text-slate-600">Pencarian Pantas Global</p>
              <p className="mt-1">
                Taip nama bilik (cth: "Utama"), penganjur (cth: "Ahmad"), atau kod tempahan (cth: "BK2026-001").
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Tiada padanan ditemui untuk "{query}".
            </div>
          ) : (
            <>
              {/* Rooms */}
              {matchedRooms.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    Bilik Mesyuarat ({matchedRooms.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedRooms.map(room => (
                      <div
                        key={room.id}
                        onClick={() => {
                          setIsGlobalSearchOpen(false);
                          setActiveTab('rooms');
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={room.image}
                            alt={room.name}
                            className="w-10 h-10 rounded-md object-cover border border-slate-200"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{room.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {room.code} · {room.location} · {room.capacity} orang
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                          Lihat Bilik <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookings */}
              {matchedBookings.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    Tempahan Mesyuarat ({matchedBookings.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedBookings.map(b => (
                      <div
                        key={b.id}
                        onClick={() => {
                          setIsGlobalSearchOpen(false);
                          openBookingDetail(b);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              #{b.bookingRef}
                            </span>
                            <p className="text-xs font-bold text-slate-900">{b.title}</p>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {b.roomName} · {formatDateMalay(b.date)} ({formatTime12h(b.startTime)} - {formatTime12h(b.endTime)}) · {b.organizerName}
                          </p>
                        </div>
                        <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                          Butiran <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {matchedUsers.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    Kakitangan & Penganjur ({matchedUsers.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedUsers.map(user => (
                      <div
                        key={user.id}
                        onClick={() => {
                          setIsGlobalSearchOpen(false);
                          setActiveTab('users');
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{user.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {user.position} · {user.department} ({user.email})
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {user.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Tekan <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">ESC</kbd> untuk tutup tingkap carian
        </div>
      </div>
    </div>
  );
};
