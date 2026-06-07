// Pengikatan Elemen DOM Utama
const startBoothBtn = document.getElementById('startBoothBtn');
const boothSection = document.getElementById('booth-section');
const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('photoCanvas');
const captureBtn = document.getElementById('captureBtn');
const afterCaptureBtn = document.getElementById('afterCaptureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const shareBtn = document.getElementById('shareBtn');
const downloadBtn = document.getElementById('downloadBtn');
const uploadWeddingBtn = document.getElementById('uploadWeddingBtn');
const weddingGalleryGrid = document.getElementById('weddingGalleryGrid');

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
const decorTop = document.getElementById('decorTop');
const decorBottom = document.getElementById('decorBottom');
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
let uploadedImageElement = null; // Menyimpan objek gambar dari file galeri

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

// Tombol Utama Buka Modul Kamera Photobooth
startBoothBtn.addEventListener('click', () => {
    boothSection.classList.remove('hidden');
    startWebcam();
});

// PERBAIKAN: Handler Trigger klik untuk memilih berkas dari galeri handphone
triggerGalleryBtn.addEventListener('click', () => {
    galleryInput.click();
});

// PERBAIKAN: Fungsi penanganan file gambar yang dipilih dari galeri perangkat luar
galleryInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        stopWebcamStream(); // Matikan stream kamera demi menghemat memori
        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedImageElement = new Image();
            uploadedImageElement.onload = function() {
                // Sembunyikan kontrol pra-pengambilan gambar kamera langsung
                preCaptureAction.classList.add('hidden'); 
                
                // Panggil fungsi pemrosesan canvas dengan status true (mode upload)
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
    uploadedImageElement = null; // Bersihkan temporary file galeri sebelumnya
    try {
        const constraints = {
            video: { 
                facingMode: currentFacingMode, 
                width: { ideal: 1280 }, 
                height: { ideal: 960 },      // 1280x960 = 4:3
                aspectRatio: { ideal: 4/3 }  // paksa 4:3
            },
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

    const frameBorderTop    = document.getElementById('frameBorderTop');
    const frameBorderBottom = document.getElementById('frameBorderBottom');
    const frameBorderSide   = document.getElementById('frameBorderSide');
    const frameUI           = document.getElementById('frameUI');
    const decorTop          = document.getElementById('decorTop');
    const decorBottom       = document.getElementById('decorBottom');
    const weddingTitle      = document.getElementById('weddingTitle');
    const weddingDate       = document.getElementById('weddingDate');

    if (style === 'dark') {
        const c = '#1c1917';
        frameBorderTop.style.backgroundColor    = c;
        frameBorderBottom.style.backgroundColor = c;
        frameBorderSide.style.boxShadow = `inset 0 0 0 12px ${c}`;
        frameUI.style.backgroundColor   = '#1c1917';
        decorTop.innerHTML    = "<span>✨ ✦</span><span>✦ ✨</span>";
        decorBottom.innerHTML = "<span>✨ 👑 ✨</span>";
        weddingTitle.className = "font-handwriting text-xl text-amber-400 font-bold leading-none";
        weddingDate.className  = "text-[6px] text-stone-400 font-semibold tracking-widest mt-0.5";
    } else if (style === 'classic') {
        const c = '#ffffff';
        frameBorderTop.style.backgroundColor    = c;
        frameBorderBottom.style.backgroundColor = c;
        frameBorderSide.style.boxShadow = `inset 0 0 0 12px ${c}`;
        frameUI.style.backgroundColor   = '#ffffff';
        decorTop.innerHTML    = "<span>🌸 ✦</span><span>✦ 🌸</span>";
        decorBottom.innerHTML = "<span>✨ 💕 ✨</span>";
        weddingTitle.className = "font-handwriting text-xl text-stone-900 font-bold leading-none";
        weddingDate.className  = "text-[6px] text-stone-500 font-semibold tracking-widest mt-0.5";
    } else if (style === 'romantic') {
        const c = '#ffe4e6';
        frameBorderTop.style.backgroundColor    = c;
        frameBorderBottom.style.backgroundColor = c;
        frameBorderSide.style.boxShadow = `inset 0 0 0 12px ${c}`;
        frameUI.style.backgroundColor   = '#ffe4e6';
        decorTop.innerHTML    = "<span>❤️ ✦</span><span>✦ ❤️</span>";
        decorBottom.innerHTML = "<span>🎈 ❤️ 🎈</span>";
        weddingTitle.className = "font-handwriting text-xl text-rose-700 font-bold leading-none";
        weddingDate.className  = "text-[6px] text-rose-900/60 font-semibold tracking-widest mt-0.5";
    }
};

captureBtn.addEventListener('click', () => {
    preCaptureAction.classList.add('hidden'); 
    settingsModal.classList.add('hidden');
    
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
        captureImage(false); // Mode normal via stream kamera
    }, 400);
}

function captureImage(isUploadedMode = false) {
    const ctx = canvasElement.getContext('2d');
    
    // SELALU gunakan 3:4 portrait untuk output foto
    const OUTPUT_W = 960;
    const OUTPUT_H = 1280; // 3:4 portrait

    if (isUploadedMode && uploadedImageElement) {
        canvasElement.width = OUTPUT_W;
        canvasElement.height = OUTPUT_H;
        // Crop center dari gambar upload agar pas 4:3
        const srcW = uploadedImageElement.width;
        const srcH = uploadedImageElement.height;
        const srcAspect = srcW / srcH;
        const dstAspect = OUTPUT_W / OUTPUT_H;
        let sx = 0, sy = 0, sw = srcW, sh = srcH;
        if (srcAspect > dstAspect) {
            sw = srcH * dstAspect;
            sx = (srcW - sw) / 2;
        } else {
            sh = srcW / dstAspect;
            sy = (srcH - sh) / 2;
        }
        ctx.drawImage(uploadedImageElement, sx, sy, sw, sh, 0, 0, OUTPUT_W, OUTPUT_H);
    } else {
        canvasElement.width = OUTPUT_W;
        canvasElement.height = OUTPUT_H;
        // Crop center webcam feed agar tepat 4:3
        const vw = webcamElement.videoWidth || 1280;
        const vh = webcamElement.videoHeight || 960;
        const vAspect = vw / vh;
        const dstAspect = OUTPUT_W / OUTPUT_H;
        let sx = 0, sy = 0, sw = vw, sh = vh;
        if (vAspect > dstAspect) {
            sw = vh * dstAspect;
            sx = (vw - sw) / 2;
        } else {
            sh = vw / dstAspect;
            sy = (vh - sh) / 2;
        }
        if (currentFacingMode === 'user') {
            ctx.translate(OUTPUT_W, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(webcamElement, sx, sy, sw, sh, 0, 0, OUTPUT_W, OUTPUT_H);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        } else {
            ctx.drawImage(webcamElement, sx, sy, sw, sh, 0, 0, OUTPUT_W, OUTPUT_H);
        }
    }
    
    // Pemrosesan Filter Efek Piksel Berdasarkan Variabel Terpilih
    if (selectedFilter === 'glowing' || selectedFilter === 'flawless') {
        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = canvasElement.width;
        blurCanvas.height = canvasElement.height;
        const blurCtx = blurCanvas.getContext('2d');
        blurCtx.drawImage(canvasElement, 0, 0);
        
        ctx.save();
        ctx.globalCompositeOperation = 'soft-light'; 
        ctx.globalAlpha = 0.25; 
        ctx.filter = 'blur(2px)'; 
        ctx.drawImage(blurCanvas, 0, 0);
        ctx.restore();
    }

    const imgData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const data = imgData.data;
    
    if (selectedFilter === 'glowing') {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.15 + 10);
            data[i+1] = Math.min(255, data[i+1] * 1.12 + 10);
            data[i+2] = Math.min(255, data[i+2] * 1.08 + 5);
        }
    } else if (selectedFilter === 'flawless') {
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i], g = data[i+1], b = data[i+2];
            data[i] = Math.min(255, r * 1.18 + 12);
            data[i+1] = Math.min(255, g * 1.08 + 5);
            data[i+2] = Math.min(255, b * 1.12 + 8);
        }
    } else if (selectedFilter === 'warm') {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.15); data[i+1] = Math.min(255, data[i+1] * 1.05); data[i+2] = data[i+2] * 0.9;
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

    // === POLAROID CANVAS STRUCTURE ===
    // Canvas total = foto area + strip bawah
    // Foto area: OUTPUT_W x OUTPUT_H (960x1280, 3:4)
    // Strip bawah: OUTPUT_W x STRIP_H
    // Kita rebuild canvas dengan tinggi total = OUTPUT_H + STRIP_H

    const STRIP_H = Math.round(OUTPUT_W * 0.28); // strip ~27% lebar
    const BORDER  = Math.round(OUTPUT_W * 0.04); // border tipis kiri/kanan/atas

    // Simpan foto hasil filter
    const photoSnap = document.createElement('canvas');
    photoSnap.width  = OUTPUT_W;
    photoSnap.height = OUTPUT_H;
    photoSnap.getContext('2d').drawImage(canvasElement, 0, 0);

    // Resize canvas jadi polaroid penuh
    const totalH = OUTPUT_H + STRIP_H;
    canvasElement.width  = OUTPUT_W;
    canvasElement.height = totalH;
    const ctx2 = canvasElement.getContext('2d');

    let borderColors  = { dark: '#1c1917', classic: '#ffffff', romantic: '#ffe4e6' };
    let textColors    = { dark: '#fbbf24', classic: '#1c1917', romantic: '#be123c' };
    let subTextColors = { dark: '#a8a29e', classic: '#57534e', romantic: '#9f1239' };
    let bgStripColors = { dark: '#1c1917', classic: '#ffffff', romantic: '#ffe4e6' };

    // Fill background warna frame
    ctx2.fillStyle = borderColors[selectedFrameStyle];
    ctx2.fillRect(0, 0, OUTPUT_W, totalH);

    // Gambar foto (dengan border kiri/kanan/atas dari frame)
    ctx2.drawImage(photoSnap, BORDER, BORDER, OUTPUT_W - BORDER*2, OUTPUT_H - BORDER);

    // Fill strip bawah
    ctx2.fillStyle = bgStripColors[selectedFrameStyle];
    ctx2.fillRect(0, OUTPUT_H, OUTPUT_W, STRIP_H);

    // Dekor teks strip
    let decorSet = {
        dark:     { topL: "✨ ✦", topR: "✦ ✨", bottom: "✨ 👑 ✨" },
        classic:  { topL: "🌸 ✦", topR: "✦ 🌸", bottom: "✨ 💕 ✨" },
        romantic: { topL: "❤️ ✦", topR: "✦ ❤️", bottom: "🎈 ❤️ 🎈" }
    };
    const decor = decorSet[selectedFrameStyle];
    const stripMidY = OUTPUT_H + STRIP_H / 2;
    const emojiSize = Math.round(OUTPUT_W * 0.032);

    ctx2.font = `${emojiSize}px Arial`;
    ctx2.fillStyle = textColors[selectedFrameStyle];
    ctx2.textAlign = 'left';
    ctx2.fillText(decor.topL, BORDER + 10, OUTPUT_H + emojiSize + 8);
    ctx2.textAlign = 'right';
    ctx2.fillText(decor.topR, OUTPUT_W - BORDER - 10, OUTPUT_H + emojiSize + 8);

    // Gambar ilustrasi pengantin di sisi kiri strip
    const assetSize = Math.round(STRIP_H * 0.85);
    const assetX = BORDER + 8;
    const assetY = OUTPUT_H + (STRIP_H - assetSize) / 2;
    if (loadedWeddingAsset.complete && loadedWeddingAsset.naturalWidth > 0) {
        ctx2.drawImage(loadedWeddingAsset, assetX, assetY, assetSize, assetSize);
    }

    // Teks nama & tanggal — di sebelah kanan ilustrasi
    const textX = assetX + assetSize + 16;
    document.fonts.load(`italic ${Math.round(OUTPUT_W * 0.072)}px 'Great Vibes'`).then(() => {
        ctx2.fillStyle = textColors[selectedFrameStyle];
        ctx2.font = `italic ${Math.round(OUTPUT_W * 0.072)}px 'Great Vibes', cursive`;
        ctx2.textAlign = 'left';
        ctx2.fillText("Sabrina & Raka", textX, stripMidY + 8);

        ctx2.fillStyle = subTextColors[selectedFrameStyle];
        ctx2.font = `bold ${Math.round(OUTPUT_W * 0.022)}px sans-serif`;
        ctx2.fillText("29.05.2026", textX, stripMidY + Math.round(OUTPUT_W * 0.042));
        ctx2.fillText("HAPPY EVER AFTER", textX, stripMidY + Math.round(OUTPUT_W * 0.068));

        ctx2.font = `${emojiSize}px Arial`;
        ctx2.fillStyle = textColors[selectedFrameStyle];
        ctx2.textAlign = 'center';
        ctx2.fillText(decor.bottom, OUTPUT_W / 2, OUTPUT_H + STRIP_H - 10);

        canvasElement.toBlob((blob) => { currentPhotoBlob = blob; }, 'image/png');
    });

    // Sembunyikan safe zone & strip HTML saat preview foto (canvas sudah include strip)
    document.getElementById('safeZoneGuide').classList.add('hidden');
    document.getElementById('frameUI').classList.add('hidden');
    document.getElementById('frameBorderTop').classList.add('hidden');
    document.getElementById('frameBorderBottom').classList.add('hidden');
    // Sembunyikan seluruh cameraViewport (live frame), tampilkan canvas polaroid standalone
    document.getElementById('cameraViewport').classList.add('hidden');
    canvasElement.classList.remove('hidden');
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
    galleryInput.value = ""; // Bersihkan berkas terunggah lama
    uploadedImageElement = null;
    webcamElement.classList.remove('hidden'); canvasElement.classList.add('hidden');
    preCaptureAction.classList.remove('hidden'); afterCaptureBtn.classList.add('hidden');
    document.getElementById('cameraViewport').classList.remove('hidden');
    const sgGuide = document.getElementById('safeZoneGuide');
    if (sgGuide) sgGuide.classList.remove('hidden');
    const frameUI = document.getElementById('frameUI');
    if (frameUI) frameUI.classList.remove('hidden');
    const fTop = document.getElementById('frameBorderTop');
    if (fTop) fTop.classList.remove('hidden');
    const fBot = document.getElementById('frameBorderBottom');
    if (fBot) fBot.classList.remove('hidden');
}

retakeBtn.addEventListener('click', () => {
    resetBooth();
    startWebcam(); // Hidupkan ulang webcam saat ulangi/retake ditekan
});

document.addEventListener('DOMContentLoaded', () => { 
    renderGallery();

    // Fullscreen polaroid preview saat canvas diklik
    canvasElement.addEventListener('click', () => {
        const fullscreenModal = document.getElementById('fullscreenModal');
        const fullscreenImg   = document.getElementById('fullscreenImg');
        fullscreenImg.src = canvasElement.toDataURL('image/png');
        fullscreenModal.classList.remove('hidden');
    });

    document.getElementById('closeFullscreenBtn').addEventListener('click', () => {
        document.getElementById('fullscreenModal').classList.add('hidden');
    });
});
