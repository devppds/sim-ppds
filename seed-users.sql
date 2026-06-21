-- Rekonstruksi Jabatan
DROP TABLE IF EXISTS jabatan;
CREATE TABLE IF NOT EXISTS jabatan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT UNIQUE NOT NULL,
    akses_level TEXT NOT NULL,
    deskripsi TEXT
);

INSERT INTO jabatan (id, nama, akses_level, deskripsi) VALUES 
(1, 'Ketua', 'ROOT', 'Dewan Harian Ketua'),
(2, 'Sekretaris', 'SEKRETARIAT', 'Dewan Harian Sekretaris'),
(3, 'Bendahara', 'VIEW_ALL', 'Dewan Harian Bendahara'),
(4, 'Pendidikan', 'SEKRETARIAT', 'Seksi Pendidikan & Penerangan'),
(5, 'Wajib Belajar', 'SEKRETARIAT', 'Seksi Wajib Belajar & Murottil'),
(6, 'Keamanan', 'SEKRETARIAT', 'Seksi Keamanan'),
(7, 'Jam''iyyah', 'SEKRETARIAT', 'Seksi Jam''iyyah'),
(8, 'Keuangan', 'KEUANGAN', 'Seksi Keuangan / Syahriah'),
(9, 'PLP', 'SEKRETARIAT', 'Penerangan Listrik & Air'),
(10, 'Humasy & Logistik', 'SEKRETARIAT', 'Humasy & Logistik'),
(11, 'Kebersihan', 'SEKRETARIAT', 'Kebersihan Lingkungan (KBR)'),
(12, 'Ketua Blok', 'SEKRETARIAT', 'Ketua Blok'),
(13, 'Pembangunan', 'SEKRETARIAT', 'Pembangunan'),
(14, 'Dokumentasi & Media', 'SEKRETARIAT', 'Dokumentasi & Media Pondok'),
(15, 'Takmir Masjid DS B', 'SEKRETARIAT', 'Takmir Masjid DS B'),
(16, 'Takmir Masjid DS C', 'SEKRETARIAT', 'Takmir Masjid DS C'),
(17, 'Kesehatan', 'SEKRETARIAT', 'Kesehatan / Klinik'),
(18, 'BUMP', 'SEKRETARIAT', 'Badan Usaha Milik Pesantren');

-- Delete old users (Keep Admin/Mudir and Developer if any)
DELETE FROM users WHERE username NOT IN ('admin', 'developer', 'mudir');

-- Generate Users
-- Default Hash for 123456: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
