export type Role = 'Admin' | 'Pengurus' | 'Pengguna';

export type BookingStatus = 'Menunggu Kelulusan' | 'Diluluskan' | 'Sedang Berlangsung' | 'Selesai' | 'Dibatalkan';

export type RoomStatus = 'Tersedia' | 'Penyelenggaraan' | 'Tidak Aktif';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  phone: string;
  role: Role;
  avatar: string;
  status: 'Aktif' | 'Tidak Aktif';
  createdAt: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  location: string;
  floor: string;
  capacity: number;
  status: RoomStatus;
  facilities: string[];
  image: string;
  description: string;
  hourlyRate?: number;
  color: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  title: string;
  purpose: string;
  roomId: string;
  roomName: string;
  userId: string;
  organizerName: string;
  organizerEmail: string;
  department: string;
  attendeesCount: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  equipment: string[];
  notes?: string;
  status: BookingStatus;
  rejectionReason?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // or 'all'
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  bookingId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  module: 'Tempahan' | 'Bilik' | 'Pengguna' | 'Tetapan' | 'Sistem';
  details: string;
  ip?: string;
}

export interface OrganizationSettings {
  orgName: string;
  tagline: string;
  logoUrl: string;
  operatingDays: string[]; // e.g. ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat']
  operatingStartTime: string; // '08:00'
  operatingEndTime: string; // '18:00'
  minDurationMinutes: number; // 30
  maxDurationMinutes: number; // 480 (8 hours)
  approvalMode: 'auto' | 'manual'; // auto = auto approved, manual = needs manager/admin
  leadTimeHours: number; // minimum notice period
  allowWeekendBooking: boolean;
  reminderMinutesBefore: number; // 30
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingBooking?: Booking;
  message?: string;
  availableRoomsAlternative?: Room[];
  availableSlotsAlternative?: { startTime: string; endTime: string }[];
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
