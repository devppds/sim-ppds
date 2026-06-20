const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const https = require('https');

function runCommand(command, cwd) {
  console.log(`Menjalankan: ${command} di ${cwd || process.cwd()}`);
  execSync(command, { cwd, stdio: 'inherit' });
}

function getGitCredential() {
  return new Promise((resolve, reject) => {
    const git = spawn('git', ['credential', 'fill']);
    let output = '';
    git.stdout.on('data', (data) => {
      output += data.toString();
    });
    git.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error('Gagal mengambil git credentials.'));
      }
      const lines = output.split('\n');
      let username = '';
      let password = '';
      lines.forEach(line => {
        if (line.startsWith('username=')) username = line.split('=')[1].trim();
        if (line.startsWith('password=')) password = line.split('=')[1].trim();
      });
      resolve({ username, password });
    });
    git.stdin.write('protocol=https\nhost=github.com\n\n');
  });
}

function githubRequest(method, path, token, body = null, isUpload = false, fileBuffer = null) {
  return new Promise((resolve, reject) => {
    const hostname = isUpload ? 'uploads.github.com' : 'api.github.com';
    const options = {
      hostname: hostname,
      port: 443,
      path: path,
      method: method,
      headers: {
        'User-Agent': 'NodeJS-Agent',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    if (isUpload) {
      options.headers['Content-Type'] = 'application/octet-stream';
      options.headers['Content-Length'] = fileBuffer.length;
    } else if (body) {
      options.headers['Content-Type'] = 'application/json';
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = responseData ? JSON.parse(responseData) : null;
        } catch (e) {
          parsed = responseData;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (isUpload) {
      req.write(fileBuffer);
    } else if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function startBuildAndRelease() {
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

    // 4. Temukan file .exe di electron/dist
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
    console.log(`Berkas installer ditemukan di: ${srcExePath}`);

    // 5. Salin hasil build ke repositori rilis (code commit)
    console.log('\n--- 4. MENGELOLA REPOSITORI RILIS (GIT COMMIT) ---');
    const releaseRepoUrl = 'https://github.com/devppds/sim-ppds-release.git';
    const releaseTempDir = path.join(__dirname, 'release-temp');

    if (fs.existsSync(releaseTempDir)) {
      fs.rmSync(releaseTempDir, { recursive: true, force: true });
    }

    console.log(`Mengkloning repositori rilis dari ${releaseRepoUrl}...`);
    runCommand(`git clone ${releaseRepoUrl} release-temp`, __dirname);

    console.log('Menghapus berkas rilis lama di repositori code...');
    const files = fs.readdirSync(releaseTempDir);
    for (const file of files) {
      if (file === '.git') continue;
      fs.rmSync(path.join(releaseTempDir, file), { recursive: true, force: true });
    }

    const destExePath = path.join(releaseTempDir, 'SIM-PPDS_Setup.exe');
    console.log(`Menyalin ${exeFile} ke ${destExePath}...`);
    fs.copyFileSync(srcExePath, destExePath);

    runCommand('git add .', releaseTempDir);
    const gitStatus = execSync('git status --porcelain', { cwd: releaseTempDir }).toString().trim();
    if (gitStatus) {
      runCommand('git commit -m "Rilis: Pembaruan installer desktop SIM-PPDS"', releaseTempDir);
      runCommand('git push origin HEAD', releaseTempDir);
      console.log('Installer berhasil disimpan di repositori rilis master!');
    } else {
      console.log('Tidak ada perubahan pada installer. Lewati push.');
    }
    fs.rmSync(releaseTempDir, { recursive: true, force: true });

    // 6. Integrasi GitHub Releases via API (circled sidebar)
    console.log('\n--- 5. MEMBUAT DAN MEMPUBLIKASIKAN GITHUB RELEASE ---');
    const creds = await getGitCredential();
    const token = creds.password;
    if (!token) {
      throw new Error('Gagal mendapatkan token autentikasi GitHub dari Git.');
    }

    const repoOwner = 'devppds';
    const repoName = 'sim-ppds-release';

    // A. Ambil daftar rilis yang sudah ada
    console.log('Mengambil daftar rilis lama di GitHub...');
    const listRes = await githubRequest('GET', `/repos/${repoOwner}/${repoName}/releases`, token);
    if (listRes.statusCode === 200 && Array.isArray(listRes.body)) {
      console.log(`Ditemukan ${listRes.body.length} rilis lama. Menghapus rilis lama...`);
      for (const rel of listRes.body) {
        console.log(`Menghapus rilis GitHub ID: ${rel.id} (${rel.tag_name})...`);
        await githubRequest('DELETE', `/repos/${repoOwner}/${repoName}/releases/${rel.id}`, token);
        
        // Hapus juga tag-nya agar bersih
        console.log(`Menghapus tag GitHub: ${rel.tag_name}...`);
        await githubRequest('DELETE', `/repos/${repoOwner}/${repoName}/git/refs/tags/${rel.tag_name}`, token).catch(() => {});
      }
    }

    // B. Buat rilis baru
    const tag_name = `v1.0.0`;
    console.log(`Membuat rilis baru di GitHub dengan tag ${tag_name}...`);
    const createRes = await githubRequest('POST', `/repos/${repoOwner}/${repoName}/releases`, token, {
      tag_name: tag_name,
      target_commitish: 'main',
      name: 'Rilis SIM-PPDS Desktop',
      body: 'Unduh file instaler SIM-PPDS Desktop (.exe) terbaru dari aset di bawah.',
      draft: false,
      prerelease: false
    });

    if (createRes.statusCode !== 201) {
      throw new Error(`Gagal membuat rilis di GitHub. Status: ${createRes.statusCode}, Pesan: ${JSON.stringify(createRes.body)}`);
    }

    const releaseId = createRes.body.id;
    console.log(`Rilis sukses dibuat dengan ID: ${releaseId}`);

    // C. Upload file installer ke rilis baru
    console.log('Mengunggah file instaler ke rilis GitHub (proses ini memakan waktu beberapa saat)...');
    const fileBuffer = fs.readFileSync(srcExePath);
    const uploadPath = `/repos/${repoOwner}/${repoName}/releases/${releaseId}/assets?name=SIM-PPDS_Setup.exe`;
    
    const uploadRes = await githubRequest('POST', uploadPath, token, null, true, fileBuffer);
    if (uploadRes.statusCode === 201) {
      console.log('Instaler sukses diunggah ke aset Rilis GitHub!');
    } else {
      throw new Error(`Gagal mengunggah aset ke rilis GitHub. Status: ${uploadRes.statusCode}, Pesan: ${JSON.stringify(uploadRes.body)}`);
    }

    // 7. Commit dan push codingan ke sim-ppds (coding repository)
    console.log('\n--- 6. MELAKUKAN GIT PUSH CODING KE REPOSITORI UTAMA ---');
    runCommand('git add electron/package.json electron/main.js build_desktop.js .gitignore', __dirname);
    const mainGitStatus = execSync('git status --porcelain', { cwd: __dirname }).toString().trim();
    if (mainGitStatus) {
      runCommand('git commit -m "Fitur: Perbarui alur otomatisasi rilis dengan GitHub Release API"', __dirname);
      runCommand('git push origin HEAD', __dirname);
      console.log('Kode sumber berhasil disimpan ke repositori utama!');
    } else {
      console.log('Tidak ada perubahan kode baru yang perlu di-commit.');
    }

    console.log('\n======================================================');
    console.log('PROSES INTEGRASI & GITHUB RELEASE SELESAI DENGAN SUKSES!');
    console.log('======================================================');

  } catch (error) {
    console.error('\nTerjadi kesalahan selama proses build/rilis:', error.message || error);
    process.exit(1);
  }
}

startBuildAndRelease();
