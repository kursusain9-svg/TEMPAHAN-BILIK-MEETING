import {
  Booking,
  Room,
  User,
  NotificationItem,
  AuditLog,
  OrganizationSettings,
  ConflictCheckResult
} from '../types';
import {
  doTimesOverlap,
  formatDateISO,
  getDateOffsetISO,
  timeToMinutes
} from '../utils/dateUtils';

const STORAGE_KEY_PREFIX = 'sistem_tempahan_';

export const INITIAL_SETTINGS: OrganizationSettings = {
  orgName: 'Kompleks Korporat Perdana',
  tagline: 'Sistem Pengurusan Tempahan Bilik Mesyuarat Pintar',
  logoUrl: '',
  operatingDays: ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat'],
  operatingStartTime: '08:00',
  operatingEndTime: '18:00',
  minDurationMinutes: 30,
  maxDurationMinutes: 480, // 8 hours
  approvalMode: 'manual', // or 'auto'
  leadTimeHours: 1,
  allowWeekendBooking: false,
  reminderMinutesBefore: 30,
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Ahmad Zulkifli',
    email: 'admin@demo.com',
    department: 'Teknologi Maklumat',
    position: 'Pentadbir Sistem & IT',
    phone: '012-3456789',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'Aktif',
    createdAt: '2026-01-15',
  },
  {
    id: 'usr-manager',
    name: 'Siti Khadijah',
    email: 'manager@demo.com',
    department: 'Pentadbiran & Sumber Manusia',
    position: 'Pengurus Pentadbiran',
    phone: '013-9876543',
    role: 'Pengurus',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'Aktif',
    createdAt: '2026-02-01',
  },
  {
    id: 'usr-user',
    name: 'Muhammad Ali',
    email: 'user@demo.com',
    department: 'Pemasaran & Komunikasi',
    position: 'Pegawai Pemasaran Kanan',
    phone: '019-1234567',
    role: 'Pengguna',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'Aktif',
    createdAt: '2026-02-10',
  },
  {
    id: 'usr-4',
    name: 'Nurul Huda',
    email: 'huda@demo.com',
    department: 'Kewangan & Akaun',
    position: 'Eksekutif Kewangan',
    phone: '017-6543210',
    role: 'Pengguna',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'Aktif',
    createdAt: '2026-03-01',
  },
  {
    id: 'usr-5',
    name: 'Razak Osman',
    email: 'razak@demo.com',
    department: 'Operasi & Logistik',
    position: 'Pengurus Operasi',
    phone: '018-2233445',
    role: 'Pengurus',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'Aktif',
    createdAt: '2026-03-12',
  },
  {
    id: 'usr-6',
    name: 'Farhana Rashid',
    email: 'farhana@demo.com',
    department: 'Penyelidikan & Strategi',
    position: 'Penganalisis Polisi',
    phone: '011-55667788',
    role: 'Pengguna',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'Aktif',
    createdAt: '2026-04-05',
  }
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'rm-1',
    code: 'BM-U01',
    name: 'Bilik Mesyuarat Utama',
    location: 'Blok Pentadbiran, Aras 1',
    floor: 'Aras 1',
    capacity: 35,
    status: 'Tersedia',
    facilities: ['Projektor', 'Skrin', 'TV', 'Video Conference', 'Mikrofon', 'Speaker', 'Whiteboard', 'Komputer', 'Air Conditioner'],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
    description: 'Bilik mesyuarat premier dilengkapi sistem telesidang video 4K terkini dan audio persidangan berpusat, sesuai untuk mesyuarat lembaga dan pembentangan penting.',
    hourlyRate: 150,
    color: '#0284c7', // Sky 600
  },
  {
    id: 'rm-2',
    code: 'BM-E02',
    name: 'Bilik Mesyuarat Eksekutif',
    location: 'Blok Pengurusan, Aras 3',
    floor: 'Aras 3',
    capacity: 16,
    status: 'Tersedia',
    facilities: ['TV', 'Video Conference', 'Whiteboard', 'Mikrofon', 'Speaker', 'Air Conditioner'],
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&auto=format&fit=crop&q=80',
    description: 'Bilik mesyuarat suasana eksklusif dengan meja kayu jati bulat dan kemudahan persidangan pintar untuk rundingan pengurusan kanan.',
    hourlyRate: 120,
    color: '#0d9488', // Teal 600
  },
  {
    id: 'rm-3',
    code: 'BM-M03',
    name: 'Bilik Mesyuarat Melati',
    location: 'Blok Akademik, Aras 2',
    floor: 'Aras 2',
    capacity: 12,
    status: 'Tersedia',
    facilities: ['Projektor', 'Skrin', 'Whiteboard', 'Komputer', 'Air Conditioner'],
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80',
    description: 'Bilik mesyuarat bersaiz sederhana yang selesa untuk perbincangan jabatan, sesi sumbang saran dan semakan projek mingguan.',
    hourlyRate: 80,
    color: '#8b5cf6', // Violet 500
  },
  {
    id: 'rm-4',
    code: 'BM-M04',
    name: 'Bilik Mesyuarat Mawar',
    location: 'Blok Akademik, Aras 2',
    floor: 'Aras 2',
    capacity: 8,
    status: 'Tersedia',
    facilities: ['TV', 'Whiteboard', 'Air Conditioner'],
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&auto=format&fit=crop&q=80',
    description: 'Bilik perbincangan pantas dan mesyuarat satu-dengan-satu atau pasukan kecil sehingga 8 orang.',
    hourlyRate: 60,
    color: '#f59e0b', // Amber 500
  },
  {
    id: 'rm-5',
    code: 'BS-P05',
    name: 'Bilik Seminar Perdana',
    location: 'Blok Konvensyen, Aras Bawah',
    floor: 'Aras Bawah',
    capacity: 60,
    status: 'Tersedia',
    facilities: ['Projektor', 'Skrin', 'Video Conference', 'Mikrofon', 'Speaker', 'Whiteboard', 'Komputer', 'Air Conditioner'],
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80',
    description: 'Dewan seminar auditorium fleksibel dengan susunan tempat duduk modular, dwi projektor laser dan sistem mikrofon tanpa wayar.',
    hourlyRate: 250,
    color: '#10b981', // Emerald 500
  },
  {
    id: 'rm-6',
    code: 'BL-I06',
    name: 'Bilik Latihan IT',
    location: 'Pusat Teknologi, Aras 4',
    floor: 'Aras 4',
    capacity: 24,
    status: 'Penyelenggaraan',
    facilities: ['Projektor', 'Skrin', 'Komputer', 'Whiteboard', 'Air Conditioner'],
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
    description: 'Makmal latihan berteknologi tinggi dengan stesen kerja komputer individu untuk bengkel praktikal dan peningkatan kemahiran.',
    hourlyRate: 180,
    color: '#ec4899', // Pink 500
  }
];

export const ALL_FACILITIES = [
  'Projektor',
  'Skrin',
  'TV',
  'Video Conference',
  'Mikrofon',
  'Speaker',
  'Whiteboard',
  'Komputer',
  'Air Conditioner'
];

export const DEPARTMENTS = [
  'Pengurusan Tertinggi',
  'Teknologi Maklumat',
  'Pentadbiran & Sumber Manusia',
  'Pemasaran & Komunikasi',
  'Kewangan & Akaun',
  'Operasi & Logistik',
  'Penyelidikan & Strategi',
  'Undang-Undang & Integriti'
];

export function getInitialBookings(): Booking[] {
  const today = formatDateISO(new Date());
  const tomorrow = getDateOffsetISO(1);
  const dayAfterTomorrow = getDateOffsetISO(2);
  const nextWeek = getDateOffsetISO(5);
  const yesterday = getDateOffsetISO(-1);
  const twoDaysAgo = getDateOffsetISO(-2);
  const threeDaysAgo = getDateOffsetISO(-3);

  return [
    {
      id: 'bk-1001',
      bookingRef: 'BK2026-001',
      title: 'Mesyuarat Pengurusan Eksekutif',
      purpose: 'Perancangan Strategik Suku Keempat dan Hala Tuju Digital Organisasi',
      roomId: 'rm-1',
      roomName: 'Bilik Mesyuarat Utama',
      userId: 'usr-admin',
      organizerName: 'Ahmad Zulkifli',
      organizerEmail: 'admin@demo.com',
      department: 'Teknologi Maklumat',
      attendeesCount: 22,
      date: today,
      startTime: '10:00',
      endTime: '12:00',
      equipment: ['Projektor', 'Video Conference', 'Mikrofon', 'Whiteboard'],
      notes: 'Sila pastikan sambungan telesidang ke cawangan Pulau Pinang diuji 15 minit awal.',
      status: 'Sedang Berlangsung',
      createdAt: `${threeDaysAgo}T09:00:00`,
      updatedAt: `${threeDaysAgo}T09:00:00`,
      approvedBy: 'Siti Khadijah',
    },
    {
      id: 'bk-1002',
      bookingRef: 'BK2026-002',
      title: 'Sesi Pembentangan Bajet 2027',
      purpose: 'Semakan anggaran kewangan dan peruntukan modal projek',
      roomId: 'rm-2',
      roomName: 'Bilik Mesyuarat Eksekutif',
      userId: 'usr-4',
      organizerName: 'Nurul Huda',
      organizerEmail: 'huda@demo.com',
      department: 'Kewangan & Akaun',
      attendeesCount: 14,
      date: today,
      startTime: '14:30',
      endTime: '16:30',
      equipment: ['TV', 'Video Conference', 'Whiteboard'],
      notes: 'Sediakan kalkulator dan penanda whiteboard tambahan.',
      status: 'Diluluskan',
      createdAt: `${twoDaysAgo}T11:20:00`,
      updatedAt: `${twoDaysAgo}T11:20:00`,
      approvedBy: 'Siti Khadijah',
    },
    {
      id: 'bk-1003',
      bookingRef: 'BK2026-003',
      title: 'Perbincangan Kempen Raya 2027',
      purpose: 'Penyelarasan reka bentuk visual dan jadual pelancaran media sosial',
      roomId: 'rm-3',
      roomName: 'Bilik Mesyuarat Melati',
      userId: 'usr-user',
      organizerName: 'Muhammad Ali',
      organizerEmail: 'user@demo.com',
      department: 'Pemasaran & Komunikasi',
      attendeesCount: 9,
      date: tomorrow,
      startTime: '09:00',
      endTime: '11:00',
      equipment: ['Projektor', 'Skrin', 'Whiteboard', 'Komputer'],
      notes: 'Peserta akan membawa sampel bahan cetak.',
      status: 'Diluluskan',
      createdAt: `${yesterday}T14:15:00`,
      updatedAt: `${yesterday}T14:15:00`,
      approvedBy: 'Siti Khadijah',
    },
    {
      id: 'bk-1004',
      bookingRef: 'BK2026-004',
      title: 'Bengkel Kesedaran Keselamatan Siber',
      purpose: 'Latihan praktikal pencegahan phishing dan kawalan akses kakitangan',
      roomId: 'rm-5',
      roomName: 'Bilik Seminar Perdana',
      userId: 'usr-admin',
      organizerName: 'Ahmad Zulkifli',
      organizerEmail: 'admin@demo.com',
      department: 'Teknologi Maklumat',
      attendeesCount: 45,
      date: tomorrow,
      startTime: '14:00',
      endTime: '17:00',
      equipment: ['Projektor', 'Skrin', 'Video Conference', 'Mikrofon', 'Speaker', 'Komputer'],
      notes: 'Sediakan sambungan Wi-Fi khas tetamu untuk penceramah jemputan.',
      status: 'Diluluskan',
      createdAt: `${yesterday}T16:00:00`,
      updatedAt: `${yesterday}T16:00:00`,
      approvedBy: 'Siti Khadijah',
    },
    {
      id: 'bk-1005',
      bookingRef: 'BK2026-005',
      title: 'Semakan Prestasi Vendor Logistik',
      purpose: 'Audit kualiti perkhidmatan pembekal dan SLA penghantaran',
      roomId: 'rm-4',
      roomName: 'Bilik Mesyuarat Mawar',
      userId: 'usr-5',
      organizerName: 'Razak Osman',
      organizerEmail: 'razak@demo.com',
      department: 'Operasi & Logistik',
      attendeesCount: 6,
      date: dayAfterTomorrow,
      startTime: '10:30',
      endTime: '12:00',
      equipment: ['TV', 'Whiteboard'],
      notes: 'Hanya 2 wakil vendor dari luar yang hadir.',
      status: 'Diluluskan',
      createdAt: `${today}T08:30:00`,
      updatedAt: `${today}T08:30:00`,
      approvedBy: 'Siti Khadijah',
    },
    {
      id: 'bk-1006',
      bookingRef: 'BK2026-006',
      title: 'Sesi Temuduga Bakat Baharu',
      purpose: 'Temuduga panel untuk jawatan Pegawai Pemasaran Digital',
      roomId: 'rm-2',
      roomName: 'Bilik Mesyuarat Eksekutif',
      userId: 'usr-manager',
      organizerName: 'Siti Khadijah',
      organizerEmail: 'manager@demo.com',
      department: 'Pentadbiran & Sumber Manusia',
      attendeesCount: 5,
      date: nextWeek,
      startTime: '09:00',
      endTime: '12:30',
      equipment: ['TV', 'Whiteboard', 'Air Conditioner'],
      notes: 'Pastikan bilik senyap untuk temu duga berstruktur.',
      status: 'Diluluskan',
      createdAt: `${today}T09:15:00`,
      updatedAt: `${today}T09:15:00`,
      approvedBy: 'Siti Khadijah',
    },
    {
      id: 'bk-1007',
      bookingRef: 'BK2026-007',
      title: 'Taklimat Peraturan Dasar Baru 2026',
      purpose: 'Penerangan pindaan garis panduan tatatertib dan integriti',
      roomId: 'rm-1',
      roomName: 'Bilik Mesyuarat Utama',
      userId: 'usr-6',
      organizerName: 'Farhana Rashid',
      organizerEmail: 'farhana@demo.com',
      department: 'Penyelidikan & Strategi',
      attendeesCount: 30,
      date: nextWeek,
      startTime: '14:00',
      endTime: '16:00',
      equipment: ['Projektor', 'Video Conference', 'Mikrofon', 'Speaker'],
      notes: 'Memerlukan kelulusan pengurus bilik.',
      status: 'Menunggu Kelulusan',
      createdAt: `${today}T11:00:00`,
      updatedAt: `${today}T11:00:00`,
    },
    {
      id: 'bk-1008',
      bookingRef: 'BK2026-008',
      title: 'Mesyuarat Sinergi Antara Jabatan',
      purpose: 'Integrasi sistem pengurusan pangkalan data',
      roomId: 'rm-3',
      roomName: 'Bilik Mesyuarat Melati',
      userId: 'usr-user',
      organizerName: 'Muhammad Ali',
      organizerEmail: 'user@demo.com',
      department: 'Pemasaran & Komunikasi',
      attendeesCount: 10,
      date: yesterday,
      startTime: '10:00',
      endTime: '11:30',
      equipment: ['Projektor', 'Whiteboard'],
      status: 'Selesai',
      createdAt: `${threeDaysAgo}T09:00:00`,
      updatedAt: `${yesterday}T12:00:00`,
      approvedBy: 'Siti Khadijah',
    },
    {
      id: 'bk-1009',
      bookingRef: 'BK2026-009',
      title: 'Sesi Taklimat Pembekal Peralatan',
      purpose: 'Penilaian bidaan sebut harga pembekalan perkakasan',
      roomId: 'rm-4',
      roomName: 'Bilik Mesyuarat Mawar',
      userId: 'usr-5',
      organizerName: 'Razak Osman',
      organizerEmail: 'razak@demo.com',
      department: 'Operasi & Logistik',
      attendeesCount: 6,
      date: twoDaysAgo,
      startTime: '15:00',
      endTime: '16:30',
      equipment: ['TV', 'Whiteboard'],
      status: 'Dibatalkan',
      cancellationReason: 'Pembekal menunda tarikh pembentangan ke bulan depan.',
      createdAt: `${threeDaysAgo}T10:00:00`,
      updatedAt: `${twoDaysAgo}T09:30:00`,
      approvedBy: 'Siti Khadijah',
    }
  ];
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'all',
    title: 'Tempahan Berjaya Diluluskan',
    message: 'Tempahan #BK2026-002 untuk Sesi Pembentangan Bajet 2027 telah diluluskan.',
    type: 'success',
    bookingId: 'bk-1002',
    read: false,
    createdAt: `${formatDateISO(new Date())} 09:30 AM`,
  },
  {
    id: 'notif-2',
    userId: 'all',
    title: 'Permohonan Tempahan Baharu',
    message: 'Farhana Rashid telah memohon tempahan Bilik Mesyuarat Utama untuk Taklimat Peraturan.',
    type: 'info',
    bookingId: 'bk-1007',
    read: false,
    createdAt: `${formatDateISO(new Date())} 11:00 AM`,
  },
  {
    id: 'notif-3',
    userId: 'all',
    title: 'Peringatan Mesyuarat 30 Minit',
    message: 'Mesyuarat Pengurusan Eksekutif di Bilik Mesyuarat Utama sedang berlangsung.',
    type: 'warning',
    bookingId: 'bk-1001',
    read: true,
    createdAt: `${formatDateISO(new Date())} 09:30 AM`,
  },
  {
    id: 'notif-4',
    userId: 'all',
    title: 'Tempahan Dibatalkan',
    message: 'Tempahan #BK2026-009 oleh Razak Osman telah dibatalkan.',
    type: 'error',
    bookingId: 'bk-1009',
    read: true,
    createdAt: `${getDateOffsetISO(-2)} 09:30 AM`,
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: `${formatDateISO(new Date())} 11:00:15`,
    userId: 'usr-6',
    userName: 'Farhana Rashid',
    userRole: 'Pengguna',
    action: 'Membuat Permohonan Tempahan',
    module: 'Tempahan',
    details: 'Permohonan tempahan #BK2026-007 bagi Bilik Mesyuarat Utama (30 peserta)',
    ip: '192.168.1.42',
  },
  {
    id: 'log-2',
    timestamp: `${formatDateISO(new Date())} 09:30:00`,
    userId: 'usr-manager',
    userName: 'Siti Khadijah',
    userRole: 'Pengurus',
    action: 'Meluluskan Tempahan',
    module: 'Tempahan',
    details: 'Meluluskan tempahan #BK2026-002 untuk Nurul Huda (Bilik Mesyuarat Eksekutif)',
    ip: '192.168.1.15',
  },
  {
    id: 'log-3',
    timestamp: `${getDateOffsetISO(-1)} 16:10:00`,
    userId: 'usr-admin',
    userName: 'Ahmad Zulkifli',
    userRole: 'Admin',
    action: 'Mengemaskini Status Bilik',
    module: 'Bilik',
    details: 'Menukar status Bilik Latihan IT kepada Penyelenggaraan berjadual',
    ip: '192.168.1.10',
  },
  {
    id: 'log-4',
    timestamp: `${getDateOffsetISO(-2)} 09:30:45`,
    userId: 'usr-5',
    userName: 'Razak Osman',
    userRole: 'Pengurus',
    action: 'Membatalkan Tempahan',
    module: 'Tempahan',
    details: 'Membatalkan tempahan #BK2026-009 kerana pembekal menunda tarikh',
    ip: '192.168.1.28',
  }
];

export class StorageService {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  }

  static getSettings(): OrganizationSettings {
    return this.getItem<OrganizationSettings>('settings', INITIAL_SETTINGS);
  }

  static saveSettings(settings: OrganizationSettings): void {
    this.setItem('settings', settings);
  }

  static getUsers(): User[] {
    return this.getItem<User[]>('users', INITIAL_USERS);
  }

  static saveUsers(users: User[]): void {
    this.setItem('users', users);
  }

  static getRooms(): Room[] {
    return this.getItem<Room[]>('rooms', INITIAL_ROOMS);
  }

  static saveRooms(rooms: Room[]): void {
    this.setItem('rooms', rooms);
  }

  static getBookings(): Booking[] {
    return this.getItem<Booking[]>('bookings', getInitialBookings());
  }

  static saveBookings(bookings: Booking[]): void {
    this.setItem('bookings', bookings);
  }

  static getNotifications(): NotificationItem[] {
    return this.getItem<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
  }

  static saveNotifications(notifications: NotificationItem[]): void {
    this.setItem('notifications', notifications);
  }

  static getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
  }

  static saveAuditLogs(logs: AuditLog[]): void {
    this.setItem('audit_logs', logs);
  }

  static resetAllData(): void {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'settings');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'users');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'rooms');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'bookings');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'notifications');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'audit_logs');
  }

  /**
   * Conflict Detection Engine
   * Validates date, startTime, endTime against active bookings for a room.
   */
  static checkConflict(
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): ConflictCheckResult {
    const bookings = this.getBookings();
    const rooms = this.getRooms();

    // Check operating hours validation
    const settings = this.getSettings();
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    const opStartMin = timeToMinutes(settings.operatingStartTime);
    const opEndMin = timeToMinutes(settings.operatingEndTime);

    if (startMin < opStartMin || endMin > opEndMin) {
      return {
        hasConflict: true,
        message: `Masa tempahan di luar waktu operasi pejabat (${settings.operatingStartTime} – ${settings.operatingEndTime}).`,
      };
    }

    if (endMin <= startMin) {
      return {
        hasConflict: true,
        message: 'Masa tamat mestilah selepas masa mula.',
      };
    }

    // Check day of week against operating days
    const bookingDate = new Date(date + 'T00:00:00');
    const dayNames = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
    const dayOfWeek = dayNames[bookingDate.getDay()];
    if (!settings.operatingDays.includes(dayOfWeek)) {
      return {
        hasConflict: true,
        message: `Organisasi tidak beroperasi pada hari ${dayOfWeek}. Hari operasi: ${settings.operatingDays.join(', ')}.`,
      };
    }

    // Check room status
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) {
      return {
        hasConflict: true,
        message: 'Bilik mesyuarat tidak ditemui dalam sistem.',
      };
    }

    if (targetRoom.status === 'Penyelenggaraan') {
      return {
        hasConflict: true,
        message: `Bilik ${targetRoom.name} sedang dalam kerja-kerja penyelenggaraan berjadual.`,
      };
    }

    if (targetRoom.status === 'Tidak Aktif') {
      return {
        hasConflict: true,
        message: `Bilik ${targetRoom.name} kini tidak aktif untuk tempahan.`,
      };
    }

    // Find conflicting bookings on that room and date
    // Ignore cancelled bookings and current editing booking
    const conflictingBooking = bookings.find(b => {
      if (b.id === excludeBookingId) return false;
      if (b.roomId !== roomId) return false;
      if (b.date !== date) return false;
      if (b.status === 'Dibatalkan') return false;

      return doTimesOverlap(startTime, endTime, b.startTime, b.endTime);
    });

    if (conflictingBooking) {
      // Find other rooms available at the exact same slot
      const otherRoomsAvailable = rooms.filter(r => {
        if (r.id === roomId) return false;
        if (r.status !== 'Tersedia') return false;

        const hasOverlap = bookings.some(b => {
          if (b.id === excludeBookingId) return false;
          if (b.roomId !== r.id) return false;
          if (b.date !== date) return false;
          if (b.status === 'Dibatalkan') return false;
          return doTimesOverlap(startTime, endTime, b.startTime, b.endTime);
        });

        return !hasOverlap;
      });

      return {
        hasConflict: true,
        conflictingBooking,
        message: `Maaf, bilik ${targetRoom.name} telah ditempah pada waktu tersebut.`,
        availableRoomsAlternative: otherRoomsAvailable,
      };
    }

    return {
      hasConflict: false,
    };
  }

  /**
   * Find available rooms for date and time range with optional min capacity
   */
  static getAvailableRooms(
    date: string,
    startTime: string,
    endTime: string,
    minCapacity: number = 1
  ): { available: Room[]; booked: { room: Room; booking: Booking }[] } {
    const rooms = this.getRooms();
    const bookings = this.getBookings();

    const available: Room[] = [];
    const booked: { room: Room; booking: Booking }[] = [];

    rooms.forEach(room => {
      if (room.status !== 'Tersedia') return;
      if (room.capacity < minCapacity) return;

      const conflict = bookings.find(b => {
        if (b.roomId !== room.id) return false;
        if (b.date !== date) return false;
        if (b.status === 'Dibatalkan') return false;
        return doTimesOverlap(startTime, endTime, b.startTime, b.endTime);
      });

      if (conflict) {
        booked.push({ room, booking: conflict });
      } else {
        available.push(room);
      }
    });

    return { available, booked };
  }
}
