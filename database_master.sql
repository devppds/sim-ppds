-- File: migrations/0001_initial_schema.sql
-- Migration: 0001_initial_schema.sql
-- SIM-PPDS Database Schema for Cloudflare D1

-- Tabel Santri
CREATE TABLE IF NOT EXISTS santri (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nisn        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  birth_date  TEXT,
  birth_place TEXT,
  gender      TEXT CHECK(gender IN ('L', 'P')) DEFAULT 'L',
  asal        TEXT,
  wali_name   TEXT,
  wali_phone  TEXT,
  kelas       TEXT NOT NULL,
  asrama      TEXT,
  photo_url   TEXT,
  status      TEXT CHECK(status IN ('Aktif', 'Tunggakan', 'Baru', 'Alumni', 'Keluar')) DEFAULT 'Baru',
  tahun_masuk TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- Tabel Ustadz/Pengajar
CREATE TABLE IF NOT EXISTS ustadz (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nip        TEXT UNIQUE,
  name       TEXT NOT NULL,
  gender     TEXT CHECK(gender IN ('L', 'P')) DEFAULT 'L',
  phone      TEXT,
  email      TEXT,
  alamat     TEXT,
  jabatan    TEXT,
  bidang     TEXT,
  photo_url  TEXT,
  status     TEXT CHECK(status IN ('Aktif', 'Tidak Aktif')) DEFAULT 'Aktif',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Tabel Pembayaran SPP
CREATE TABLE IF NOT EXISTS spp_payments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  santri_id  INTEGER NOT NULL REFERENCES santri(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL,
  month      TEXT NOT NULL, -- format: YYYY-MM
  status     TEXT CHECK(status IN ('Lunas', 'Tunggakan', 'Cicilan')) DEFAULT 'Tunggakan',
  paid_at    TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Tabel Asrama
CREATE TABLE IF NOT EXISTS asrama (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  capacity   INTEGER DEFAULT 0,
  pengurus   TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Tabel Jadwal Kegiatan
CREATE TABLE IF NOT EXISTS jadwal (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT,
  date        TEXT NOT NULL,
  time_start  TEXT,
  time_end    TEXT,
  location    TEXT,
  type        TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- Kurikulum
CREATE TABLE IF NOT EXISTS kurikulum (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  kelas      TEXT NOT NULL,
  ustadz_id  INTEGER REFERENCES ustadz(id),
  schedule   TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_santri_status ON santri(status);
CREATE INDEX IF NOT EXISTS idx_santri_kelas ON santri(kelas);
CREATE INDEX IF NOT EXISTS idx_spp_santri ON spp_payments(santri_id);
CREATE INDEX IF NOT EXISTS idx_spp_month ON spp_payments(month);
CREATE INDEX IF NOT EXISTS idx_spp_status ON spp_payments(status);


-- File: migrations/0002_seed_data.sql
-- Migration: 0002_seed_data.sql
-- Mengisi data dummy untuk pengembangan lokal

-- Seed Data Santri
INSERT INTO santri (nisn, name, kelas, asrama, asal, status) VALUES 
('0012345678', 'Muhammad Rizki Pratama', 'VII-A', 'Al-Ghazali', 'Jakarta Selatan', 'Aktif'),
('0012345679', 'Aisyah Putri Ramadhani', 'VIII-B', 'Khadijah', 'Bandung', 'Aktif'),
('0012345680', 'Ahmad Fauzi Hidayat', 'IX-A', 'Al-Farabi', 'Surabaya', 'Tunggakan'),
('0012345681', 'Fatimah Az-Zahra', 'VII-C', 'Khadijah', 'Yogyakarta', 'Baru'),
('0012345682', 'Umar Abdullah Hakim', 'VIII-A', 'Al-Ghazali', 'Semarang', 'Aktif'),
('0012345683', 'Zahra Nur Fadhilah', 'IX-B', 'Khadijah', 'Malang', 'Aktif'),
('0012345684', 'Zaidan Al-Fatih', 'VII-A', 'Al-Ghazali', 'Bekasi', 'Baru'),
('0012345685', 'Hafizah Khairunnisa', 'VIII-C', 'Khadijah', 'Tangerang', 'Aktif');

-- Seed Data Pengurus
INSERT INTO ustadz (nip, name, jabatan, bidang, status) VALUES 
('19850101001', 'Ustadz Ahmad Fauzi', 'Sekretariat', 'Administrasi', 'Aktif'),
('19870512002', 'Ustadzah Maryam', 'Bendahara', 'Keuangan', 'Aktif'),
('19820315003', 'Ustadz Yusuf Habibi', 'Kepala Asrama', 'Kesiswaan', 'Aktif');

-- Seed Data SPP (Simulasi)
INSERT INTO spp_payments (santri_id, amount, month, status) VALUES 
(1, 500000, '2024-03', 'Lunas'),
(2, 500000, '2024-03', 'Lunas'),
(3, 500000, '2024-03', 'Tunggakan');


-- File: migrations/0003_finance_system.sql
-- Migration: 0003_finance_system.sql
-- Menambahkan sistem pencatatan keuangan yang lebih fleksibel

CREATE TABLE IF NOT EXISTS transactions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  type        TEXT CHECK(type IN ('Pemasukan', 'Pengeluaran')) NOT NULL,
  category    TEXT NOT NULL, -- Contoh: 'SPP', 'Donasi', 'Gaji Pengurus', 'Operasional', 'Listrik'
  amount      INTEGER NOT NULL,
  description TEXT,
  date        TEXT DEFAULT (date('now')),
  created_at  TEXT DEFAULT (datetime('now'))
);

-- Trigger otomatis: Setiap ada SPP Lunas, catat ke tabel transaksi (Opsional - untuk sekarang kita seed manual)
CREATE INDEX IF NOT EXISTS idx_trans_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_trans_date ON transactions(date);


-- File: migrations/0004_master_seed.sql
-- Migration: 0004_master_seed.sql
-- Data dummy komprehensif untuk Santri, Pengurus, dan Keuangan interconnected

-- 1. Tambah Data Santri (Total jadi banyak)
INSERT INTO santri (nisn, name, kelas, asrama, asal, status) VALUES 
('0011223344', 'Zaki Al-Faridzi', 'VIII-A', 'DS A 05', 'Surabaya', 'Aktif'),
('0011223345', 'Budi Santoso', 'IX-B', 'DS B 02', 'Malang', 'Aktif'),
('0011223346', 'Siti Aminah', 'VII-C', 'DS C 10', 'Bandung', 'Aktif'),
('0011223347', 'Hendrawan Kusuma', 'VIII-B', 'DS A 12', 'Semarang', 'Tunggakan'),
('0011223348', 'Dewi Lestari', 'IX-A', 'DS C 01', 'Jakarta', 'Aktif'),
('0011223349', 'Fajar Ramadhan', 'VII-A', 'DS B 05', 'Yogyakarta', 'Aktif'),
('0011223350', 'Gita Permata', 'VIII-C', 'DS C 15', 'Bogor', 'Baru');

-- 2. Tambah Data Pengurus (Ustadz)
INSERT INTO ustadz (nip, name, jabatan, bidang, status) VALUES 
('1990011001', 'Ustadz Mansur AL-Khatib', 'Ketua Pengurus', 'Kepemimpinan', 'Aktif'),
('19920505002', 'Ustadzah Siti Zubaidah', 'Kepala Tata Usaha', 'Administrasi', 'Aktif'),
('19950320003', 'Ustadz Lukman Hakim', 'Bendahara Utama', 'Keuangan', 'Aktif'),
('19880712004', 'Ustadz Hanif', 'Kepala Keamanan', 'Kamtib', 'Aktif'),
('19931225005', 'Ustadzah Fatimah', 'Pengasuh Putri', 'Kesiswaan', 'Aktif');

-- 3. Data SPP (Januari - Maret 2024)
-- Anggap santri_id 1-8 adalah yang ada sebelumnya, 9-15 adalah yang baru
INSERT INTO spp_payments (santri_id, amount, month, status, paid_at) VALUES 
(1, 450000, '2024-01', 'Lunas', '2024-01-05'),
(1, 450000, '2024-02', 'Lunas', '2024-02-07'),
(2, 450000, '2024-01', 'Lunas', '2024-01-04'),
(2, 450000, '2024-02', 'Lunas', '2024-02-06'),
(4, 450000, '2024-01', 'Lunas', '2024-01-10'),
(9, 450000, '2024-01', 'Lunas', '2024-01-02'),
(10, 450000, '2024-01', 'Lunas', '2024-01-03'),
(11, 450000, '2024-01', 'Lunas', '2024-01-04');

-- 4. Data Keuangan (Pemasukan dari SPP & Pengeluaran Operasional)
INSERT INTO transactions (type, category, amount, description, date) VALUES 
('Pemasukan', 'SPP', 3600000, 'Total SPP Terkumpul Januari', '2024-01-31'),
('Pemasukan', 'SPP', 1800000, 'Total SPP Terkumpul Februari', '2024-02-28'),
('Pemasukan', 'Donasi', 5000000, 'Infaq Pembangunan Masjid', '2024-02-15'),
('Pengeluaran', 'Gaji Pengurus', 4500000, 'Gaji Bulanan 3 Ustadz', '2024-01-30'),
('Pengeluaran', 'Listrik', 850000, 'Biaya Listrik Januari', '2024-02-05'),
('Pengeluaran', 'Konsumsi', 2500000, 'Belanja Dapur Pondok', '2024-02-01'),
('Pengeluaran', 'Operasional', 1200000, 'Pemeliharaan Gedung', '2024-02-10');


-- File: migrations/0005_extra_dummy_data.sql
-- Update existing santri with more complete dummy data
UPDATE santri SET 
  nik = '350' || printf('%013d', id), 
  wali_name = 'Abdullah ' || (id % 5 + 1), 
  wali_wa = '0812' || printf('%08d', id), 
  madrasah = 'MHM'
WHERE id IN (1, 2, 3, 4, 5, 9);

UPDATE santri SET 
  nik = '360' || printf('%013d', id), 
  wali_name = 'Siti ' || (id % 5 + 1), 
  wali_wa = '0813' || printf('%08d', id), 
  madrasah = 'MIU'
WHERE id NOT IN (1, 2, 3, 4, 5, 9);

-- Update ustadz with NIK
UPDATE ustadz SET nik = '350' || printf('%013d', id + 100);


-- File: migrations/0006_enhance_santri_address.sql
-- Migration: 0006_enhance_santri_address.sql
-- Memperluas informasi alamat santri untuk pendataan yang lebih akurat

-- 1. Tambahkan kolom alamat detail ke tabel santri
ALTER TABLE santri ADD COLUMN street TEXT;
ALTER TABLE santri ADD COLUMN rt_rw TEXT;
ALTER TABLE santri ADD COLUMN province TEXT;
ALTER TABLE santri ADD COLUMN city TEXT;
ALTER TABLE santri ADD COLUMN district TEXT;
ALTER TABLE santri ADD COLUMN village TEXT;
ALTER TABLE santri ADD COLUMN postal_code TEXT;

-- 2. Tambahkan NIK kependudukan (jika belum ada di schema awal, 0001 hanya nisn)
-- Catatan: di AddSantriModal ada 'nik', tapi di schema 0001 tidak ada. 
-- Mari kita tambahkan jika belum ada.
ALTER TABLE santri ADD COLUMN nik TEXT;
ALTER TABLE santri ADD COLUMN wali_wa TEXT;
ALTER TABLE santri ADD COLUMN madrasah TEXT;


-- File: migrations/0007_create_arsip_table.sql
-- Migration: 0007_create_arsip_table.sql
-- Create table for file archives

CREATE TABLE IF NOT EXISTS arsip (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  type        TEXT,
  size        TEXT,
  category    TEXT DEFAULT 'Umum',
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_arsip_category ON arsip(category);


-- File: migrations/0008_enhance_arsip_table.sql
-- Migration: 0008_enhance_arsip_table.sql
-- Enhance arsip table with more details

ALTER TABLE arsip ADD COLUMN doc_date TEXT;
ALTER TABLE arsip ADD COLUMN doc_number TEXT;
ALTER TABLE arsip ADD COLUMN flow_type TEXT CHECK(flow_type IN ('Masuk', 'Keluar')) DEFAULT 'Masuk';
ALTER TABLE arsip ADD COLUMN sender_receiver TEXT;

-- Index for better searching
CREATE INDEX IF NOT EXISTS idx_arsip_number ON arsip(doc_number);
CREATE INDEX IF NOT EXISTS idx_arsip_flow ON arsip(flow_type);


-- File: migrations/0009_enhance_ustadz_table.sql
-- Migration: 0009_enhance_ustadz_table.sql
-- Add jabatan_tambahan and kamar to ustadz table

ALTER TABLE ustadz ADD COLUMN jabatan_tambahan TEXT;
ALTER TABLE ustadz ADD COLUMN kamar TEXT;

-- Index for kamar searching
CREATE INDEX IF NOT EXISTS idx_ustadz_kamar ON ustadz(kamar);


-- File: migrations/0010_sync_schema_fields.sql
-- Migration: 0010_sync_schema_fields.sql

-- For Santri Table: Add missing fields
ALTER TABLE santri ADD COLUMN nik TEXT;
ALTER TABLE santri ADD COLUMN madrasah TEXT;
ALTER TABLE santri ADD COLUMN street TEXT;
ALTER TABLE santri ADD COLUMN rt_rw TEXT;
ALTER TABLE santri ADD COLUMN province TEXT;
ALTER TABLE santri ADD COLUMN city TEXT;
ALTER TABLE santri ADD COLUMN district TEXT;
ALTER TABLE santri ADD COLUMN village TEXT;
ALTER TABLE santri ADD COLUMN postal_code TEXT;
ALTER TABLE santri ADD COLUMN wali_wa TEXT;

-- For Ustadz Table: Rename nip to nik (using a trick since SQLite ALTER RENAME is limited)
-- Actually, let's just add nik and copy data, or just use nip. 
-- For safety, let's just add nik and use it in the future, then maybe drop nip if empty.
ALTER TABLE ustadz ADD COLUMN nik TEXT;

-- Migration of data if any nip exists
UPDATE ustadz SET nik = nip WHERE nip IS NOT NULL AND nik IS NULL;


-- File: migrations/0011_add_alumni_fields.sql
-- Migration: 0011_add_alumni_fields.sql

-- For Santri: Year they became alumni
ALTER TABLE santri ADD COLUMN tahun_lulus TEXT;

-- For Ustadz: Year they became alumni/inactive and graduated address system
ALTER TABLE ustadz ADD COLUMN tahun_purna TEXT;
ALTER TABLE ustadz ADD COLUMN street TEXT;
ALTER TABLE ustadz ADD COLUMN rt_rw TEXT;
ALTER TABLE ustadz ADD COLUMN province TEXT;
ALTER TABLE ustadz ADD COLUMN city TEXT;
ALTER TABLE ustadz ADD COLUMN district TEXT;
ALTER TABLE ustadz ADD COLUMN village TEXT;
ALTER TABLE ustadz ADD COLUMN postal_code TEXT;


-- File: migrations/0012_add_proof_url_to_transactions.sql
-- Migration: 0012_add_proof_url_to_transactions.sql
-- Menambahkan kolom bukti transaksi

ALTER TABLE transactions ADD COLUMN proof_url TEXT;


-- File: migrations/0013_spp_configuration.sql
DROP TABLE IF EXISTS spp_config;
CREATE TABLE IF NOT EXISTS spp_config (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  status      TEXT NOT NULL, -- Aktif, Baru, dll
  kelas_name  TEXT NOT NULL, -- Bisa nama spesifik atau kategori (Contoh: 'Ibtida', 'Tsanawiyyah')
  amount      INTEGER NOT NULL,
  description TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- Seed awal konfigurasi SPP (Asumsi tarif)
INSERT INTO spp_config (status, kelas_name, amount, description) VALUES 
('Aktif', 'Ibtida', 250000, 'Tarif SPP standar kelas Ibtida'),
('Aktif', 'Tsanawiyyah', 350000, 'Tarif SPP standar kelas Tsanawiyyah'),
('Aktif', 'Aliyyah', 450000, 'Tarif SPP standar kelas Aliyyah'),
('Aktif', 'Ma''had Aly', 500000, 'Tarif SPP standar kelas Ma''had Aly'),
('Baru', 'Ibtida', 300000, 'Tarif SPP santri baru kelas Ibtida'),
('Baru', 'Tsanawiyyah', 400000, 'Tarif SPP santri baru kelas Tsanawiyyah'),
('Baru', 'Aliyyah', 500000, 'Tarif SPP santri baru kelas Aliyyah');

-- Tambahkan index
CREATE INDEX IF NOT EXISTS idx_spp_config_status ON spp_config(status);
CREATE INDEX IF NOT EXISTS idx_spp_config_kelas ON spp_config(kelas_name);


-- File: migrations/0014_cleanup_and_update_status.sql
-- Migration: 0014_cleanup_and_update_status.sql
-- 1. Hapus tabel yang tidak terpakai
DROP TABLE IF EXISTS kurikulum;
DROP TABLE IF EXISTS jadwal;

-- 2. Update status santri (Re-create table untuk update CHECK constraint)
PRAGMA foreign_keys=OFF;
ALTER TABLE santri RENAME TO santri_old;

CREATE TABLE santri (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nisn        TEXT UNIQUE NOT NULL,
  nik         TEXT DEFAULT '',
  name        TEXT NOT NULL,
  birth_date  TEXT,
  birth_place TEXT,
  gender      TEXT CHECK(gender IN ('L', 'P')) DEFAULT 'L',
  asal        TEXT,
  madrasah    TEXT, -- MHM / MIU
  kelas       TEXT NOT NULL,
  asrama      TEXT,
  photo_url   TEXT,
  -- Status baru sesuai permintaan user
  status      TEXT CHECK(status IN ('Biasa', 'Ndalem 50%', 'Ndalem 100%', 'PKJ 50%', 'PKJ 100%', 'Nduduk', 'Dzuriyyah', 'Alumni', 'Keluar')) DEFAULT 'Biasa',
  
  street      TEXT,
  rt_rw       TEXT,
  province    TEXT,
  city        TEXT,
  district    TEXT,
  village     TEXT,
  postal_code TEXT,
  wali_name   TEXT,
  wali_wa     TEXT,
  tahun_masuk TEXT,
  tahun_lulus TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- Copy data dari tabel lama ke baru, mapping status lama ke 'Biasa' sebagai default
INSERT INTO santri (id, nisn, nik, name, birth_date, birth_place, gender, asal, madrasah, kelas, asrama, photo_url, status, street, rt_rw, province, city, district, village, postal_code, wali_name, wali_wa, tahun_masuk, tahun_lulus, created_at, updated_at)
SELECT id, nisn, nik, name, birth_date, birth_place, gender, asal, madrasah, kelas, asrama, photo_url, 
  CASE 
    WHEN status IN ('Alumni', 'Keluar') THEN status 
    ELSE 'Biasa' 
  END, 
  street, rt_rw, province, city, district, village, postal_code, wali_name, wali_wa, tahun_masuk, tahun_lulus, created_at, updated_at
FROM santri_old;

DROP TABLE santri_old;
PRAGMA foreign_keys=ON;

-- 3. Reset spp_config agar sesuai dengan status baru
DELETE FROM spp_config;

-- Seeding awal SPP Config untuk status baru (Asumsi tarif default)
INSERT INTO spp_config (status, kelas_name, amount, description) VALUES 
('Biasa', 'Ibtida', 250000, 'Tarif SPP standar'),
('Biasa', 'Tsanawiyyah', 350000, 'Tarif SPP standar'),
('Biasa', 'Aliyyah', 450000, 'Tarif SPP standar'),
('Ndalem 50%', 'Ibtida', 125000, 'Potongan 50% untuk Ndalem'),
('Ndalem 50%', 'Tsanawiyyah', 175000, 'Potongan 50% untuk Ndalem'),
('Ndalem 100%', 'Ibtida', 0, 'Gratis SPP untuk Ndalem full'),
('PKJ 50%', 'Ibtida', 125000, 'Potongan 50% untuk PKJ'),
('Dzuriyyah', 'Ibtida', 0, 'Gratis SPP untuk Dzuriyyah'),
('Nduduk', 'Ibtida', 150000, 'Tarif khusus Nduduk');


-- File: migrations/0015_spp_period_system.sql
-- Migration: 0015_spp_period_system.sql
-- Mengubah sistem SPP dari bulanan menjadi per Periode (Syawal, Maulid, Rajab)

-- 1. Tambah kolom periode di spp_payments
-- ALTER TABLE spp_payments ADD COLUMN period TEXT; -- 'Syawal', 'Maulid', 'Rajab'
-- ALTER TABLE spp_payments ADD COLUMN academic_year TEXT; -- Contoh: '2025/2026'

-- 2. Update spp_config untuk mendukung periode dan biaya santri baru berdasarkan bulan masuk
-- Kita hapus yang lama dan buat baru yang lebih fleksibel
DROP TABLE IF EXISTS spp_config;

CREATE TABLE spp_config (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  status         TEXT NOT NULL,    -- 'Biasa', 'Ndalem 50%', dll
  kelas_name     TEXT NOT NULL,    -- 'Ibtida', 'Tsanawiyyah', dll
  period_name    TEXT NOT NULL,    -- 'Syawal', 'Maulid', 'Rajab', 'Semua'
  amount         INTEGER NOT NULL,
  entry_month    INTEGER,           -- 1-12 (Untuk santri baru yang masuk bulan tertentu)
  is_new_student INTEGER DEFAULT 0, -- 1 jika ini tarif khusus santri baru masuk bulan tsb
  description    TEXT,
  created_at     TEXT DEFAULT (datetime('now'))
);

-- Seed awal tarif triwulan (Asumsi tarif per 4 bulan/periode)
INSERT INTO spp_config (status, kelas_name, period_name, amount, description) VALUES 
('Biasa', 'Ibtida', 'Semua', 1000000, 'Tarif per periode Syawal/Maulid/Rajab'),
('Biasa', 'Tsanawiyyah', 'Semua', 1400000, 'Tarif per periode Syawal/Maulid/Rajab'),
('Biasa', 'Aliyyah', 'Semua', 1800000, 'Tarif per periode Syawal/Maulid/Rajab'),
('Ndalem 50%', 'Ibtida', 'Semua', 500000, 'Tarif 50%'),
('Dzuriyyah', 'Ibtida', 'Semua', 0, 'Gratis');

-- Contoh tarif santri baru masuk bulan tertentu (jika jumlahnya berbeda)
-- Misalnya masuk di bulan ke-2 periode Syawal, sisa bayarnya berapa.
-- User minta: "biaya untuk santri baru yang masuk bulan ini berapa"
INSERT INTO spp_config (status, kelas_name, period_name, amount, entry_month, is_new_student, description) VALUES 
('Biasa', 'Ibtida', 'Syawal', 1000000, 5, 1, 'Santri baru masuk bulan Mei (Syawal)'),
('Biasa', 'Ibtida', 'Syawal', 750000, 6, 1, 'Santri baru masuk bulan Juni'),
('Biasa', 'Ibtida', 'Syawal', 500000, 7, 1, 'Santri baru masuk bulan Juli');

-- Indexing
CREATE INDEX IF NOT EXISTS idx_spp_config_period ON spp_config(period_name);
CREATE INDEX IF NOT EXISTS idx_spp_payments_period ON spp_payments(period);


-- File: migrations/0016_update_spp_config_with_madrasah.sql
-- Migration: 0016_update_spp_config_with_madrasah.sql
-- Menyesuaikan konfigurasi SPP dengan dua Madrasah berbeda (MHM & MIU)

-- 1. Tambah kolom madrasah ke spp_config
ALTER TABLE spp_config ADD COLUMN madrasah TEXT DEFAULT 'MHM';

-- 2. Tambah index untuk pencarian
CREATE INDEX IF NOT EXISTS idx_spp_config_madrasah ON spp_config(madrasah);

-- 3. Update data awal agar lebih variatif
-- Kita hapus data lama agar bersih
DELETE FROM spp_config;

-- Tarif MHM (Ibtida, Tsanawiyyah, Aliyyah, Ma'had Aly, dll)
INSERT INTO spp_config (status, kelas_name, madrasah, period_name, amount, description) VALUES 
('Biasa', 'Ibtida', 'MHM', 'Semua', 1000000, 'Tarif Triwulan MHM Ibtida'),
('Biasa', 'Tsanawiyyah', 'MHM', 'Semua', 1200000, 'Tarif Triwulan MHM Tsanawiyyah'),
('Biasa', 'Aliyyah', 'MHM', 'Semua', 1400000, 'Tarif Triwulan MHM Aliyyah'),
('Biasa', 'Ma''had Aly', 'MHM', 'Semua', 1600000, 'Tarif Triwulan MHM Ma''had Aly'),
('Biasa', 'SP', 'MHM', 'Semua', 800000, 'Tarif Triwulan MHM SP');

-- Tarif MIU (Ula, Wustho, Ulya, dll)
INSERT INTO spp_config (status, kelas_name, madrasah, period_name, amount, description) VALUES 
('Biasa', 'Ula', 'MIU', 'Semua', 900000, 'Tarif Triwulan MIU Ula'),
('Biasa', 'Wustho', 'MIU', 'Semua', 1100000, 'Tarif Triwulan MIU Wustho'),
('Biasa', 'Ulya', 'MIU', 'Semua', 1300000, 'Tarif Triwulan MIU Ulya');

-- Tarif Khusus Ndalem/Dzuriyyah (MHM)
INSERT INTO spp_config (status, kelas_name, madrasah, period_name, amount, description) VALUES 
('Ndalem 50%', 'Ibtida', 'MHM', 'Semua', 500000, 'Diskon Ndalem 50%'),
('Ndalem 100%', 'Ibtida', 'MHM', 'Semua', 0, 'Gratis Ndalem 100%'),
('Dzuriyyah', 'Ibtida', 'MHM', 'Semua', 0, 'Gratis Dzuriyyah');


-- File: migrations/0017_seed_comprehensive_data.sql
-- Migration: 0017_seed_comprehensive_data.sql
-- Mengisi database dengan data santri riil (lengkap formnya)

-- 1. Bersihkan data lama agar id urut
DELETE FROM santri;
DELETE FROM spp_payments;
DELETE FROM transactions;
DELETE FROM sqlite_sequence WHERE name IN ('santri', 'spp_payments', 'transactions');

-- 2. Insert Data Santri (12 Santri contoh)
INSERT INTO santri (nisn, nik, name, madrasah, kelas, asrama, status, asal, street, rt_rw, province, city, district, village, postal_code, wali_name, wali_wa, tahun_masuk) VALUES 
('1122334455', '3507111122220001', 'Ahmad Fauzi Rahman', 'MHM', 'Ibtida'' 1', 'DS A 01', 'Biasa', 'Malang, JAWA TIMUR', 'Jl. Kenanga No. 12', '03/05', 'JAWA TIMUR', 'KABUPATEN MALANG', 'GONDANG LEGI', 'GONDANGLEGI KULON', '65174', 'H. Abdurrahman', '081234567890', '2025-07-15'),
('2122334456', '3507111122220002', 'Fatimah Az-Zahra', 'MHM', 'Tsanawiyyah 2', 'DS B 05', 'Ndalem 50%', 'Tegal, JAWA TENGAH', 'Jl. Melati Blok C', '01/01', 'JAWA TENGAH', 'KABUPATEN TEGAL', 'ADIWERNA', 'ADIWERNA', '52194', 'Bpk. Ahmad Sujak', '081222333444', '2025-07-10'),
('3122334457', '3507111122220003', 'Muhammad Rizki Pratama', 'MIU', 'Ula 2', 'DS A 03', 'Biasa', 'Bekasi, JAWA BARAT', 'Perumahan Galaxy', '05/02', 'JAWA BARAT', 'KOTA BEKASI', 'BEKASI SELATAN', 'JAKA SETIA', '17147', 'Ibu Nurhayati', '085677889900', '2025-07-20'),
('4122334458', '3507111122220004', 'Siti Aminah', 'MIU', 'Wustho 1', 'DS C 10', 'PKJ 50%', 'Kediri, JAWA TIMUR', 'Jl. Pahlawan 44', '04/04', 'JAWA TIMUR', 'KABUPATEN KEDIRI', 'PARE', 'PARE', '64111', 'Bp. Kusnan', '089888111222', '2025-08-01'),
('5122334459', '3507111122220005', 'Zulfikar Ali', 'MHM', 'Aliyyah 3', 'DS A 15', 'Ndalem 100%', 'Surabaya, JAWA TIMUR', 'Jl. Dharmahusada', '02/03', 'JAWA TIMUR', 'KOTA SURABAYA', 'MULYOREJO', 'MULYOREJO', '60115', 'Ibu Aminah', '081333444555', '2025-06-15'),
('6122334460', '3507111122220006', 'Khaidir Anwar', 'MHM', 'Ma''had Aly I Sem 1', 'DS B 12', 'Biasa', 'Nganjuk, JAWA TIMUR', 'Dusun Krajan RT 12', '12/03', 'JAWA TIMUR', 'KABUPATEN NGANJUK', 'BAGOR', 'BAGOR', '64461', 'Bp. Jaelani', '087766554433', '2025-08-15'),
('7122334461', '3507111122220007', 'Umar bin Khattab', 'MHM', 'Ma''had Aly I Sem 7 (Khidmah)', 'DS A 05', 'Biasa', 'Madura, JAWA TIMUR', 'Jl. Sampang KM 12', '01/01', 'JAWA TIMUR', 'KABUPATEN SAMPANG', 'SAMPANG', 'SAMPANG', '69211', 'Abi Umar', '085222000111', '2021-07-01'),
('8122334462', '3507111122220008', 'Dzuriyyah Al-Hasni', 'MHM', 'Ibtida'' 2', 'Rumah Dzuriyyah', 'Dzuriyyah', 'Kediri, JAWA TIMUR', 'Pondok Pesantren', '01/01', 'JAWA TIMUR', 'KOTA KEDIRI', 'KOTA', 'NGADIREJO', '64121', 'Kyai Hasni', '081111111111', '2025-07-01'),
('9122334463', '3507111122220009', 'Luthfi Hakim', 'MIU', 'Ulya 3', 'DS C 05', 'Nduduk', 'Tulungagung, JAWA TIMUR', 'Jl. Merdeka 01', '01/05', 'JAWA TIMUR', 'KABUPATEN TULUNGAGUNG', 'TULUNGAGUNG', 'KAUMAN', '66211', 'Bp. Munir', '081223344556', '2025-07-10'),
('0122334464', '3507111122220010', 'Aisyah Humaira', 'MHM', 'Aliyyah 1', 'DS B 03', 'PKJ 100%', 'Jombang, JAWA TIMUR', 'Jl. Tebuireng', '05/01', 'JAWA TIMUR', 'KABUPATEN JOMBANG', 'DIWEK', 'DIWEK', '61471', 'Ibu Rohmah', '081999888777', '2025-07-25'),
('2122334465', '3507111122220011', 'Hasan Al-Banna', 'MHM', 'Ibtida'' 4', 'DS A 08', 'Biasa', 'Semarang, JAWA TENGAH', 'Jl. Candi Prambanan', '03/03', 'JAWA TENGAH', 'KOTA SEMARANG', 'NGALIYAN', 'NGALIYAN', '50181', 'Bpk. Sholeh', '082211223344', '2025-07-30'),
('3122334466', '3507111122220012', 'Zaid bin Tsabit', 'MIU', 'Ula 3', 'DS C 01', 'Biasa', 'Jakarta Selatan, DKI JAKARTA', 'Jl. Tebet Raya', '01/02', 'DKI JAKARTA', 'KOTA JAKARTA SELATAN', 'TEBET', 'TEBET', '12810', 'Bp. Ibrahim', '081233445566', '2025-08-05');

-- 3. Insert Beberapa Pembayaran SPP (Periode Syawal)
-- ID Santri 1-5 sudah bayar
INSERT INTO spp_payments (santri_id, amount, period, academic_year, status, paid_at) VALUES 
(1, 1000000, 'Syawal', '2025/2026', 'Lunas', '2025-08-01 10:00:00'),
(2, 500000, 'Syawal', '2025/2026', 'Lunas', '2025-08-01 11:30:00'),
(3, 900000, 'Syawal', '2025/2026', 'Lunas', '2025-08-02 09:00:00'),
(5, 0, 'Syawal', '2025/2026', 'Lunas', '2025-07-01 08:00:00'),
(7, 0, 'Syawal', '2025/2026', 'Lunas', '2025-07-01 08:00:00'),
(8, 0, 'Syawal', '2025/2026', 'Lunas', '2025-07-01 08:00:00');

-- 4. Rekam di Transaksi Keuangan
INSERT INTO transactions (type, category, amount, description, date) VALUES 
('Pemasukan', 'SPP', 1000000, 'Syahriah Syawal 2025/2026 - Ahmad Fauzi Rahman (Ibtida'' 1)', '2025-08-01'),
('Pemasukan', 'SPP', 500000, 'Syahriah Syawal 2025/2026 - Fatimah Az-Zahra (Tsanawiyyah 2)', '2025-08-01'),
('Pemasukan', 'SPP', 900000, 'Syahriah Syawal 2025/2026 - Muhammad Rizki Pratama (Ula 2)', '2025-08-02');


-- File: migrations/0018_add_recycle_bin_to_finance.sql
-- Migration: 0018_add_recycle_bin_to_finance.sql
-- Menambahkan dukungan soft-delete untuk Recycle Bin keuangan

-- 1. Tambah kolom deleted_at ke tabel transaksi
-- ALTER TABLE transactions ADD COLUMN deleted_at TEXT;

-- 2. Index untuk mempercepat filter recycle bin
CREATE INDEX IF NOT EXISTS idx_trans_deleted ON transactions(deleted_at);


-- File: migrations/0019_realtime_notifications_with_triggers.sql
-- Migration: 0019_realtime_notifications_with_triggers.sql
-- Menambahkan sistem notifikasi otomatis berbasis event (Lonceng Real-time)

-- 1. Tabel Notifikasi
CREATE TABLE IF NOT EXISTS notifications (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  message     TEXT,
  type        TEXT CHECK(type IN ('info', 'success', 'warning', 'danger')) DEFAULT 'info',
  is_read     INTEGER DEFAULT 0, -- 0: Belum dibaca, 1: Sudah dibaca
  created_at  TEXT DEFAULT (datetime('now'))
);

-- 2. Trigger: Keanggotaan Santri Baru
CREATE TRIGGER IF NOT EXISTS trg_new_santri
AFTER INSERT ON santri
BEGIN
  INSERT INTO notifications (title, message, type)
  VALUES ('Santri Baru', 'Santri ' || NEW.name || ' (NISN: ' || NEW.nisn || ') telah terdaftar di ' || NEW.madrasah, 'success');
END;

-- 3. Trigger: Pembayaran SPP
CREATE TRIGGER IF NOT EXISTS trg_spp_paid
AFTER INSERT ON spp_payments
BEGIN
  INSERT INTO notifications (title, message, type)
  SELECT 'Pembayaran SPP', 'Pembayaran ' || NEW.period || ' oleh ' || s.name || ' sebesar ' || NEW.amount || ' telah dikonfirmasi.', 'success'
  FROM santri s WHERE s.id = NEW.santri_id;
END;

-- 4. Trigger: Transaksi Keuangan (Pengeluaran Besar)
CREATE TRIGGER IF NOT EXISTS trg_finance_expense
AFTER INSERT ON transactions
WHEN NEW.type = 'Pengeluaran'
BEGIN
  INSERT INTO notifications (title, message, type)
  VALUES ('Pengeluaran Baru', 'Pengeluaran ' || NEW.category || ' sebesar ' || NEW.amount || ' tercatat.', 'warning');
END;

CREATE INDEX IF NOT EXISTS idx_notif_unread ON notifications(is_read) WHERE is_read = 0;
CREATE INDEX IF NOT EXISTS idx_notif_date ON notifications(created_at);


-- File: migrations/0020_audit_log_system.sql
-- Migration: 0020_audit_log_system.sql
-- Menambahkan sistem audit log untuk Integritas (Integrity) data CIA

-- 1. Tabel Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name  TEXT NOT NULL,
  record_id   INTEGER NOT NULL,
  action      TEXT CHECK(action IN ('INSERT', 'UPDATE', 'DELETE', 'RESTORE')) NOT NULL,
  old_data    TEXT, -- JSON data sebelum perubahan
  new_data    TEXT, -- JSON data sesudah perubahan
  changed_by  TEXT DEFAULT 'System', -- Nanti dihubungkan ke session user
  created_at  TEXT DEFAULT (datetime('now'))
);

-- Trigger Audit: Santri (Insert)
CREATE TRIGGER IF NOT EXISTS audit_santri_insert
AFTER INSERT ON santri
BEGIN
  INSERT INTO audit_logs (table_name, record_id, action, new_data)
  VALUES ('santri', NEW.id, 'INSERT', json_object('name', NEW.name, 'nisn', NEW.nisn));
END;

-- Trigger Audit: Santri (Update)
CREATE TRIGGER IF NOT EXISTS audit_santri_update
AFTER UPDATE ON santri
BEGIN
  INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data)
  VALUES ('santri', NEW.id, 'UPDATE', 
    json_object('name', OLD.name, 'status', OLD.status), 
    json_object('name', NEW.name, 'status', NEW.status));
END;

-- Trigger Audit: Transaksi (Keuangan)
CREATE TRIGGER IF NOT EXISTS audit_trans_insert
AFTER INSERT ON transactions
BEGIN
  INSERT INTO audit_logs (table_name, record_id, action, new_data)
  VALUES ('transactions', NEW.id, 'INSERT', json_object('amount', NEW.amount, 'type', NEW.type));
END;

-- Index untuk audit performance
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_logs(created_at);


-- File: migrations/0021_users_and_roles.sql
-- Migration: 0021_users_and_roles.sql
-- Menambahkan sistem pengguna dan peranan (Confidentiality) CIA

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  username    TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL, -- SHA-256 Hashed
  name        TEXT NOT NULL,
  role        TEXT CHECK(role IN ('Pengasuh', 'Ketua Pondok', 'Sekretaris', 'Bendahara', 'Seksi Keuangan')) DEFAULT 'Sekretaris',
  status      TEXT CHECK(status IN ('Aktif', 'Nonaktif')) DEFAULT 'Aktif',
  photo_url   TEXT,
  last_login  TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- 2. Index untuk performance
CREATE INDEX IF NOT EXISTS idx_user_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_role ON users(role);

-- 3. Inisialisasi User (Default: admin/admin123 - hashed nantinya)
-- Kita siapkan user awal sebagai contoh
INSERT OR IGNORE INTO users (username, password, name, role)
VALUES ('admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'Kiai Pengasuh', 'Pengasuh');
-- hashed 'admin123'


-- File: migrations/0022_dynamic_roles.sql
-- 1. Tabel Master Jabatan / Roles
CREATE TABLE IF NOT EXISTS jabatan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT UNIQUE NOT NULL,
  akses_level TEXT CHECK(akses_level IN ('ROOT', 'ADMIN', 'FINANCE', 'STAFF', 'RESTRICTED_SPP')) DEFAULT 'STAFF',
  deskripsi TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 2. Isi Data Awal Jabatan
INSERT OR IGNORE INTO jabatan (nama, akses_level) VALUES 
('Pengasuh', 'ROOT'),
('Ketua Pondok', 'ADMIN'),
('Sekretaris', 'ADMIN'),
('Bendahara', 'ADMIN'),
('Seksi Keuangan', 'RESTRICTED_SPP'),
('Pendidikan Pondok', 'STAFF'),
('Murottil Pondok', 'STAFF'),
('Keamanan Pondok', 'STAFF'),
('Kesehatan Pondok', 'STAFF'),
('PLP Pondok', 'STAFF'),
('BUMP Pondok', 'STAFF'),
('Ketua Blok Pondok', 'STAFF'),
('Media & Laboratorium Pondok', 'STAFF');

-- 3. Update Tabel Users (Re-create untuk menghapus CHECK constraint lama)
-- Karena SQLite tidak mendukung DROP CONSTRAINT, kita recreate.
CREATE TABLE IF NOT EXISTS users_new (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  username    TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL, -- Sekarang merujuk ke tabel jabatan.nama
  status      TEXT CHECK(status IN ('Aktif', 'Nonaktif')) DEFAULT 'Aktif',
  photo_url   TEXT,
  last_login  TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- Pindahkan data lama jika ada
INSERT INTO users_new (id, username, password, name, role, status, photo_url, last_login, created_at, updated_at)
SELECT id, username, password, name, role, status, photo_url, last_login, created_at, updated_at FROM users;

DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- Re-create indexes
CREATE INDEX IF NOT EXISTS idx_user_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_role ON users(role);


-- File: migrations/0023_refine_permissions.sql
-- Re-create jabatan table to update CHECK constraint
CREATE TABLE jabatan_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT UNIQUE NOT NULL,
  akses_level TEXT CHECK(akses_level IN ('ROOT', 'SEKRETARIAT', 'KEUANGAN', 'VIEW_ALL', 'STAFF', 'RESTRICTED_SPP')) DEFAULT 'STAFF',
  deskripsi TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

INSERT INTO jabatan_new (id, nama, akses_level, deskripsi, created_at)
SELECT id, nama, 'STAFF', deskripsi, created_at FROM jabatan;

DROP TABLE jabatan;
ALTER TABLE jabatan_new RENAME TO jabatan;

-- Ensure 'Super Admin' role exists in jabatan for ROOT access
INSERT OR IGNORE INTO jabatan (nama, akses_level, deskripsi) 
VALUES ('Super Admin', 'ROOT', 'Akses Root Seluruh Sistem');

-- Update Jabatan Access Levels based on new requirements
UPDATE jabatan SET akses_level = 'VIEW_ALL' WHERE nama IN ('Pengasuh', 'Ketua Pondok');
UPDATE jabatan SET akses_level = 'SEKRETARIAT' WHERE nama IN ('Sekretaris', 'Sekretaris Pondok');
UPDATE jabatan SET akses_level = 'KEUANGAN' WHERE nama IN ('Bendahara', 'Bendahara Pondok');
UPDATE jabatan SET akses_level = 'RESTRICTED_SPP' WHERE nama IN ('Seksi Keuangan');

-- Tambahkan role sisa ke STAFF (default)
UPDATE jabatan SET akses_level = 'STAFF' WHERE akses_level NOT IN ('ROOT', 'SEKRETARIAT', 'KEUANGAN', 'VIEW_ALL', 'RESTRICTED_SPP');

-- Pastikan user admin ada dengan password 'admin123' (hash 240be518...)
INSERT OR IGNORE INTO users (username, password, name, role, status)
VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Super Admin', 'Super Admin', 'Aktif');

UPDATE users SET password = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', role = 'Super Admin' WHERE username = 'admin';


-- File: check_config.sql
SELECT COUNT(*) as count FROM spp_config;


-- File: check_db.sql
SELECT name FROM sqlite_master WHERE type='table';
PRAGMA table_info(santri);
SELECT DISTINCT status FROM santri;
SELECT * FROM spp_config;


-- File: check_fks.sql
SELECT name, sql FROM sqlite_master WHERE type='table' AND sql LIKE '%REFERENCES%';


-- File: check_triggers.sql
SELECT name FROM sqlite_master WHERE type='trigger';


-- File: cleanup.sql
DROP TABLE IF EXISTS kurikulum;
DROP TABLE IF EXISTS jadwal;


-- File: find_old.sql
SELECT * FROM sqlite_master WHERE sql LIKE '%santri_old%';


-- File: fix_spp_table.sql
-- Fix broken foreign key in spp_payments
DROP TABLE IF EXISTS spp_payments;

CREATE TABLE spp_payments (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  santri_id      INTEGER NOT NULL REFERENCES santri(id) ON DELETE CASCADE,
  amount         INTEGER NOT NULL,
  month          TEXT NOT NULL DEFAULT (strftime('%Y-%m', 'now')), 
  status         TEXT CHECK(status IN ('Lunas', 'Tunggakan', 'Cicilan')) DEFAULT 'Tunggakan',
  paid_at        TEXT,
  period         TEXT,
  academic_year  TEXT,
  created_at     TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_spp_santri ON spp_payments(santri_id);
CREATE INDEX IF NOT EXISTS idx_spp_status ON spp_payments(status);
CREATE INDEX IF NOT EXISTS idx_spp_period ON spp_payments(period);


-- File: get_info.sql
PRAGMA table_info(santri);


-- File: khidmah_seed.sql
-- Seed Khidmah Rate
INSERT INTO spp_config (status, madrasah, kelas_name, period_name, amount, description) 
VALUES ('Biasa', 'MHM', 'Khidmah', 'Semua', 0, 'Tarif Semester 7-8 Khidmah (Gratis)');


-- File: seed_only.sql
INSERT INTO santri (nisn, nik, name, madrasah, kelas, asrama, status, asal, street, rt_rw, province, city, district, village, postal_code, wali_name, wali_wa, tahun_masuk) VALUES 
('1122334455', '3507111122220001', 'Ahmad Fauzi Rahman', 'MHM', 'Ibtida'' 1', 'DS A 01', 'Biasa', 'Malang, JAWA TIMUR', 'Jl. Kenanga No. 12', '03/05', 'JAWA TIMUR', 'KABUPATEN MALANG', 'GONDANG LEGI', 'GONDANGLEGI KULON', '65174', 'H. Abdurrahman', '081234567890', '2025-07-15'),
('2122334456', '3507111122220002', 'Fatimah Az-Zahra', 'MHM', 'Tsanawiyyah 2', 'DS B 05', 'Ndalem 50%', 'Tegal, JAWA TENGAH', 'Jl. Melati Blok C', '01/01', 'JAWA TENGAH', 'KABUPATEN TEGAL', 'ADIWERNA', 'ADIWERNA', '52194', 'Bpk. Ahmad Sujak', '081222333444', '2025-07-10'),
('3122334457', '3507111122220003', 'Muhammad Rizki Pratama', 'MIU', 'Ula 2', 'DS A 03', 'Biasa', 'Bekasi, JAWA BARAT', 'Perumahan Galaxy', '05/02', 'JAWA BARAT', 'KOTA BEKASI', 'BEKASI SELATAN', 'JAKA SETIA', '17147', 'Ibu Nurhayati', '085677889900', '2025-07-20'),
('4122334458', '3507111122220004', 'Siti Aminah', 'MIU', 'Wustho 1', 'DS C 10', 'PKJ 50%', 'Kediri, JAWA TIMUR', 'Jl. Pahlawan 44', '04/04', 'JAWA TIMUR', 'KABUPATEN KEDIRI', 'PARE', 'PARE', '64111', 'Bp. Kusnan', '089888111222', '2025-08-01'),
('5122334459', '3507111122220005', 'Zulfikar Ali', 'MHM', 'Aliyyah 3', 'DS A 15', 'Ndalem 100%', 'Surabaya, JAWA TIMUR', 'Jl. Dharmahusada', '02/03', 'JAWA TIMUR', 'KOTA SURABAYA', 'MULYOREJO', 'MULYOREJO', '60115', 'Ibu Aminah', '081333444555', '2025-06-15'),
('6122334460', '3507111122220006', 'Khaidir Anwar', 'MHM', 'Ma''had Aly I Sem 1', 'DS B 12', 'Biasa', 'Nganjuk, JAWA TIMUR', 'Dusun Krajan RT 12', '12/03', 'JAWA TIMUR', 'KABUPATEN NGANJUK', 'BAGOR', 'BAGOR', '64461', 'Bp. Jaelani', '087766554433', '2025-08-15'),
('7122334461', '3507111122220007', 'Umar bin Khattab', 'MHM', 'Ma''had Aly I Sem 7 (Khidmah)', 'DS A 05', 'Biasa', 'Madura, JAWA TIMUR', 'Jl. Sampang KM 12', '01/01', 'JAWA TIMUR', 'KABUPATEN SAMPANG', 'SAMPANG', 'SAMPANG', '69211', 'Abi Umar', '085222000111', '2021-07-01'),
('8122334462', '3507111122220008', 'Dzuriyyah Al-Hasni', 'MHM', 'Ibtida'' 2', 'Rumah Dzuriyyah', 'Dzuriyyah', 'Kediri, JAWA TIMUR', 'Pondok Pesantren', '01/01', 'JAWA TIMUR', 'KOTA KEDIRI', 'KOTA', 'NGADIREJO', '64121', 'Kyai Hasni', '081111111111', '2025-07-01'),
('9122334463', '3507111122220009', 'Luthfi Hakim', 'MIU', 'Ulya 3', 'DS C 05', 'Nduduk', 'Tulungagung, JAWA TIMUR', 'Jl. Merdeka 01', '01/05', 'JAWA TIMUR', 'KABUPATEN TULUNGAGUNG', 'TULUNGAGUNG', 'KAUMAN', '66211', 'Bp. Munir', '081223344556', '2025-07-10'),
('0122334464', '3507111122220010', 'Aisyah Humaira', 'MHM', 'Aliyyah 1', 'DS B 03', 'PKJ 100%', 'Jombang, JAWA TIMUR', 'Jl. Tebuireng', '05/01', 'JAWA TIMUR', 'KABUPATEN JOMBANG', 'DIWEK', 'DIWEK', '61471', 'Ibu Rohmah', '081999888777', '2025-07-25'),
('2122334465', '3507111122220011', 'Hasan Al-Banna', 'MHM', 'Ibtida'' 4', 'DS A 08', 'Biasa', 'Semarang, JAWA TENGAH', 'Jl. Candi Prambanan', '03/03', 'JAWA TENGAH', 'KOTA SEMARANG', 'NGALIYAN', 'NGALIYAN', '50181', 'Bpk. Sholeh', '082211223344', '2025-07-30'),
('3122334466', '3507111122220012', 'Zaid bin Tsabit', 'MIU', 'Ula 3', 'DS C 01', 'Biasa', 'Jakarta Selatan, DKI JAKARTA', 'Jl. Tebet Raya', '01/02', 'DKI JAKARTA', 'KOTA JAKARTA SELATAN', 'TEBET', 'TEBET', '12810', 'Bp. Ibrahim', '081233445566', '2025-08-05');

INSERT INTO spp_payments (santri_id, amount, period, academic_year, status, paid_at) VALUES 
(1, 1000000, 'Syawal', '2025/2026', 'Lunas', '2025-08-01 10:00:00'),
(2, 500000, 'Syawal', '2025/2026', 'Lunas', '2025-08-01 11:30:00'),
(3, 900000, 'Syawal', '2025/2026', 'Lunas', '2025-08-02 09:00:00'),
(5, 0, 'Syawal', '2025/2026', 'Lunas', '2025-07-01 08:00:00'),
(7, 0, 'Syawal', '2025/2026', 'Lunas', '2025-07-01 08:00:00'),
(8, 0, 'Syawal', '2025/2026', 'Lunas', '2025-07-01 08:00:00');

INSERT INTO transactions (type, category, amount, description, date) VALUES 
('Pemasukan', 'SPP', 1000000, 'Syahriah Syawal 2025/2026 - Ahmad Fauzi Rahman (Ibtida'' 1)', '2025-08-01'),
('Pemasukan', 'SPP', 500000, 'Syahriah Syawal 2025/2026 - Fatimah Az-Zahra (Tsanawiyyah 2)', '2025-08-01'),
('Pemasukan', 'SPP', 900000, 'Syahriah Syawal 2025/2026 - Muhammad Rizki Pratama (Ula 2)', '2025-08-02');


-- File: test_db.sql
SELECT name FROM sqlite_master WHERE type='table';


-- File: test_insert.sql
INSERT INTO santri (nisn, nik, name, madrasah, kelas, asrama, status, asal, street, rt_rw, province, city, district, village, postal_code, wali_name, wali_wa, tahun_masuk) 
VALUES ('123', '350', 'Test', 'MHM', 'Ibtida 1', 'DS A', 'Biasa', 'Malang', 'Jl. Kenanga', '03/05', 'JAWA TIMUR', 'MALANG', 'A', 'B', '651', 'Abdu', '081', '2025-07-15');


-- File: settings_table.sql
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO settings (key, value) VALUES
('pondok_name', 'Pondok Pesantren Darussalam Lirboyo'),
('pondok_address', 'Jl. KH. A. Dahlan No.3, Mojoroto, Kota Kediri, Jawa Timur'),
('pondok_phone', '081234567890'),
('pondok_email', 'info@darussalamlirboyo.org'),
('pondok_head', 'KH. Anwar Manshur');



