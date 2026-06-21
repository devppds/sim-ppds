-- ============================================
-- SEED: Rekonstruksi Jabatan + User Pengurus
-- ============================================
DELETE FROM users WHERE username NOT IN ('admin','developer','mudir');
DELETE FROM jabatan;

INSERT INTO jabatan (id,nama,akses_level,deskripsi) VALUES
(1,'Ketua','ROOT','Dewan Harian - Ketua'),
(2,'Sekretaris','SEKRETARIAT','Dewan Harian - Sekretaris'),
(3,'Bendahara','VIEW_ALL','Dewan Harian - Bendahara'),
(4,'Pendidikan','STAFF','Seksi Pendidikan & Penerangan'),
(5,'Wajib Belajar','STAFF','Seksi Wajib Belajar & Murottil'),
(6,'Keamanan','STAFF','Seksi Keamanan'),
(7,'Jam''iyyah','STAFF','Seksi Jam''iyyah'),
(8,'Keuangan','KEUANGAN','Seksi Keuangan / Syahriah'),
(9,'PLP','STAFF','Penerangan Listrik & Air'),
(10,'Humasy','STAFF','Humasy & Logistik'),
(11,'Kebersihan','STAFF','Kebersihan (KBR)'),
(12,'Ketua Blok','STAFF','Ketua Blok'),
(13,'Pembangunan','STAFF','Seksi Pembangunan'),
(14,'Dokumentasi','STAFF','Dokumentasi & Media Pondok'),
(15,'Takmir Masjid DS B','STAFF','Takmir Masjid DS B'),
(16,'Takmir Masjid DS C','STAFF','Takmir Masjid DS C'),
(17,'Kesehatan','STAFF','Seksi Kesehatan'),
(18,'BUMP','STAFF','Badan Usaha Milik Pesantren');

-- HASH 123456: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
INSERT INTO users (username,password,full_name,role,sub_role,is_active,jabatan_id) VALUES
-- DEWAN HARIAN
('sekretariat.ppds','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Sekretariat Pusat','Sekretaris','Sekretaris Umum',1,2),
('ketua.khoirul','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Khoirul Amini Hasby','Ketua','Ketua Umum',1,1),
('ketua.said','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Nur M. Said Nawawi','Ketua','Ketua I',1,1),
('ketua.bisri','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Bisri Mustofa','Ketua','Ketua II',1,1),
('ketua.hasan','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Hasan Baehaki','Ketua','Ketua III',1,1),
('sekretaris.wildan','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Wildan Muhammad','Sekretaris','Sekretaris Umum',1,2),
('sekretaris.chasan','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Chasan Tuqo Asyrofi','Sekretaris','Sekretaris I',1,2),
('sekretaris.syuaib','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Syu''aib','Sekretaris','Sekretaris II',1,2),
('sekretaris.imam','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Imam Muhyiddin Mansyur','Sekretaris','Sekretaris III',1,2),
('bendahara.zidan','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','A. Zidan Haqiqi','Bendahara','Bendahara Umum',1,3),
('bendahara.hendri','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Hendri Nurijan','Bendahara','Bendahara I',1,3),
-- PENDIDIKAN
('pendidikan.sabiq','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Ahmad Sabiq Hanafi','Pendidikan','Kasie',1,4),
('pendidikan.khoirul','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Khoirul Huda','Pendidikan','Anggota',1,4),
('pendidikan.faiz','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Faiz Ali Rosyadi','Pendidikan','Anggota',1,4),
('pendidikan.zaimul','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Zaimul Himam','Pendidikan','Anggota',1,4),
('pendidikan.habib','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Habiburrohman','Pendidikan','Anggota',1,4),
('pendidikan.refan','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Refan Hanafi','Pendidikan','Anggota',1,4),
('pendidikan.fikri','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Ahmad Fikri Naufal','Pendidikan','Anggota',1,4),
('pendidikan.gusti','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Gusti Laxmana Adil','Pendidikan','Anggota',1,4),
('pendidikan.aliwajdi','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Ali Wajdi','Pendidikan','Anggota',1,4),
('pendidikan.abdur','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Muh. Abdur Rozak','Pendidikan','Anggota',1,4),
('pendidikan.untung','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Muhammad Untung Wijaya','Pendidikan','Anggota',1,4),
('pendidikan.dzihaebi','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Dzihaebi','Pendidikan','Anggota',1,4),
-- WAJIB BELAJAR
('wajar.bagus','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Bagus Prasetya Budi','Wajib Belajar','Kasie',1,5),
('wajar.badrus','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Badrus Sholeh','Wajib Belajar','Anggota',1,5),
('wajar.faizul','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Faizul Mustaqim','Wajib Belajar','Anggota',1,5),
('wajar.zidni','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Ahmad Zidni Jal','Wajib Belajar','Anggota',1,5),
('wajar.wafiri','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Ahmad Wafiri','Wajib Belajar','Anggota',1,5),
('wajar.sadulloh','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Sa''dulloh Mubarok','Wajib Belajar','Anggota',1,5),
('wajar.azmil','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Azmil Musthofa','Wajib Belajar','Anggota',1,5),
('wajar.koiman','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Koiman','Wajib Belajar','Anggota',1,5),
('wajar.khusnul','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Khusnul Ma''ab','Wajib Belajar','Anggota',1,5),
('wajar.arya','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Akhmad Arya Maulana Sofa','Wajib Belajar','Anggota',1,5),
('wajar.adzim','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Ahmad Adzim Khaqiqi','Wajib Belajar','Anggota',1,5),
('wajar.arjun','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Arjun Susanto','Wajib Belajar','Anggota',1,5),
('wajar.syamsul','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Syamsul Arifin','Wajib Belajar','Anggota',1,5),
('wajar.labiebul','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Muhammad Labiebul Chija','Wajib Belajar','Anggota',1,5),
('wajar.zamzami','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Zam Zami Maliki','Wajib Belajar','Anggota',1,5),
-- KEAMANAN
('keamanan.ihdal','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Ahmad Ihdal Umam','Keamanan','Kasie',1,6),
('keamanan.tri','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Tri Wahyu Kurniawan','Keamanan','Anggota',1,6),
('keamanan.rofii','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Ahmad Rofi''i','Keamanan','Anggota',1,6),
('keamanan.ilham','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Ilham Barodi','Keamanan','Anggota',1,6),
('keamanan.saiful','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Saiful Amar','Keamanan','Anggota',1,6),
('keamanan.syauqil','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Syauqil Birry','Keamanan','Anggota',1,6),
('keamanan.mubarok','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Ahmad Mubarok','Keamanan','Anggota',1,6),
('keamanan.fazri','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Muhammad Fazri','Keamanan','Anggota',1,6),
('keamanan.rifki','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Muhammad Rifki Syamsul Ma''arif','Keamanan','Anggota',1,6),
('keamanan.riki','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Riki Prasetyo','Keamanan','Anggota',1,6),
('keamanan.zahid','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Ahmad Zahid Eljunaedy','Keamanan','Anggota',1,6),
('keamanan.ikbal','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Ikbal Rinaldi','Keamanan','Anggota',1,6),
('keamanan.ashar','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Ashar Abdul Malik','Keamanan','Anggota',1,6),
('keamanan.shohibul','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Shohibul Mighfari','Keamanan','Anggota',1,6),
('keamanan.rizqi','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Rizqi Syahru Romadhoni','Keamanan','Anggota',1,6),
('keamanan.zuhan','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Moh Zuhan Ahsanul Khuluq','Keamanan','Anggota',1,6),
('keamanan.nuruddin','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Nuruddin','Keamanan','Anggota',1,6),
-- JAMIYYAH
('jamiyyah.nur','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Nur Hadi','Jam''iyyah','Kasie',1,7),
('jamiyyah.alwan','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Alwan Arbangi','Jam''iyyah','Anggota',1,7),
('jamiyyah.ali','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Muh. Ali Marwan Hanan','Jam''iyyah','Anggota',1,7),
-- KEUANGAN
('keuangan.isnanto','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Muhammad Isnanto','Keuangan','Kasie',1,8),
('keuangan.iman','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Iman Aminulloh','Keuangan','Anggota',1,8),
-- PLP
('plp.arsy','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Arsy','PLP','Kasie',1,9),
('plp.syahroni','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Muhammad Syahroni','PLP','Anggota',1,9),
('plp.zakiya','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Zakiya Fahmi Idris','PLP','Anggota',1,9),
-- HUMASY
('humasy.azka','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Azka Muwafiq','Humasy','Kasie',1,10),
('humasy.sayyidun','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Sayyidun Najib','Humasy','Anggota',1,10),
('humasy.sigit','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Sigit Irawan','Humasy','Anggota',1,10),
('humasy.dwiki','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Dwiki Arifian','Humasy','Anggota',1,10),
-- KEBERSIHAN
('kebersihan.alfa','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Alfa Salim','Kebersihan','Kasie',1,11),
('kebersihan.umar','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Umar Said','Kebersihan','Anggota',1,11),
('kebersihan.ali','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Moh. Ali Fahmi','Kebersihan','Anggota',1,11),
('kebersihan.ghufron','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Muhammad Ghufron','Kebersihan','Anggota',1,11),
-- KETUA BLOK
('ketuablok.thohir','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Muhammad Thohir Ubaidillah','Ketua Blok','Kasie',1,12),
('ketuablok.apriyansyah','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Apriyansyah Putra','Ketua Blok','Anggota',1,12),
('ketuablok.fatah','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Fatah Ali Basya','Ketua Blok','Anggota',1,12),
-- PEMBANGUNAN
('pembangunan.alif','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Nur Alif Hidayatul F.','Pembangunan','Kasie',1,13),
('pembangunan.kharfi','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Kharfi','Pembangunan','Anggota',1,13),
('pembangunan.firdaus','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Moh. Firdaus','Pembangunan','Anggota',1,13),
('pembangunan.latif','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Latif Husain','Pembangunan','Anggota',1,13),
-- DOKUMENTASI & MEDIA
('media.zamzami','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Ahmad Zamzami','Dokumentasi','Kasie',1,14),
('media.fauzi','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Ahmad Fauzi','Dokumentasi','Anggota',1,14),
('media.rama','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Rama Wijaya','Dokumentasi','Anggota',1,14),
('media.allim','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Allim Mazin','Dokumentasi','Anggota',1,14),
-- TAKMIR DS B
('takmirb.nurali','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','A. Nur Ali Sahid','Takmir Masjid DS B','Kasie',1,15),
('takmirb.syaiful','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Syaiful Amri','Takmir Masjid DS B','Anggota',1,15),
('takmirb.adi','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Adi Kurniawan','Takmir Masjid DS B','Anggota',1,15),
('takmirb.khoirullisan','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Khoirullisan','Takmir Masjid DS B','Anggota',1,15),
-- TAKMIR DS C
('takmirc.taufiq','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Taufiq Safari','Takmir Masjid DS C','Kasie',1,16),
('takmirc.faqih','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Muh. Faqih An-naoufal','Takmir Masjid DS C','Anggota',1,16),
('takmirc.abu','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Abu Sammah Syazani','Takmir Masjid DS C','Anggota',1,16),
('takmirc.teges','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Teges Kuncoro','Takmir Masjid DS C','Anggota',1,16),
-- KESEHATAN
('kesehatan.mafatih','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Mafatihul Huda','Kesehatan','Kasie',1,17),
('kesehatan.asad','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','As''ad Assidiqi','Kesehatan','Anggota',1,17),
('kesehatan.anim','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. An''im Falahuddin','Kesehatan','Anggota',1,17),
('kesehatan.iqbal','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Nur Iqbal Maulana','Kesehatan','Anggota',1,17),
-- BUMP
('bump.malzumul','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Malzumul Ilmi','BUMP','Kasie',1,18),
('bump.khoirun','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Khoirun Nangim','BUMP','Anggota',1,18),
('bump.abdullah','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','M. Abdullah R.','BUMP','Anggota',1,18);
