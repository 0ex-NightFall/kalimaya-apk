import { createContext, useContext, useEffect, useState } from 'react';

const LocaleCtx = createContext({ locale: 'id', setLocale: () => {} });

export function useLocale() { return useContext(LocaleCtx); }

export const T = {
  // Nav
  dashboard: { id: 'Dashboard', en: 'Dashboard' },
  announcements: { id: 'Pengumuman', en: 'Announcements' },
  projects: { id: 'Proyek', en: 'Projects' },
  files: { id: 'File', en: 'Files' },
  attendance: { id: 'Absensi', en: 'Attendance' },
  employees: { id: 'Karyawan', en: 'Employees' },
  auditLog: { id: 'Audit Log', en: 'Audit Log' },
  logout: { id: 'Keluar', en: 'Logout' },
  // Common
  save: { id: 'Simpan', en: 'Save' },
  cancel: { id: 'Batal', en: 'Cancel' },
  delete: { id: 'Hapus', en: 'Delete' },
  add: { id: 'Tambah', en: 'Add' },
  search: { id: 'Cari...', en: 'Search...' },
  loading: { id: 'Memuat...', en: 'Loading...' },
  noData: { id: 'Belum ada data', en: 'No data yet' },
  // Attendance
  checkIn: { id: 'Absen Masuk', en: 'Check In' },
  checkOut: { id: 'Absen Pulang', en: 'Check Out' },
  alreadyIn: { id: 'Sudah Masuk', en: 'Already Checked In' },
  alreadyOut: { id: 'Sudah Pulang', en: 'Already Checked Out' },
  todayAtt: { id: 'Hari Ini', en: 'Today' },
  history: { id: 'Riwayat 30 Hari', en: '30-Day History' },
  workHours: { id: 'Jam kerja: 09:00 – 17:00 WIB', en: 'Work hours: 09:00 – 17:00 WIB' },
  onTime: { id: 'Tepat Waktu', en: 'On Time' },
  late: { id: 'Terlambat', en: 'Late' },
  early: { id: 'Lebih Awal', en: 'Early' },
  exportCsv: { id: 'Export CSV', en: 'Export CSV' },
  duration: { id: 'Durasi', en: 'Duration' },
  status: { id: 'Status', en: 'Status' },
  // Projects
  newProject: { id: 'Proyek Baru', en: 'New Project' },
  projectName: { id: 'Nama Proyek', en: 'Project Name' },
  projectCode: { id: 'Kode', en: 'Code' },
  progress: { id: 'Progress', en: 'Progress' },
  description: { id: 'Deskripsi', en: 'Description' },
  // Employees
  newEmployee: { id: '+ Tambah Karyawan', en: '+ Add Employee' },
  fullName: { id: 'Nama Lengkap', en: 'Full Name' },
  username: { id: 'Username', en: 'Username' },
  email: { id: 'Email', en: 'Email' },
  password: { id: 'Password', en: 'Password' },
  role: { id: 'Role', en: 'Role' },
  division: { id: 'Divisi', en: 'Division' },
  jobTitle: { id: 'Jabatan', en: 'Job Title' },
  active: { id: 'Aktif', en: 'Active' },
  inactive: { id: 'Nonaktif', en: 'Inactive' },
  // Files
  uploadFile: { id: '+ Upload File', en: '+ Upload File' },
  uploading: { id: 'Uploading...', en: 'Uploading...' },
  uploadSuccess: { id: 'Upload berhasil', en: 'Upload successful' },
  uploadFail: { id: 'Upload gagal', en: 'Upload failed' },
  download: { id: 'Download', en: 'Download' },
  // Announcements
  newAnnouncement: { id: '+ Buat Pengumuman', en: '+ New Announcement' },
  sendAll: { id: '📤 Kirim ke Semua Karyawan', en: '📤 Send to All Employees' },
  title: { id: 'Judul', en: 'Title' },
  message: { id: 'Isi Pesan', en: 'Message' },
  priority: { id: 'Prioritas', en: 'Priority' },
  important: { id: '🔴 PENTING', en: '🔴 IMPORTANT' },
  noAnnouncements: { id: 'Belum ada pengumuman', en: 'No announcements yet' },
  // Dashboard
  welcomeBack: { id: 'Selamat datang', en: 'Welcome back' },
  totalEmployees: { id: 'Total Karyawan', en: 'Total Employees' },
  activeProjects: { id: 'Proyek Aktif', en: 'Active Projects' },
  presentToday: { id: 'Hadir Hari Ini', en: 'Present Today' },
  totalFiles: { id: 'Total File', en: 'Total Files' },
};

export function t(key, locale) {
  return T[key]?.[locale] ?? T[key]?.id ?? key;
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState('id');

  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved === 'en' || saved === 'id') setLocaleState(saved);
    const handler = (e) => setLocaleState(e.detail);
    window.addEventListener('localechange', handler);
    return () => window.removeEventListener('localechange', handler);
  }, []);

  function setLocale(l) {
    setLocaleState(l);
    localStorage.setItem('locale', l);
    window.dispatchEvent(new CustomEvent('localechange', { detail: l }));
  }

  return (
    <LocaleCtx.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleCtx.Provider>
  );
}
