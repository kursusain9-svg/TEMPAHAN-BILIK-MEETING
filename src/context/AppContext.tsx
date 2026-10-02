import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Booking,
  Room,
  User,
  NotificationItem,
  AuditLog,
  OrganizationSettings,
  ToastMessage,
  ConflictCheckResult
} from '../types';
import { StorageService } from '../services/storage';
import { formatDateISO } from '../utils/dateUtils';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Current User / Auth
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: 'Admin' | 'Pengurus' | 'Pengguna') => void;

  // Bookings
  bookings: Booking[];
  addBooking: (bookingData: Omit<Booking, 'id' | 'bookingRef' | 'createdAt' | 'updatedAt' | 'status'>) => { success: boolean; booking?: Booking; error?: string };
  updateBooking: (id: string, updatedData: Partial<Booking>) => { success: boolean; error?: string };
  cancelBooking: (id: string, reason: string) => boolean;
  approveBooking: (id: string) => boolean;
  rejectBooking: (id: string, reason: string) => boolean;
  deleteBooking: (id: string) => boolean;

  // Conflict Checking
  checkConflict: (roomId: string, date: string, startTime: string, endTime: string, excludeBookingId?: string) => ConflictCheckResult;

  // Rooms
  rooms: Room[];
  addRoom: (roomData: Omit<Room, 'id'>) => boolean;
  updateRoom: (id: string, roomData: Partial<Room>) => boolean;
  deleteRoom: (id: string) => boolean;

  // Users
  users: User[];
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => boolean;
  updateUser: (id: string, userData: Partial<User>) => boolean;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (action: string, module: 'Tempahan' | 'Bilik' | 'Pengguna' | 'Tetapan' | 'Sistem', details: string) => void;

  // Settings
  settings: OrganizationSettings;
  updateSettings: (newSettings: OrganizationSettings) => void;
  resetAllDataToDemo: () => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;

  // Modals
  isBookingWizardOpen: boolean;
  setIsBookingWizardOpen: (open: boolean) => void;
  wizardPreselectedRoom: Room | null;
  wizardPreselectedDate: string;
  wizardPreselectedStartTime: string;
  wizardPreselectedEndTime: string;
  openBookingWizard: (preselectedRoom?: Room, preselectedDate?: string, preselectedStartTime?: string, preselectedEndTime?: string) => void;
  closeBookingWizard: () => void;

  selectedBookingForDetail: Booking | null;
  openBookingDetail: (booking: Booking) => void;
  closeBookingDetail: () => void;

  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [settings, setSettings] = useState<OrganizationSettings>(() => StorageService.getSettings());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const all = StorageService.getUsers();
    return all.find(u => u.role === 'Admin') || all[0];
  });
  const [rooms, setRooms] = useState<Room[]>(() => StorageService.getRooms());
  const [bookings, setBookings] = useState<Booking[]>(() => StorageService.getBookings());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StorageService.getNotifications());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isBookingWizardOpen, setIsBookingWizardOpen] = useState(false);
  const [wizardPreselectedRoom, setWizardPreselectedRoom] = useState<Room | null>(null);
  const [wizardPreselectedDate, setWizardPreselectedDate] = useState<string>(formatDateISO(new Date()));
  const [wizardPreselectedStartTime, setWizardPreselectedStartTime] = useState<string>('10:00');
  const [wizardPreselectedEndTime, setWizardPreselectedEndTime] = useState<string>('11:00');
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // Sync to storage on updates
  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    StorageService.saveUsers(users);
  }, [users]);

  useEffect(() => {
    StorageService.saveRooms(rooms);
  }, [rooms]);

  useEffect(() => {
    StorageService.saveBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    StorageService.saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    StorageService.saveAuditLogs(auditLogs);
  }, [auditLogs]);

  // Toast helper
  const showToast = (title: string, message?: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Audit log helper
  const addAuditLog = (
    action: string,
    module: 'Tempahan' | 'Bilik' | 'Pengguna' | 'Tetapan' | 'Sistem',
    details: string
  ) => {
    const now = new Date();
    const timeStr = `${formatDateISO(now)} ${now.toTimeString().substring(0, 8)}`;
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: timeStr,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      details,
      ip: '192.168.1.' + Math.floor(10 + Math.random() * 80),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Notification helper
  const addNotification = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    bookingId?: string
  ) => {
    const now = new Date();
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: 'all',
      title,
      message,
      type,
      bookingId,
      read: false,
      createdAt: `${formatDateISO(now)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Role Switcher
  const switchRole = (role: 'Admin' | 'Pengurus' | 'Pengguna') => {
    const targetUser = users.find(u => u.role === role) || users[0];
    setCurrentUser(targetUser);
    showToast(`Beralih Peranan: ${role}`, `Log masuk sebagai ${targetUser.name} (${targetUser.department})`, 'info');
    addAuditLog('Tukar Peranan Pengguna', 'Pengguna', `Beralih ke profil demo: ${targetUser.name} (${role})`);
  };

  // Conflict checker proxy
  const checkConflict = (
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): ConflictCheckResult => {
    return StorageService.checkConflict(roomId, date, startTime, endTime, excludeBookingId);
  };

  // Booking Actions
  const addBooking = (
    bookingData: Omit<Booking, 'id' | 'bookingRef' | 'createdAt' | 'updatedAt' | 'status'>
  ) => {
    // 1. Conflict Check
    const conflict = checkConflict(bookingData.roomId, bookingData.date, bookingData.startTime, bookingData.endTime);
    if (conflict.hasConflict) {
      return { success: false, error: conflict.message || 'Terdapat pertindihan masa dengan tempahan lain.' };
    }

    const now = new Date();
    const count = bookings.length + 1;
    const bookingRef = `BK2026-${String(count).padStart(3, '0')}`;

    // Auto or Manual Approval mode
    const status = (settings.approvalMode === 'auto' || currentUser.role === 'Admin')
      ? 'Diluluskan'
      : 'Menunggu Kelulusan';

    const newBooking: Booking = {
      ...bookingData,
      id: 'bk-' + Date.now(),
      bookingRef,
      status,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      approvedBy: status === 'Diluluskan' ? currentUser.name : undefined,
    };

    setBookings(prev => [newBooking, ...prev]);

    // Audit log
    addAuditLog(
      'Membuat Tempahan',
      'Tempahan',
      `Tempahan #${bookingRef} (${bookingData.title}) di ${bookingData.roomName} pada ${bookingData.date} [Status: ${status}]`
    );

    // Notification
    if (status === 'Diluluskan') {
      addNotification(
        'Tempahan Baru Dicipta & Disahkan',
        `Tempahan #${bookingRef} (${bookingData.title}) di ${bookingData.roomName} telah didaftarkan.`,
        'success',
        newBooking.id
      );
    } else {
      addNotification(
        'Permohonan Tempahan Baharu',
        `Tempahan #${bookingRef} (${bookingData.title}) oleh ${bookingData.organizerName} menunggu kelulusan pengurus.`,
        'info',
        newBooking.id
      );
    }

    // Confetti celebration
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    showToast('Tempahan Berjaya!', `Nombor rujukan tempahan: ${bookingRef}`, 'success');
    return { success: true, booking: newBooking };
  };

  const updateBooking = (id: string, updatedData: Partial<Booking>) => {
    const existing = bookings.find(b => b.id === id);
    if (!existing) return { success: false, error: 'Tempahan tidak ditemui.' };

    const roomId = updatedData.roomId || existing.roomId;
    const date = updatedData.date || existing.date;
    const startTime = updatedData.startTime || existing.startTime;
    const endTime = updatedData.endTime || existing.endTime;

    // Check conflict when date, room, or time is modified
    if (
      roomId !== existing.roomId ||
      date !== existing.date ||
      startTime !== existing.startTime ||
      endTime !== existing.endTime
    ) {
      const conflict = checkConflict(roomId, date, startTime, endTime, id);
      if (conflict.hasConflict) {
        return { success: false, error: conflict.message || 'Terdapat pertindihan dengan tempahan lain.' };
      }
    }

    const updatedBooking: Booking = {
      ...existing,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };

    setBookings(prev => prev.map(b => b.id === id ? updatedBooking : b));

    if (selectedBookingForDetail?.id === id) {
      setSelectedBookingForDetail(updatedBooking);
    }

    addAuditLog(
      'Mengemaskini Tempahan',
      'Tempahan',
      `Tempahan #${existing.bookingRef} (${existing.title}) dikemaskini oleh ${currentUser.name}`
    );

    addNotification(
      'Tempahan Dikemaskini',
      `Maklumat tempahan #${existing.bookingRef} telah berjaya dikemaskini.`,
      'info',
      id
    );

    showToast('Berjaya Dikemaskini', `Tempahan #${existing.bookingRef} telah disimpan.`, 'success');
    return { success: true };
  };

  const cancelBooking = (id: string, reason: string) => {
    const existing = bookings.find(b => b.id === id);
    if (!existing) return false;

    const updated: Booking = {
      ...existing,
      status: 'Dibatalkan',
      cancellationReason: reason,
      updatedAt: new Date().toISOString(),
    };

    setBookings(prev => prev.map(b => b.id === id ? updated : b));

    if (selectedBookingForDetail?.id === id) {
      setSelectedBookingForDetail(updated);
    }

    addAuditLog(
      'Membatalkan Tempahan',
      'Tempahan',
      `Tempahan #${existing.bookingRef} dibatalkan oleh ${currentUser.name}. Sebab: ${reason}`
    );

    addNotification(
      'Tempahan Dibatalkan',
      `Tempahan #${existing.bookingRef} (${existing.title}) telah dibatalkan.`,
      'error',
      id
    );

    showToast('Tempahan Dibatalkan', `Tempahan #${existing.bookingRef} telah dibatalkan.`, 'warning');
    return true;
  };

  const approveBooking = (id: string) => {
    const existing = bookings.find(b => b.id === id);
    if (!existing) return false;

    // Check conflict before approving
    const conflict = checkConflict(existing.roomId, existing.date, existing.startTime, existing.endTime, id);
    if (conflict.hasConflict) {
      showToast('Gagal Meluluskan', conflict.message || 'Terdapat pertindihan masa dengan tempahan lain.', 'error');
      return false;
    }

    const updated: Booking = {
      ...existing,
      status: 'Diluluskan',
      approvedBy: currentUser.name,
      updatedAt: new Date().toISOString(),
    };

    setBookings(prev => prev.map(b => b.id === id ? updated : b));

    if (selectedBookingForDetail?.id === id) {
      setSelectedBookingForDetail(updated);
    }

    addAuditLog(
      'Meluluskan Tempahan',
      'Tempahan',
      `Tempahan #${existing.bookingRef} diluluskan oleh ${currentUser.name}`
    );

    addNotification(
      'Tempahan Anda Telah Diluluskan',
      `Tempahan #${existing.bookingRef} (${existing.title}) di ${existing.roomName} telah diluluskan.`,
      'success',
      id
    );

    showToast('Tempahan Diluluskan', `Tempahan #${existing.bookingRef} kini berstatus Diluluskan.`, 'success');
    return true;
  };

  const rejectBooking = (id: string, reason: string) => {
    const existing = bookings.find(b => b.id === id);
    if (!existing) return false;

    const updated: Booking = {
      ...existing,
      status: 'Dibatalkan',
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    };

    setBookings(prev => prev.map(b => b.id === id ? updated : b));

    if (selectedBookingForDetail?.id === id) {
      setSelectedBookingForDetail(updated);
    }

    addAuditLog(
      'Menolak Tempahan',
      'Tempahan',
      `Tempahan #${existing.bookingRef} ditolak oleh ${currentUser.name}. Alasan: ${reason}`
    );

    addNotification(
      'Tempahan Ditolak',
      `Permohonan tempahan #${existing.bookingRef} telah ditolak. Alasan: ${reason}`,
      'error',
      id
    );

    showToast('Permohonan Ditolak', `Tempahan #${existing.bookingRef} telah ditolak.`, 'info');
    return true;
  };

  const deleteBooking = (id: string) => {
    const existing = bookings.find(b => b.id === id);
    if (!existing) return false;

    setBookings(prev => prev.filter(b => b.id !== id));
    if (selectedBookingForDetail?.id === id) {
      setSelectedBookingForDetail(null);
    }

    addAuditLog('Memadam Rekod Tempahan', 'Tempahan', `Memadam rekod #${existing.bookingRef}`);
    showToast('Rekod Dipadam', `Tempahan #${existing.bookingRef} telah dikeluarkan dari sistem.`, 'info');
    return true;
  };

  // Room Actions
  const addRoom = (roomData: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...roomData,
      id: 'rm-' + Date.now(),
    };
    setRooms(prev => [...prev, newRoom]);
    addAuditLog('Menambah Bilik Mesyuarat', 'Bilik', `Menambah bilik baharu: ${newRoom.name} (${newRoom.code})`);
    showToast('Bilik Ditambah', `Bilik ${newRoom.name} sedia untuk ditempah.`, 'success');
    return true;
  };

  const updateRoom = (id: string, roomData: Partial<Room>) => {
    const existing = rooms.find(r => r.id === id);
    if (!existing) return false;

    const updated = { ...existing, ...roomData };
    setRooms(prev => prev.map(r => r.id === id ? updated : r));
    addAuditLog('Mengemaskini Bilik', 'Bilik', `Kemaskini maklumat bilik: ${updated.name}`);
    showToast('Bilik Dikemaskini', `Maklumat bilik ${updated.name} berjaya disimpan.`, 'success');
    return true;
  };

  const deleteRoom = (id: string) => {
    const existing = rooms.find(r => r.id === id);
    if (!existing) return false;

    // Check if room has active bookings
    const activeBooking = bookings.find(b => b.roomId === id && (b.status === 'Diluluskan' || b.status === 'Sedang Berlangsung'));
    if (activeBooking) {
      showToast('Tidak Boleh Dipadam', `Bilik ini mempunyai tempahan aktif #${activeBooking.bookingRef}. Sila batalkan atau ubah tempahan dahulu.`, 'error');
      return false;
    }

    setRooms(prev => prev.filter(r => r.id !== id));
    addAuditLog('Memadam Bilik', 'Bilik', `Bilik ${existing.name} (${existing.code}) dipadam.`);
    showToast('Bilik Dipadam', `Bilik ${existing.name} telah dipadam.`, 'info');
    return true;
  };

  // User Actions
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: 'usr-' + Date.now(),
      createdAt: formatDateISO(new Date()),
    };
    setUsers(prev => [...prev, newUser]);
    addAuditLog('Menambah Pengguna', 'Pengguna', `Pendaftaran staf baru: ${newUser.name} (${newUser.role})`);
    showToast('Pengguna Didaftarkan', `${newUser.name} berjaya ditambah.`, 'success');
    return true;
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    const existing = users.find(u => u.id === id);
    if (!existing) return false;

    const updated = { ...existing, ...userData };
    setUsers(prev => prev.map(u => u.id === id ? updated : u));
    if (currentUser.id === id) {
      setCurrentUser(updated);
    }
    addAuditLog('Mengemaskini Profil Pengguna', 'Pengguna', `Maklumat ${updated.name} dikemaskini.`);
    showToast('Profil Dikemaskini', `Maklumat ${updated.name} disimpan.`, 'success');
    return true;
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('Semua Ditanda Dibaca', 'Semua notifikasi telah ditandakan sebagai dibaca.', 'info');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Settings
  const updateSettings = (newSettings: OrganizationSettings) => {
    setSettings(newSettings);
    addAuditLog('Mengemaskini Tetapan Sistem', 'Tetapan', 'Konfigurasi organisasi dan waktu operasi dikemaskini.');
    showToast('Tetapan Disimpan', 'Konfigurasi sistem berjaya dikemaskini.', 'success');
  };

  const resetAllDataToDemo = () => {
    StorageService.resetAllData();
    window.location.reload();
  };

  // Modal helpers
  const openBookingWizard = (
    preselectedRoom?: Room,
    preselectedDate?: string,
    preselectedStartTime?: string,
    preselectedEndTime?: string
  ) => {
    setWizardPreselectedRoom(preselectedRoom || null);
    if (preselectedDate) setWizardPreselectedDate(preselectedDate);
    if (preselectedStartTime) setWizardPreselectedStartTime(preselectedStartTime);
    if (preselectedEndTime) setWizardPreselectedEndTime(preselectedEndTime);
    setIsBookingWizardOpen(true);
  };

  const closeBookingWizard = () => {
    setIsBookingWizardOpen(false);
    setWizardPreselectedRoom(null);
  };

  const openBookingDetail = (booking: Booking) => {
    setSelectedBookingForDetail(booking);
  };

  const closeBookingDetail = () => {
    setSelectedBookingForDetail(null);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        setCurrentUser,
        switchRole,
        bookings,
        addBooking,
        updateBooking,
        cancelBooking,
        approveBooking,
        rejectBooking,
        deleteBooking,
        checkConflict,
        rooms,
        addRoom,
        updateRoom,
        deleteRoom,
        users,
        addUser,
        updateUser,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        auditLogs,
        addAuditLog,
        settings,
        updateSettings,
        resetAllDataToDemo,
        toasts,
        showToast,
        removeToast,
        isBookingWizardOpen,
        setIsBookingWizardOpen,
        wizardPreselectedRoom,
        wizardPreselectedDate,
        wizardPreselectedStartTime,
        wizardPreselectedEndTime,
        openBookingWizard,
        closeBookingWizard,
        selectedBookingForDetail,
        openBookingDetail,
        closeBookingDetail,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
