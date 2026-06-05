// Pengikatan Elemen DOM Utama
const startBoothBtn = document.getElementById('startBoothBtn');
const boothSection = document.getElementById('booth-section');
const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('photoCanvas');
const canvasContainer = document.getElementById('canvasContainer'); // Wadah Polaroid Mini
const captureBtn = document.getElementById('captureBtn');
const afterCaptureBtn = document.getElementById('afterCaptureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const shareBtn = document.getElementById('shareBtn');
const downloadBtn = document.getElementById('downloadBtn');
const uploadWeddingBtn = document.getElementById('uploadWeddingBtn');
const weddingGalleryGrid = document.getElementById('weddingGalleryGrid');

// Elemen Baru Untuk Fullscreen Preview (Bug 3)
const fullscreenPreviewModal = document.getElementById('fullscreenPreviewModal');
const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
const fullscreenImg = document.getElementById('fullscreenImg');

const recordBtn = document.getElementById('recordBtn');
const recordStatus = document.getElementById('recordStatus');
const audioPlayback = document.getElementById('audioPlayback');
let mediaRecorder;
let audioChunks = [];
let currentAudioBlob = null;
let currentPhotoBlob = null;

const galleryModal = document.getElementById('galleryModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalImg = document.getElementById('modalImg');
const modalAudio = document.getElementById('modalAudio');
const modalAudioContainer = document.getElementById('modalAudioContainer');
const noAudioTxt = document.getElementById('noAudioTxt');
const modalShareBtn = document.getElementById('modalShareBtn');
const modalDownloadBtn = document.getElementById('modalDownloadBtn');
const modalDeleteBtn = document.getElementById('modalDeleteBtn');

const countdownOverlay = document.getElementById('countdownOverlay');
const countdownText = document.getElementById('countdownText');
const frameUI = document.getElementById('frameUI');
const frameCardInner = document.getElementById('frameCardInner');
const weddingTitle = document.getElementById('weddingTitle');
const weddingDate = document.getElementById('weddingDate');
const preCaptureAction = document.getElementById('preCaptureAction');
const frameSelector = document.getElementById('frameSelector');
const filterSelector = document.getElementById('filterSelector');
const timerSelector = document.getElementById('timerSelector');
const timerOnBtn = document.getElementById('timerOnBtn');
const timerOffBtn = document.getElementById('timerOffBtn');
const switchCameraBtn = document.getElementById('switchCameraBtn');
const closeBoothBtn = document.getElementById('closeBoothBtn');

const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingsModal = document.getElementById('settingsModal');

const triggerUploadModalBtn = document.getElementById('triggerUploadModalBtn');
const nameInputModal = document.getElementById('nameInputModal');
const cancelUploadBtn = document.getElementById('cancelUploadBtn');
const guestNameInput = document.getElementById('guestNameInput');

const flashEffect = document.getElementById('flashEffect');
const successToast = document.getElementById('successToast');

// DOM Elemen Unggah Galeri
const triggerGalleryBtn = document.getElementById('triggerGalleryBtn');
const galleryInput = document.getElementById('galleryInput');

// State Global Kontrol Aplikasi
let selectedFrameStyle = 'dark'; 
let selectedFilter = 'normal';
let useTimer = true; 
let currentFacingMode = 'user'; 
let currentStream = null;
let uploadedImageElement = null;

// Memuat Gambar Aset Pengantin Lokal
let loadedWeddingAsset = new Image();
loadedWeddingAsset.src = "pengantin.png"; 

// Data Gallery Awal Semula (Dummy)
let galleryData = [
    { id: "dummy-1", photoUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=400&auto=format&fit=crop", audioUrl: null, label: "✨ Oleh: Keluarga Pengantin" },
    { id: "dummy-2", photoUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=400&auto=format&fit=crop", audioUrl: null, label: "✨ Doa Terbaik untuk Kalian" }
];
let activeSelectedId = null;

// Event Listeners Kontrol UI Modals
openSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

triggerUploadModalBtn.addEventListener('click', () => {
    nameInputModal.classList.remove('hidden');
    guestNameInput.focus();
});
cancelUploadBtn.addEventListener('click', () => nameInputModal.classList.add('hidden'));

closeBoothBtn.addEventListener('click', () => {
    stopWebcamStream();
    settingsModal.classList.add('hidden');
    boothSection.classList.add('hidden');
    resetBooth();
});

function stopWebcamStream() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}

switchCameraBtn.addEventListener('click', () => {
    currentFacingMode = (currentFacingMode === 'user') ? 'environment' : 'user';
    if (currentFacingMode === 'user') {
        webcamElement.classList.add('transform', '-scale-x-100');
    } else {
        webcamElement.classList.remove('transform', '-scale-x-100');
    }
    startWebcam();
});

startBoothBtn.addEventListener('click', () => {
    boothSection.classList.remove('hidden');
    startWebcam();
});

triggerGalleryBtn.addEventListener('click', () => {
    galleryInput.click();
});

galleryInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        stopWebcamStream();
        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedImageElement = new Image();
            uploadedImageElement.onload = function() {
                preCaptureAction.classList.add('hidden'); 
                switchCameraBtn.classList.add('hidden');
                closeBoothBtn.classList.add('hidden'); 
                settingsModal.classList.add('hidden');
                frameUI.classList.add('hidden'); // Sembunyikan pandangan bingkai live preview
                
                captureImage(true); 
            };
            uploadedImageElement.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

async function startWebcam() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    uploadedImageElement = null;
    try {
        const constraints = {
            video: { facingMode: currentFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        };
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        webcamElement.srcObject = currentStream;
        
        webcamElement.onloadedmetadata = () => {
            webcamElement.play().catch(e => console.log("Autoplay ditolak:", e));
        };
    } catch (err) {
        alert("Akses kamera ditolak atau perangkat Anda tidak mendukung fitur media stream.");
    }
}

window.setTimerOption = function(status) {
    useTimer = status;
    if (useTimer) {
        timerOnBtn.className = "bg-amber-500 border border-amber-500 text-[10px] py-2 rounded-lg font-medium text-stone-950";
        timerOffBtn.className = "bg-stone-900/80 border border-stone-700/60 text-[10px] py-2 rounded-lg font-medium text-stone-300";
    } else {
        timerOnBtn.className = "bg-stone-900/80 border border-stone-700/60 text-[10px] py-2 rounded-lg font-medium text-stone-300";
        timerOffBtn.className = "bg-amber-500 border border-amber-500 text-[10px] py-2 rounded-lg font-medium text-stone-950";
    }
};

window.changeFilter = function(filterType) {
    selectedFilter = filterType;
    const buttons = filterSelector.getElementsByTagName('button');
    for (let btn of buttons) {
        btn.className = "bg-stone-900/80 border border-stone-700/60 text-[10px] py-1.5 rounded-lg font-medium text-stone-300";
    }
    event.currentTarget.className = "bg-amber-500 border border-amber-500 text-[10px] py-1.5 rounded-lg font-medium text-stone-950";
    webcamElement.className = `w-full h-full object-cover ${currentFacingMode === 'user' ? 'transform -scale-x-100' : ''} filter-${filterType}`;
};

window.changeFrameStyle = function(style) {
    selectedFrameStyle = style;
    const buttons = frameSelector.getElementsByTagName('button');
    for (let btn of buttons) {
        btn.className = "bg-stone-900/80 border border-stone-700/60 text-[10px] py-2 rounded-xl font-medium text-stone-300";
    }
    event.currentTarget.className = "bg-amber-500 border border-amber-500 text-[10px] py-2 rounded-xl font-medium text-stone-950";

    if (style === 'dark') {
        frameCardInner.className = "w-full max-w-xs mx-auto bg-stone-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-stone-800 shadow-xl flex items-center gap-3";
        weddingTitle.className = "font-handwriting text-xl text-amber-400 font-bold tracking-wide leading-none truncate";
        weddingDate.className = "text-[7px] text-stone-400 font-semibold tracking-wider mt-0.5 uppercase";
    } else if (style === 'classic') {
        frameCardInner.className = "w-full max-w-xs mx-auto bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-stone-200 shadow-xl flex items-center gap-3";
        weddingTitle.className = "font-handwriting text-xl text-stone-900 font-bold tracking-wide leading-none truncate";
        weddingDate.className = "text-[7px] text-stone-500 font-semibold tracking-wider mt-0.5 uppercase";
    } else if (style === 'romantic') {
        frameCardInner.className = "w-full max-w-xs mx-auto bg-rose-50/90 backdrop-blur-md px-4 py-2 rounded-xl border border-rose-200 shadow-xl flex items-center gap-3";
        weddingTitle.className = "font-handwriting text-xl text-rose-700 font-bold tracking-wide leading-none truncate";
        weddingDate.className = "text-[7px] text-rose-900/60 font-semibold tracking-wider mt-0.5 uppercase";
    }
};

captureBtn.addEventListener('click', () => {
    preCaptureAction.classList.add('hidden'); 
    switchCameraBtn.classList.add('hidden');
    closeBoothBtn.classList.add('hidden'); 
    settingsModal.classList.add('hidden');
    frameUI.classList.add('hidden'); // Sembunyikan frame real-time biar tidak bergeser dobel
    
    if (useTimer) {
        countdownOverlay.classList.remove('hidden');
        let count = 3;
        countdownText.innerText = count;
        
        let timer = setInterval(() => { 
            count--; 
            if (count > 0) { 
                countdownText.innerText = count; 
            } else { 
                clearInterval(timer); 
                countdownOverlay.classList.add('hidden'); 
                triggerFlashAndCapture(); 
            } 
        }, 1000);
    } else {
        triggerFlashAndCapture();
    }
});

function triggerFlashAndCapture() {
    flashEffect.classList.remove('hidden');
    flashEffect.style.opacity = '1';
    
    setTimeout(() => {
        flashEffect.style.opacity = '0';
        setTimeout(() => { flashEffect.classList.add('hidden'); }, 200);
        captureImage(false);
    }, 400);
}

// Perbaikan Bug 2: Konstruksi Ulang Rendering Canvas Secara Presisi Berbentuk Split Dua Sisi
function captureImage(isUploadedMode = false) {
    const ctx = canvasElement.getContext('2d');
    
    if (isUploadedMode && uploadedImageElement) {
        const maxDimension = 1280;
        let targetWidth = uploadedImageElement.width;
        let targetHeight = uploadedImageElement.height;
        
        // Memaksa aspek rasio ideal cetak kartu nama / potret vertikal (3:4)
        canvasElement.width = 768;
        canvasElement.height = 1024;

        // Gambar latar belakang foto agar tercakup rapi (Object Fit Cover di Canvas)
        let imgRatio = targetWidth / targetHeight;
        let canvasRatio = canvasElement.width / canvasElement.height;
        let drawWidth, drawHeight, drawX, drawY;

        if (imgRatio > canvasRatio) {
            drawHeight = canvasElement.height;
            drawWidth = canvasElement.height * imgRatio;
            drawX = (canvasElement.width - drawWidth) / 2;
            drawY = 0;
        } else {
            drawWidth = canvasElement.width;
            drawHeight = canvasElement.width / imgRatio;
            drawX = 0;
            drawY = (canvasElement.height - drawHeight) / 2;
        }
        ctx.drawImage(uploadedImageElement, drawX, drawY, drawWidth, drawHeight);
    } else {
        // Mode jepret kamera HP langsung
        canvasElement.width = 768;
        canvasElement.height = 1024;
        
        ctx.save();
        if (currentFacingMode === 'user') {
            ctx.translate(canvasElement.width, 0);
            ctx.scale(-1, 1);
        }
        
        let videoWidth = webcamElement.videoWidth || 640;
        let videoHeight = webcamElement.videoHeight || 480;
        let videoRatio = videoWidth / videoHeight;
        let targetRatio = canvasElement.width / canvasElement.height;
        let sx, sy, sWidth, sHeight;

        if (videoRatio > targetRatio) {
            sHeight = videoHeight;
            sWidth = videoHeight * targetRatio;
            sx = (videoWidth - sWidth) / 2;
            sy = 0;
        } else {
            sWidth = videoWidth;
            sHeight = videoWidth / targetRatio;
            sx = 0;
            sy = (videoHeight - sHeight) / 2;
        }

        ctx.drawImage(webcamElement, sx, sy, sWidth, sHeight, 0, 0, canvasElement.width, canvasElement.height);
        ctx.restore();
    }
    
    // Aplikasi filter piksel efek warna
    if (selectedFilter === 'glowing' || selectedFilter === 'flawless') {
        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = canvasElement.width;
        blurCanvas.height = canvasElement.height;
        const blurCtx = blurCanvas.getContext('2d');
        blurCtx.drawImage(canvasElement, 0, 0);
        
        ctx.save();
        ctx.globalCompositeOperation = 'soft-light'; 
        ctx.globalAlpha = 0.3; 
        ctx.filter = 'blur(3px)'; 
        ctx.drawImage(blurCanvas, 0, 0);
        ctx.restore();
    }

    const imgData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const data = imgData.data;
    
    if (selectedFilter === 'glowing') {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.12 + 12);
            data[i+1] = Math.min(255, data[i+1] * 1.10 + 10);
            data[i+2] = Math.min(255, data[i+2] * 1.05 + 5);
        }
    } else if (selectedFilter === 'flawless') {
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i], g = data[i+1], b = data[i+2];
            data[i] = Math.min(255, r * 1.15 + 10);
            data[i+1] = Math.min(255, g * 1.06 + 5);
            data[i+2] = Math.min(255, b * 1.10 + 6);
        }
    } else if (selectedFilter === 'warm') {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.15); data[i+1] = Math.min(255, data[i+1] * 1.05); data[i+2] = data[i+2] * 0.88;
        }
    } else if (selectedFilter === 'bw') {
        for (let i = 0; i < data.length; i += 4) {
            let brightness = 0.34 * data[i] + 0.5 * data[i+1] + 0.16 * data[i+2];
            data[i] = brightness; data[i+1] = brightness; data[i+2] = brightness;
        }
    } else if (selectedFilter === 'vintage') {
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i], g = data[i+1], b = data[i+2];
            data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189)); 
            data[i+1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168)); 
            data[i+2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
    }
    ctx.putImageData(imgData, 0, 0);

    // Konfigurasi Palet Warna Frame Tema
    let borderColors = { dark: '#1c1917', classic: '#ffffff', romantic: '#ffe4e6' };
    let textColors = { dark: '#fbbf24', classic: '#1c1917', romantic: '#be123c' };
    let subTextColors = { dark: '#a8a29e', classic: '#57534e', romantic: '#9f1239' };
    let bgBoxColors = { dark: 'rgba(12, 10, 9, 0.9)', classic: 'rgba(255, 255, 255, 0.92)', romantic: 'rgba(255, 241, 242, 0.92)' };
    let innerBorderColors = { dark: '#2e2a24', classic: '#e7e5e4', romantic: '#fecdd3' };

    // 1. Gambar Border Luar
    const borderWidth = canvasElement.width * 0.035; // Ketebalan bingkai tepi tipis elegan
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColors[selectedFrameStyle];
    ctx.strokeRect(borderWidth/2, borderWidth/2, canvasElement.width - borderWidth, canvasElement.height - borderWidth);

    // 2. Definisi Area Kotak Teks Informasi Bawah (Wadah Utama Berbagi Ruang)
    const boxHeight = canvasElement.height * 0.15;
    const boxY = canvasElement.height - boxHeight - borderWidth - (canvasElement.height * 0.025);
    const boxX = borderWidth + (canvasElement.width * 0.04);
    const boxWidth = canvasElement.width - (boxX * 2);

    ctx.fillStyle = bgBoxColors[selectedFrameStyle];
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 16);
    ctx.fill();
    
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = innerBorderColors[selectedFrameStyle];
    ctx.stroke();

    // 3. Gambar Ilustrasi Pengantin (Sisi Kiri Di Dalam Kotak)
    const paddingBox = 16;
    const assetHeight = boxHeight - (paddingBox * 2);
    const assetWidth = assetHeight; // Jaga aspek rasio kotak 1:1 murni
    const assetX = boxX + paddingBox + 6;
    const assetY = boxY + paddingBox;

    if (loadedWeddingAsset.complete && loadedWeddingAsset.naturalWidth > 0) {
        ctx.drawImage(loadedWeddingAsset, assetX, assetY, assetWidth, assetHeight);
    }

    // 4. Penggambaran Komponen Teks Informasi (Sisi Kanan Di Dalam Kotak)
    const contentStartX = assetX + assetWidth + 20; 
    let decorSet = {
        dark: { left: "✨ ✦", right: "✦ ✨", bottom: "✨ 👑 ✨" },
        classic: { left: "🌸 ✦", right: "✦ 🌸", bottom: "✨ 💕 ✨" },
        romantic: { left: "❤️ ✦", right: "✦ ❤️", bottom: "🎈 ❤️ 🎈" }
    };
    let currentDecor = decorSet[selectedFrameStyle];

    // Render Font Dinamis untuk Memastikan Teks Tidak Bergeser Keluar
    document.fonts.load(`italic ${canvasElement.width * 0.055}px 'Great Vibes'`).then(() => {
        
        // A. Emoji Dekorasi Atas
        ctx.fillStyle = textColors[selectedFrameStyle];
        ctx.font = `${canvasElement.width * 0.028}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText(currentDecor.left, contentStartX, boxY + 32);

        // B. Nama Pengantin Utama (Gunakan koordinat left agar seimbang di kanan gambar)
        ctx.fillStyle = textColors[selectedFrameStyle];
        ctx.font = `italic ${canvasElement.width * 0.055}px 'Great Vibes', cursive`; 
        ctx.fillText("Sabrina & Raka", contentStartX, boxY + (boxHeight / 1.8));
        
        // C. Baris Tanggal & Slogan Wedding
        ctx.fillStyle = subTextColors[selectedFrameStyle];
        ctx.font = `bold ${canvasElement.width * 0.02}px sans-serif`;
        ctx.fillText("29.05.2026 — HAPPY EVER AFTER", contentStartX, boxY + (boxHeight / 1.25));

        // D. Emoji Dekorasi Bawah (Sekarang dipindah ke samping kanan agar tidak menumpuk teks)
        ctx.fillStyle = textColors[selectedFrameStyle];
        ctx.font = `${canvasElement.width * 0.026}px Arial`;
        ctx.textAlign = 'right';
        ctx.fillText(currentDecor.bottom, boxX + boxWidth - paddingBox, boxY + boxHeight - paddingBox);

        // Ekspor Hasil Akhir Sebagai Blob Berkas PNG
        canvasElement.toBlob((blob) => { currentPhotoBlob = blob; }, 'image/png');
    });

    // Perbaikan Bug 3: Sembunyikan kamera, tampilkan kontainer polaroid mini
    webcamElement.classList.add('hidden');
    canvasContainer.classList.remove('hidden');
    afterCaptureBtn.classList.remove('hidden');
    
    initAudioRecorder();
}

async function initAudioRecorder() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.ondataavailable = (event) => { audioChunks.push(event.data); };
        mediaRecorder.onstop = () => {
            currentAudioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
            audioPlayback.src = URL.createObjectURL(currentAudioBlob);
            audioPlayback.classList.remove('hidden');
        };
    } catch (err) {
        console.log("Pemberian izin akses mikrofon ditolak oleh pengguna.");
    }
}

recordBtn.addEventListener('click', () => {
    if (!mediaRecorder) return alert("Perangkat mikrofon belum siap.");
    if (mediaRecorder.state === "inactive") {
        audioChunks = []; mediaRecorder.start(); recordBtn.innerText = "Stop"; recordStatus.innerText = "🔴 Merekam...";
    } else {
        mediaRecorder.stop(); recordBtn.innerText = "Rekam Ulang"; recordStatus.innerText = "Selesai!";
    }
});

// Perbaikan Bug 3: Handler klik polaroid untuk membuka mode gambar layar penuh (Fullscreen Preview)
canvasContainer.addEventListener('click', () => {
    if (canvasElement) {
        const dataUrl = canvasElement.toDataURL('image/png');
        fullscreenImg.src = dataUrl;
        fullscreenPreviewModal.classList.remove('hidden');
    }
});
closeFullscreenBtn.addEventListener('click', () => {
    fullscreenPreviewModal.classList.add('hidden');
});

function triggerShare(blobFile) {
    if (!blobFile) return;
    const file = new File([blobFile], "wedding_photobooth.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file] }); }
}
function triggerDownload(blobFile) {
    if (!blobFile) return;
    const a = document.createElement('a'); a.href = URL.createObjectURL(blobFile); a.download = `booth_${Date.now()}.png`; a.click();
}
shareBtn.addEventListener('click', () => triggerShare(currentPhotoBlob));
downloadBtn.addEventListener('click', () => triggerDownload(currentPhotoBlob));
modalDownloadBtn.addEventListener('click', () => {
    const item = galleryData.find(p => p.id === activeSelectedId);
    if(item && item.rawPhotoBlob) { triggerDownload(item.rawPhotoBlob); } 
    else if (item) { const a = document.createElement('a'); a.href = item.photoUrl; a.download = `wedding_${Date.now()}.png`; a.click(); }
});

function renderGallery() {
    weddingGalleryGrid.innerHTML = "";
    galleryData.forEach(item => {
        const card = document.createElement('div');
        card.className = "bg-white p-2.5 rounded-xl shadow border border-stone-200/60 cursor-pointer transform hover:scale-[1.02] transition-all";
        card.addEventListener('click', () => openGalleryModal(item.id));
        card.innerHTML = `<div class='overflow-hidden rounded-lg aspect-[3/4]'><img src='${item.photoUrl}' class='w-full h-full object-cover' alt='photo'></div><p class='text-[9px] font-medium text-stone-500 text-center mt-2 truncate px-1'>${item.label}</p>`;
        weddingGalleryGrid.appendChild(card);
    });
}

uploadWeddingBtn.addEventListener('click', () => {
    const namaTamu = guestNameInput.value.trim();
    if (namaTamu === "") {
        alert("Nama tidak boleh kosong!");
        guestNameInput.focus();
        return;
    }

    uploadWeddingBtn.innerText = "Mengirim..."; 
    uploadWeddingBtn.disabled = true;

    setTimeout(() => {
        const uniqueId = "photo-" + Date.now();
        const labelNama = `✨ Oleh: ${namaTamu}`;
        
        galleryData.unshift({ 
            id: uniqueId, 
            photoUrl: URL.createObjectURL(currentPhotoBlob), 
            audioUrl: currentAudioBlob ? URL.createObjectURL(currentAudioBlob) : null, 
            label: labelNama, 
            rawPhotoBlob: currentPhotoBlob 
        });
        
        nameInputModal.classList.add('hidden');
        boothSection.classList.add('hidden'); 
        
        successToast.classList.remove('hidden');
        setTimeout(() => { successToast.classList.add('hidden'); }, 3500);

        renderGallery(); 
        resetBooth();
        
        document.getElementById('gallery-section').scrollIntoView({ behavior: 'smooth' });
    }, 1000);
});

function openGalleryModal(id) {
    const item = galleryData.find(p => p.id === id); if (!item) return;
    activeSelectedId = id; modalImg.src = item.photoUrl;
    if (item.audioUrl) { modalAudio.src = item.audioUrl; modalAudio.classList.remove('hidden'); noAudioTxt.classList.add('hidden'); }
    else { modalAudio.src = ""; modalAudio.classList.add('hidden'); noAudioTxt.classList.remove('hidden'); }
    galleryModal.classList.remove('hidden');
}
closeModalBtn.addEventListener('click', () => { galleryModal.classList.add('hidden'); modalAudio.pause(); });
modalDeleteBtn.addEventListener('click', () => { if (confirm("Apakah Anda yakin ingin menghapus kenangan foto ini?")) { galleryData = galleryData.filter(p => p.id !== activeSelectedId); renderGallery(); galleryModal.classList.add('hidden'); } });

function resetBooth() {
    audioPlayback.classList.add('hidden'); audioPlayback.src = ""; currentAudioBlob = null;
    recordStatus.innerText = "Belum merekam"; recordBtn.innerText = "Mulai Rekam";
    uploadWeddingBtn.innerText = "Kirim 🚀"; uploadWeddingBtn.disabled = false;
    guestNameInput.value = "";
    galleryInput.value = ""; 
    uploadedImageElement = null;
    webcamElement.classList.remove('hidden'); 
    canvasContainer.classList.add('hidden'); // Sembunyikan kontainer polaroid mini
    preCaptureAction.classList.remove('hidden'); afterCaptureBtn.classList.add('hidden');
    switchCameraBtn.classList.remove('hidden');
    closeBoothBtn.classList.remove('hidden'); 
    frameUI.classList.remove('hidden'); // Munculkan kembali bingkai tipis untuk bidikan baru
}

retakeBtn.addEventListener('click', () => {
    resetBooth();
    startWebcam(); 
});

document.addEventListener('DOMContentLoaded', () => { 
    renderGallery(); 
});
