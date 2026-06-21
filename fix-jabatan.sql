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

INSERT INTO users (username, password, full_name, role, jabatan_id, is_active) VALUES
('keuangan', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Seksi Keuangan', 'Keuangan', 14, 1);
