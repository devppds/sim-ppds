const fs = require('fs');
const HASH = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';
const taken = new Set();
function uniq(base) {
  let u = base, c = 1;
  while (taken.has(u)) { c++; u = base + c; }
  taken.add(u); return u;
}
function fst(n) {
  let p = n.split(' ');
  let f = p[0].toLowerCase().replace(/[^a-z]/g, '');
  if (f.length < 3 && p.length > 1) f = p[1].toLowerCase().replace(/[^a-z]/g, '');
  return f || 'user';
}
function esc(s) { return s.replace(/'/g, "''"); }
function row(un, nm, role, sub, jid) {
  return "('"+un+"','"+HASH+"','"+esc(nm)+"','"+esc(role)+"','"+esc(sub)+"',1,"+jid+")";
}

const vals = [];

const dh = [
  ['Ketua Umum','M. Khoirul Amini Hasby',1,'Ketua'],
  ['Ketua I','Nur M. Said Nawawi',1,'Ketua'],
  ['Ketua II','Bisri Mustofa',1,'Ketua'],
  ['Ketua III','Hasan Baehaki',1,'Ketua'],
  ['Sekretaris Umum','Wildan Muhammad',2,'Sekretaris'],
  ['Sekretaris I','M. Chasan Tuqo Asyrofi',2,'Sekretaris'],
  ["Sekretaris II","M. Syu'aib",2,'Sekretaris'],
  ['Sekretaris III','Imam Muhyiddin Mansyur',2,'Sekretaris'],
  ['Bendahara Umum','A. Zidan Haqiqi',3,'Bendahara'],
  ['Bendahara I','Hendri Nurijan',3,'Bendahara'],
];
for (const [sub, nm, jid, jname] of dh) {
  const un = uniq(jname.toLowerCase() + '.' + fst(nm));
  vals.push(row(un, nm, jname, sub, jid));
}

const seksi = [
  {id:4,role:'Pendidikan',slug:'pendidikan',members:['Ahmad Sabiq Hanafi|Kasie','M. Khoirul Huda','Faiz Ali Rosyadi','Zaimul Himam','Habiburrohman','M. Refan Hanafi','Ahmad Fikri Naufal','Gusti Laxmana Adil','M. Ali Wajdi','Muh. Abdur Rozak','Muhammad Untung Wijaya','Dzihaebi']},
  {id:5,role:'Wajib Belajar',slug:'wajar',members:["M. Bagus Prasetya Budi|Kasie","Badrus Sholeh","Faizul Mustaqim","Ahmad Zidni Jal","Ahmad Wafiri","Sa'dulloh Mubarok","M. Azmil Musthofa","Koiman","Khusnul Ma'ab","Akhmad Arya Maulana Sofa","Ahmad Adzim Khaqiqi","Arjun Susanto","Syamsul Arifin","Muhammad Labiebul Chija","M. Zam Zami Maliki"]},
  {id:6,role:'Keamanan',slug:'keamanan',members:["Ahmad Ihdal Umam|Kasie","Tri Wahyu Kurniawan","Ahmad Rofi'i","M. Ilham Barodi","Saiful Amar","Syauqil Birry","Ahmad Mubarok","Muhammad Fazri","Muhammad Rifki Syamsul Ma'arif","Riki Prasetyo","Ahmad Zahid Eljunaedy","Ikbal Rinaldi","M. Ashar Abdul Malik","M. Shohibul Mighfari","Rizqi Syahru Romadhoni","Moh Zuhan Ahsanul Khuluq","M. Nuruddin"]},
  {id:7,role:"Jam'iyyah",slug:'jamiyyah',members:["Nur Hadi|Kasie","Alwan Arbangi","Muh. Ali Marwan Hanan"]},
  {id:8,role:'Keuangan',slug:'keuangan',members:["Muhammad Isnanto|Kasie","M. Iman Aminulloh"]},
  {id:9,role:'PLP',slug:'plp',members:["M. Arsy|Kasie","Muhammmmad Syahroni","Zakiya Fahmi Idris"]},
  {id:10,role:'Humasy',slug:'humasy',members:["M. Azka Muwafiq|Kasie","Sayyidun Najib","Sigit Irawan","Dwiki Arifian"]},
  {id:11,role:'Kebersihan',slug:'kebersihan',members:["Alfa Salim|Kasie","Umar Said","Moh. Ali Fahmi","Muhammad Ghufron"]},
  {id:12,role:'Ketua Blok',slug:'ketuablok',members:["Muhammad Thohir Ubaidillah|Kasie","Apriyansyah Putra","Fatah Ali Basya"]},
  {id:13,role:'Pembangunan',slug:'pembangunan',members:["Nur Alif Hidayatul F.|Kasie","M. Kharfi","Moh. Firdaus","M. Latif Husain"]},
  {id:14,role:'Dokumentasi',slug:'media',members:["Ahmad Zamzami|Kasie","Ahmad Fauzi","Rama Wijaya","Allim Mazin"]},
  {id:15,role:'Takmir Masjid DS B',slug:'takmirb',members:["A. Nur Ali Sahid|Kasie","Syaiful Amri","Adi Kurniawan","Khoirullisan"]},
  {id:16,role:'Takmir Masjid DS C',slug:'takmirc',members:["M. Taufiq Safari|Kasie","Muh. Faqih An-naoufal","M. Abu Sammah Syazani","Teges Kuncoro"]},
  {id:17,role:'Kesehatan',slug:'kesehatan',members:["M. Mafatihul Huda|Kasie","As'ad Assidiqi","M. An'im Falahuddin","M. Nur Iqbal Maulana"]},
  {id:18,role:'BUMP',slug:'bump',members:["Malzumul Ilmi|Kasie","Khoirun Nangim","M. Abdullah R."]},
];

for (const s of seksi) {
  for (const m of s.members) {
    const parts = m.split('|');
    const nm = parts[0].trim();
    const sub = parts[1] ? parts[1].trim() : 'Anggota';
    const un = uniq(s.slug + '.' + fst(nm));
    vals.push(row(un, nm, s.role, sub, s.id));
  }
}

const header = -- Rekonstruksi Jabatan
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
(17,'Kesehatan','STAFF','Seksi Kesehatan / Klinik'),
(18,'BUMP','STAFF','Badan Usaha Milik Pesantren');

INSERT INTO users (username,password,full_name,role,sub_role,is_active,jabatan_id) VALUES
;

const sql = header + vals.join(',\n') + ';';
fs.writeFileSync('d:/DEVELZY/ppds/seed-all.sql', sql, {encoding:'utf8'});
console.log('Done! Generated ' + vals.length + ' users.');
