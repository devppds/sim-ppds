DELETE FROM users;

INSERT INTO users (username, password, full_name, role, jabatan_id, is_active) VALUES
('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Super Admin / Mudir', 'Mudir', 1, 1),
('sekretaris', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin Sekretariat', 'Sekretaris', 2, 1),
('bendahara', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin Keuangan', 'Bendahara', 3, 1),
('keamanan', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin Keamanan', 'Keamanan', 4, 1),
('plp', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin PLP', 'PLP', 5, 1),
('kbr', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin Kebersihan', 'KBR', 6, 1),
('media', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin Media', 'Media', 7, 1),
('takmir', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin Takmir Masjid', 'Takmir', 8, 1),
('jamiyyah', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin Jam''iyyah', 'Jam''iyyah', 9, 1),
('pembangunan', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin Pembangunan', 'Pembangunan', 10, 1);
