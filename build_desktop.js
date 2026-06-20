const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function runCommand(command, cwd) {
  console.log(`Menjalankan: ${command} di ${cwd || process.cwd()}`);
  execSync(command, { cwd, stdio: 'inherit' });
}

try {
  // 1. Memastikan ikon aplikasi tersedia di electron/icon.ico
  console.log('\n--- 1. MENYIAPKAN IKON APLIKASI ---');
  const destIcon = path.join(__dirname, 'electron', 'icon.ico');
  if (fs.existsSync(destIcon)) {
    console.log('Ikon aplikasi valid tersedia di electron/icon.ico');
  } else {
    throw new Error('Ikon aplikasi (electron/icon.ico) tidak ditemukan! Pastikan file ini ada.');
  }

  // 2. Install dependensi di folder electron/
  console.log('\n--- 2. MENGINSTAL DEPENDENSI ELECTRON ---');
  runCommand('npm install', path.join(__dirname, 'electron'));

  // 3. Bangun aplikasi desktop (.exe)
  console.log('\n--- 3. MEMBANGUN APLIKASI DESKTOP (.EXE) ---');
  runCommand('npm run dist', path.join(__dirname, 'electron'));

  // 4. Salin hasil build ke repositori rilis
  console.log('\n--- 4. MENGELOLA REPOSITORI RILIS ---');
  const releaseRepoUrl = 'https://github.com/devppds/sim-ppds-release.git';
  const releaseTempDir = path.join(__dirname, 'release-temp');

  // Bersihkan folder temp jika ada sebelumnya
  if (fs.existsSync(releaseTempDir)) {
    console.log('Membersihkan folder temp rilis lama...');
    fs.rmSync(releaseTempDir, { recursive: true, force: true });
  }

  // Kloning repositori rilis
  console.log(`Mengkloning repositori rilis dari ${releaseRepoUrl}...`);
  runCommand(`git clone ${releaseRepoUrl} release-temp`, __dirname);

  // Bersihkan semua berkas di dalam release-temp kecuali folder .git
  console.log('Menghapus berkas rilis lama agar tidak menumpuk sampah...');
  const files = fs.readdirSync(releaseTempDir);
  for (const file of files) {
    if (file === '.git') continue;
    const filePath = path.join(releaseTempDir, file);
    fs.rmSync(filePath, { recursive: true, force: true });
  }

  // Temukan file .exe di electron/dist
  const distDir = path.join(__dirname, 'electron', 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Direktori electron/dist tidak ditemukan setelah kompilasi!');
  }
  
  const distFiles = fs.readdirSync(distDir);
  const exeFile = distFiles.find(f => f.endsWith('.exe') && !f.includes('blockmap'));

  if (!exeFile) {
    throw new Error('Gagal menemukan berkas installer .exe yang dibangun!');
  }

  const srcExePath = path.join(distDir, exeFile);
  const destExePath = path.join(releaseTempDir, 'SIM-PPDS_Setup.exe');

  console.log(`Menyalin ${exeFile} ke ${destExePath}...`);
  fs.copyFileSync(srcExePath, destExePath);

  // Lakukan commit & push di repositori rilis
  console.log('Melakukan push installer ke repositori rilis...');
  runCommand('git add .', releaseTempDir);
  
  // Cek apakah ada perubahan (git status) untuk menghindari error jika tidak ada perubahan
  const gitStatus = execSync('git status --porcelain', { cwd: releaseTempDir }).toString().trim();
  if (gitStatus) {
    runCommand('git commit -m "Rilis: Pembaruan installer desktop SIM-PPDS"', releaseTempDir);
    runCommand('git push origin HEAD', releaseTempDir);
    console.log('Installer berhasil dipublikasikan ke repositori rilis!');
  } else {
    console.log('Tidak ada perubahan pada installer. Lewati commit & push rilis.');
  }

  // Bersihkan direktori sementara rilis
  console.log('Membersihkan folder sementara...');
  fs.rmSync(releaseTempDir, { recursive: true, force: true });

  // 5. Commit dan push codingan ke sim-ppds (coding repository)
  console.log('\n--- 5. MELAKUKAN GIT PUSH CODING KE REPOSITORI UTAMA ---');
  runCommand('git add electron/package.json electron/main.js build_desktop.js scratch_migration.js', __dirname);
  
  // Cek apakah ada perubahan
  const mainGitStatus = execSync('git status --porcelain', { cwd: __dirname }).toString().trim();
  if (mainGitStatus) {
    runCommand('git commit -m "Fitur: Tambah pembungkus Electron dan script build otomatis serta hapus file sekali pakai"', __dirname);
    runCommand('git push origin HEAD', __dirname);
    console.log('Kode sumber berhasil disimpan ke repositori utama!');
  } else {
    console.log('Tidak ada perubahan kode baru yang perlu di-commit.');
  }

  console.log('\n======================================================');
  console.log('PROSES PEMBUATAN DESKTOP DAN INTEGRASI SELESAI SUKSES!');
  console.log('======================================================');

} catch (error) {
  console.error('\nTerjadi kesalahan selama proses build/rilis:', error.message || error);
  process.exit(1);
}
