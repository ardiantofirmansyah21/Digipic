const welcomeScreen = document.getElementById('welcomeScreen');
const previewScreen = document.getElementById('previewScreen');
const video = document.getElementById('webcam');
const btnOpenPhotobooth = document.getElementById('btnOpenPhotobooth');
const btnCapture = document.getElementById('btnCapture');
const btnRetake = document.getElementById('btnRetake');
const btnDownload = document.getElementById('btnDownload');
const countdownEl = document.getElementById('countdown');
const controlsSection = document.getElementById('controlsSection');
const canvas = document.getElementById('resultCanvas');
const ctx = canvas.getContext('2d');

// Load Gambar Pengantin untuk kebutuhan Canvas Render nanti
const imgPengantin = new Image();
imgPengantin.src = 'pengantin.png';

// 1. Fungsi Mengaktifkan Kamera HP
btnOpenPhotobooth.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } },
            audio: false
        });
        video.srcObject = stream;
        welcomeScreen.classList.add('hidden');
        controlsSection.style.display = 'flex';
    } catch (err) {
        alert('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
        console.error(err);
    }
});

// 2. Logika Hitung Mundur Sebelum Menjepret
btnCapture.addEventListener('click', () => {
    let count = 3;
    countdownEl.innerText = count;
    countdownEl.style.display = 'block';
    btnCapture.disabled = true;

    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownEl.innerText = count;
        } else {
            clearInterval(interval);
            countdownEl.style.display = 'none';
            btnCapture.disabled = false;
            capturePhoto(); // Jalankan proses ambil gambar
        }
    }, 1000);
});

// 3. Fungsi Utama Penggabungan Gambar Kamera & Frame ke Canvas
function capturePhoto() {
    // Tentukan dimensi canvas resolusi tinggi (Aspek Rasio Sesuai Layar HP 9:16)
    canvas.width = 1080;
    canvas.height = 1920;

    // Draw wajah/kamera user ke canvas latar belakang
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // KORDINAT & UKURAN ELEMEN BAWAH (Disinkronkan dengan CSS)
    const boxWidth = canvas.width * 0.85; // Lebar box teks 85% dari canvas
    const boxHeight = 220; // Tinggi box hitam
    const boxX = (canvas.width - boxWidth) / 2; // Posisi X center horizontal
    const boxY = canvas.height - boxHeight - 120; // Posisi Y box agar menggantung rapi di bawah

    // --- GAMBAR KARTUN PENGANTIN DI ATAS KOTAK ---
    const pengantinWidth = 180; // Ukuran lebar gambar kartun pengantin pada canvas
    const pengantinHeight = (imgPengantin.height / imgPengantin.width) * pengantinWidth;
    const pengantinX = (canvas.width - pengantinWidth) / 2;
    const pengantinY = boxY - pengantinHeight + 15; // Diletakkan tepat di atas koordinat Y box hitam

    if (imgPengantin.complete) {
        ctx.drawImage(imgPengantin, pengantinX, pengantinY, pengantinWidth, pengantinHeight);
    }

    // --- GAMBAR KOTAK TEKS HITAM ---
    ctx.fillStyle = 'rgba(22, 22, 22, 0.9)';
    // Membuat bentuk kotak rounded sederhana pada canvas
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 30);
    ctx.fill();

    // --- CETAK TULISAN DI ATAS CANVAS ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 1. Emoticon Bintang Atas
    ctx.fillStyle = '#ffd700';
    ctx.font = '32px sans-serif';
    ctx.fillText('✨ ✨', canvas.width / 2, boxY + 40);

    // 2. Nama Pengantin (Sabrina & Raka)
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 52px Georgia';
    ctx.fillText('Sabrina & Raka', canvas.width / 2, boxY + 105);

    // 3. Tagline / Tanggal Pernikahan
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.fillText('29.05.2026 — HAPPY EVER AFTER', canvas.width / 2, boxY + 165);

    // 4. Emoticon Bintang Mahkota Bawah (Yang sebelumnya menutupi tulisan)
    ctx.fillStyle = '#ffd700';
    ctx.font = '32px sans-serif';
    ctx.fillText('✨ 👑 ✨', canvas.width / 2, boxY + boxHeight + 40); // Diturunkan ke luar box atau sesuaikan area bawah

    // Tampilkan layar preview hasil unduhan
    previewScreen.style.display = 'flex';
}

// 4. Kembali Foto Ulang
btnRetake.addEventListener('click', () => {
    previewScreen.style.display = 'none';
});

// 5. Fungsi Mengunduh Hasil Foto Langsung ke Galeri HP
btnDownload.addEventListener('click', () => {
    const imageURI = canvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.download = 'SabrinaRaka_Photobooth.jpg';
    link.href = imageURI;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
