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

// Inisialisasi awal gambar pengantin agar siap digambar
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
        
        // Sembunyikan welcome screen secara aman
        welcomeScreen.classList.add('hidden');
        controlsSection.style.display = 'flex';
    } catch (err) {
        alert('Gagal mengakses kamera. Silakan periksa izin kamera pada browser Anda.');
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
            capturePhoto(); 
        }
    }, 1000);
});

// Fungsi Pendukung Membuat Kotak Sudut Tumpul Manual (Kompatibel Semua Browser)
function drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius, y);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

// 3. Fungsi Utama Penggabungan Gambar Kamera & Frame ke Canvas
function capturePhoto() {
    // Tentukan dimensi resolusi tinggi standar potret (9:16)
    canvas.width = 1080;
    canvas.height = 1920;

    // Ambil gambar live preview dari elemen video kamera
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // KORDINAT & UKURAN ELEMEN FRAME (Disinkronkan secara presisi)
    const boxWidth = canvas.width * 0.85; 
    const boxHeight = 220; 
    const boxX = (canvas.width - boxWidth) / 2; 
    const boxY = canvas.height - boxHeight - 250; // Jarak gantung aman dari bawah batas foto

    // --- DRAW KARTUN PENGANTIN DI ATAS KOTAK ---
    const pengantinWidth = 180; 
    // Hitung tinggi proporsional jika gambar sudah termuat sempurna
    const pengantinHeight = imgPengantin.height ? (imgPengantin.height / imgPengantin.width) * pengantinWidth : 180;
    const pengantinX = (canvas.width - pengantinWidth) / 2;
    const pengantinY = boxY - pengantinHeight + 10; // Menempel rapi di sisi atas kotak hitam

    if (imgPengantin.complete || imgPengantin.width > 0) {
        ctx.drawImage(imgPengantin, pengantinX, pengantinY, pengantinWidth, pengantinHeight);
    }

    // --- DRAW KOTAK TEKS HITAM ELEGAN ---
    ctx.fillStyle = 'rgba(22, 22, 22, 0.85)';
    drawRoundRect(ctx, boxX, boxY, boxWidth, boxHeight, 25);

    // --- CETAK TULISAN DI ATAS CANVAS ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 1. Emoticon Atas
    ctx.fillStyle = '#ffd700';
    ctx.font = '30px sans-serif';
    ctx.fillText('✨ ✨', canvas.width / 2, boxY + 40);

    // 2. Nama Pengantin (Sabrina & Raka)
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 50px Georgia';
    ctx.fillText('Sabrina & Raka', canvas.width / 2, boxY + 105);

    // 3. Tanggal Pernikahan / Tagline
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px sans-serif';
    ctx.fillText('29.05.2026 — HAPPY EVER AFTER', canvas.width / 2, boxY + 165);

    // 4. Emoticon Bintang Mahkota Bawah (Diposisikan Aman di Dalam Box)
    ctx.fillStyle = '#ffd700';
    ctx.font = '28px sans-serif';
    ctx.fillText('✨ 👑 ✨', canvas.width / 2, boxY + 200); 

    // Tampilkan layar preview hasil
    previewScreen.style.display = 'flex';
}

// 4. Kembali Foto Ulang
btnRetake.addEventListener('click', () => {
    previewScreen.style.display = 'none';
});

// 5. Fungsi Mengunduh Gambar
btnDownload.addEventListener('click', () => {
    const imageURI = canvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.download = 'SabrinaRaka_Photobooth.jpg';
    link.href = imageURI;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
