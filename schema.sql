-- Schema Definition for sim-ppds-db

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  sub_role TEXT,
  jabatan_id INTEGER,
  is_active INTEGER DEFAULT 1,
  last_login TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS jabatan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT UNIQUE NOT NULL,
  akses_level TEXT NOT NULL,
  deskripsi TEXT
);

CREATE TABLE IF NOT EXISTS spp_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT NOT NULL,
    kelas_name TEXT NOT NULL,
    madrasah TEXT NOT NULL,
    period_name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    entry_month INTEGER,
    is_new_student BOOLEAN DEFAULT 0,
    description TEXT
  );

CREATE TABLE IF NOT EXISTS spp_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  santri_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  period TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  status TEXT NOT NULL,
  paid_at TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS santri (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nisn TEXT,
  nik TEXT,
  name TEXT NOT NULL,
  asrama TEXT,
  status TEXT,
  madrasah TEXT,
  kelas TEXT,
  street TEXT,
  rt_rw TEXT,
  village TEXT,
  district TEXT,
  city TEXT,
  province TEXT,
  wali_name TEXT,
  wali_wa TEXT,
  wali_phone TEXT,
  tahun_masuk TEXT,
  tahun_lulus TEXT,
  jabatan TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ustadz (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nik TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  jabatan TEXT,
  sub_jabatan TEXT,
  status TEXT,
  gender TEXT,
  kamar TEXT,
  jabatan_tambahan TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Note: Kamar table is already in data-kamar.sql but let's ensure it's here too just in case
CREATE TABLE IF NOT EXISTS Kamar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    blok TEXT,
    lantai INTEGER,
    kapasitas INTEGER,
    terisi INTEGER DEFAULT 0,
    kategori TEXT,
    penasehat_id INTEGER
);

-- Modul Keamanan Aset
CREATE TABLE IF NOT EXISTS keamanan_kendaraan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    santri_id INTEGER NOT NULL,
    jenis TEXT NOT NULL, -- Sepeda, Motor
    merk TEXT NOT NULL,
    plat_nomor TEXT, -- Hanya untuk Motor
    warna TEXT NOT NULL,
    tanggal_registrasi TEXT DEFAULT CURRENT_TIMESTAMP,
    petugas TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS keamanan_elektronik (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    santri_id INTEGER NOT NULL,
    jenis TEXT NOT NULL, -- Laptop, HP, Flashdisk, Lainnya
    detail_jenis TEXT, -- Diisi jika jenis=Lainnya
    kelengkapan TEXT,
    merk TEXT NOT NULL,
    warna TEXT NOT NULL,
    tanggal_registrasi TEXT DEFAULT CURRENT_TIMESTAMP,
    petugas TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS keamanan_kompor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_pendaftar TEXT NOT NULL,
    kamar TEXT NOT NULL,
    merk TEXT NOT NULL,
    jenis_tabung TEXT NOT NULL, -- Satu Tungku, Dua Tungku
    warna TEXT NOT NULL,
    penempatan TEXT NOT NULL,
    tanggal_registrasi TEXT DEFAULT CURRENT_TIMESTAMP,
    tanggal_kadaluarsa TEXT NOT NULL, -- Bulan Syawal
    petugas TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS keamanan_transaksi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL, -- Kendaraan, Elektronik
    item_id INTEGER NOT NULL,
    waktu_pengambilan TEXT,
    waktu_pengembalian TEXT,
    petugas_pengambil TEXT,
    petugas_pengembali TEXT,
    status TEXT NOT NULL -- Dipinjam, Dikembalikan
);

-- Modul Jam'iyyah
CREATE TABLE IF NOT EXISTS jamiyyah_grup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_grup TEXT NOT NULL UNIQUE,
    deskripsi TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jamiyyah_alat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jenis_kepemilikan TEXT NOT NULL, -- Pribadi, Jam'iyyah
    pemilik_id INTEGER NOT NULL, -- id santri ATAU id grup jamiyyah
    nama_alat TEXT NOT NULL,
    jumlah INTEGER NOT NULL DEFAULT 1,
    tanggal_registrasi TEXT DEFAULT CURRENT_TIMESTAMP,
    tanggal_kadaluarsa TEXT NOT NULL -- Bulan Syawal
);
-- ==========================================
-- MISSING TABLES FOR KEAMANAN & CLEARANCE
-- ==========================================

CREATE TABLE IF NOT EXISTS clearance_boyong (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  santri_id INTEGER NOT NULL,
  status_keuangan TEXT DEFAULT 'Clean',
  status_keamanan TEXT DEFAULT 'Clean',
  catatan_keuangan TEXT,
  catatan_keamanan TEXT,
  acc_mustahiq TEXT DEFAULT 'Pending',
  status_akhir TEXT DEFAULT 'Diajukan',
  catatan_akhir TEXT,
  approved_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS perizinan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  santri_id INTEGER NOT NULL,
  keperluan TEXT NOT NULL,
  tgl_mulai TEXT NOT NULL,
  tgl_kembali TEXT NOT NULL,
  status TEXT DEFAULT 'Diajukan',
  disetujui_oleh TEXT,
  scan_keluar_at TEXT,
  scan_kembali_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skkb (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  santri_id INTEGER NOT NULL,
  keperluan TEXT NOT NULL,
  catatan TEXT,
  petugas TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS santri_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  santri_id INTEGER NOT NULL,
  jenis_asset TEXT NOT NULL,
  merk_tipe TEXT NOT NULL,
  no_registrasi TEXT,
  barcode_qr TEXT,
  status TEXT DEFAULT 'Aktif',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pelanggaran (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  santri_id INTEGER NOT NULL,
  jenis TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  point INTEGER DEFAULT 0,
  tindakan_diambil TEXT,
  status TEXT DEFAULT 'Penyelidikan',
  dilaporkan_oleh TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
);

-- ==========================================
-- MISSING TABLES FOR JAMIYYAH
-- ==========================================

CREATE TABLE IF NOT EXISTS jamiyyah_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_kegiatan TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  lokasi TEXT,
  deskripsi TEXT,
  penanggung_jawab TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jamiyyah_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_aset TEXT NOT NULL,
  jumlah INTEGER DEFAULT 0,
  kondisi TEXT,
  lokasi_penyimpanan TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
DROP TABLE IF EXISTS jabatan;
CREATE TABLE IF NOT EXISTS jabatan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT UNIQUE NOT NULL,
    akses_level TEXT NOT NULL,
    deskripsi TEXT
);

INSERT INTO jabatan (id, nama, akses_level, deskripsi) VALUES 
(1, 'Mudir', 'ROOT', 'Pimpinan Pesantren'),
(2, 'Sekretaris', 'SEKRETARIAT', 'Admin Sekretariat'),
(3, 'Bendahara', 'VIEW_ALL', 'Bendahara Pusat'),
(4, 'Keamanan', 'SEKRETARIAT', 'Admin Keamanan'),
(5, 'PLP', 'SEKRETARIAT', 'Listrik & Air'),
(6, 'KBR', 'SEKRETARIAT', 'Kebersihan'),
(7, 'Media', 'SEKRETARIAT', 'Media & Publikasi'),
(8, 'Takmir', 'SEKRETARIAT', 'Takmir Masjid'),
(9, 'Jam''iyyah', 'SEKRETARIAT', 'Admin Jam''iyyah'),
(10, 'Pembangunan', 'SEKRETARIAT', 'Pembangunan'),
(11, 'Anggota Keamanan', 'STAFF', 'Anggota Keamanan'),
(12, 'Anggota PLP', 'STAFF', 'Anggota PLP'),
(13, 'Anggota KBR', 'STAFF', 'Anggota KBR'),
(14, 'Keuangan', 'KEUANGAN', 'Seksi Keuangan / Kasir / POS');
