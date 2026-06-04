const welcomeScreen = document.getElementById('welcomeScreen');
const previewScreen = document.getElementById('previewScreen');
const video = document.getElementById('webcam');
const btnOpenPhotobooth = document.getElementById('btnOpenPhotobooth');
const btnCapture = document.getElementById('btnCapture');
const btnRetake = document.getElementById('btnRetake');
const btnDownload = document.getElementById('btnDownload');
const countdownEl = document.getElementById('countdown');
const captureTarget = document.getElementById('captureTarget');
const outputImage = document.getElementById('outputImage');

let savedImageURI = '';

// 1. Fungsi Mengaktifkan Kamera HP
btnOpenPhotobooth.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'user', 
                width: { ideal: 1080 }, 
                height: { ideal: 1920 } 
            },
            audio: false
        });
        video.srcObject = stream;
        welcomeScreen.classList.add('hidden');
    } catch (err) {
        alert('Izin kamera ditolak atau tidak didukung di browser ini.');
        console.error(err);
    }
});

// 2. Logika Hitung Mundur 3 Detik
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
            takeSnapShot();
        }
    }, 1000);
});

// 3. Mengambil Gambar Menggunakan Metode Screenshot Elemen (html2canvas)
function takeSnapShot() {
    // Membekukan frame video sementara agar pas di screenshot
    video.pause();

    // Mengambil screenshot area photobooth secara instan beserta overlay-nya
    html2canvas(captureTarget, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // Menggandakan kualitas agar hasil foto tajam dan HD saat disimpan
        logging: false
    }).then(canvas => {
        savedImageURI = canvas.toDataURL('image/jpeg', 0.95);
        
        // Memasukkan hasil snapshot ke tag gambar preview
        outputImage.src = savedImageURI;
        
        // Tampilkan layar preview unduh
        previewScreen.style.display = 'flex';
        
        // Jalankan kembali aliran live video di background
        video.play();
    }).catch(err => {
        alert('Gagal memproses gambar, silakan coba kembali.');
        video.play();
        console.error(err);
    });
}

// 4. Kembali Foto Ulang
btnRetake.addEventListener('click', () => {
    previewScreen.style.display = 'none';
    outputImage.src = '';
});

// 5. Download Otomatis Ke Galeri HP
btnDownload.addEventListener('click', () => {
    if (!savedImageURI) return;
    
    const link = document.createElement('a');
    link.download = 'SabrinaRaka_Photobooth.jpg';
    link.href = savedImageURI;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
