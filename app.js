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

// Tombol Utama Buka Modul Kamera Photobooth
startBoothBtn.addEventListener('click', () => {
    boothSection.classList.remove('hidden');
    startWebcam();
});

// Handler Trigger klik untuk memilih berkas dari galeri handphone
triggerGalleryBtn.addEventListener('click', () => {
    galleryInput.click();
});

// Fungsi penanganan file gambar yang dipilih dari galeri perangkat luar
galleryInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        stopWebcamStream(); // Matikan kamera agar tidak tabrakan memory saat load file besar
        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedImageElement = new Image();
            uploadedImageElement.onload = function() {
                preCaptureAction.classList.add('hidden'); 
                switchCameraBtn.classList.add('hidden');
                closeBoothBtn.classList.add('hidden'); 
                settingsModal.classList.add('hidden');
                
                // Panggil proses canvas khusus mode galeri
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
        frameUI.style.borderColor = '#1c1917';
        decorTop.innerHTML = "<span>✨ ✦</span><span>✦ ✨</span>";
        decorBottom.innerHTML = "<span>✨ 👑 ✨</span>";
        frameCardInner.className = "w-full bg-stone-950/80 backdrop-blur-md px-6 py-3 rounded-xl border border-stone-800 shadow-xl text-center z-20";
        weddingTitle.className = "font-handwriting text-3xl text-amber-400 font-bold tracking-wide leading-none my-0.5";
        weddingDate.className = "text-[8px] text-stone-400 font-semibold tracking-widest mt-1";
    } else if (style === 'classic') {
        frameUI.style.borderColor = '#ffffff';
        decorTop.innerHTML = "<span>🌸 ✦</span><span>✦ 🌸</span>";
        decorBottom.innerHTML = "<span>✨ 💕 ✨</span>";
        frameCardInner.className = "w-full bg-white/75 backdrop-blur-md px-6 py-3 rounded-xl border border-stone-200 shadow-xl text-center z-20";
        weddingTitle.className = "font-handwriting text-3xl text-stone-900 font-bold tracking-wide leading-none my-0.5";
        weddingDate.className = "text-[8px] text-stone-500 font-semibold tracking-widest mt-1";
    } else if (style === 'romantic') {
        frameUI.style.borderColor = '#ffe4e6';
        decorTop.innerHTML = "<span>❤️ ✦</span><span>✦ ❤️</span>";
        decorBottom.innerHTML = "<span>🎈 ❤️ 🎈</span>";
        frameCardInner.className = "w-full bg-rose-50/80 backdrop-blur-md px-6 py-3 rounded-xl border border-rose-200 shadow-xl text-center z-20";
        weddingTitle.className = "font-handwriting text-3xl text-rose-700 font-bold tracking-wide leading-none my-0.5";
        weddingDate.className = "text-[8px] text-rose-900/60 font-semibold tracking-widest mt-1";
    }
};

captureBtn.addEventListener('click', () => {
    preCaptureAction.classList.add('hidden'); 
    switchCameraBtn.classList.add('hidden');
    closeBoothBtn.classList.add('hidden'); 
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
        captureImage(false); 
    }, 400);
}

// ==========================================
// PERBAIKAN LOGIKA DETEKSI JALUR FOTO/GALERI
// ==========================================
function captureImage(isUploadedMode = false) {
    const ctx = canvasElement.getContext('2d');
    
    // Matikan visibilitas preview video, nyalakan layar canvas statis
    webcamElement.classList.add('hidden');
    canvasElement.classList.remove('hidden');

    if (isUploadedMode && uploadedImageElement) {
        // --- JALUR 1: JIKA MENGGUNAKAN FOTO DARI GALERI ---
        const maxDimension = 1280;
        let targetWidth = uploadedImageElement.width;
        let targetHeight = uploadedImageElement.height;
        
        if (targetWidth > maxDimension || targetHeight > maxDimension) {
            if (targetWidth > targetHeight) {
                targetHeight = (maxDimension / targetWidth) * targetHeight;
                targetWidth = maxDimension;
            } else {
                targetWidth = (maxDimension / targetHeight) * targetWidth;
                targetHeight = maxDimension;
            }
        }
        
        // Atur dimensi canvas pas sesuai aspek rasio gambar galeri
        canvasElement.width = targetWidth;
        canvasElement.height = targetHeight;
        
        // Gambar foto galeri ke canvas
        ctx.drawImage(uploadedImageElement, 0, 0, canvasElement.width, canvasElement.height);
    } else {
        // --- JALUR 2: JIKA MENGGUNAKAN TAKE PICTURE KAMERA ---
        webcamElement.pause(); // Bekukan video stream internal
        
        canvasElement.width = webcamElement.videoWidth || 640;
        canvasElement.height = webcamElement.videoHeight || 480;
        
        if (currentFacingMode === 'user') {
            ctx.translate(canvasElement.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(webcamElement, 0, 0, canvasElement.width, canvasElement.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Matikan sensor hardware kamera karena gambar sudah sukses disalin
        stopWebcamStream();
    }
    
    // Pemrosesan Filter Efek Piksel
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

    // Lanjutkan membuat dekorasi bingkai pernikahan di atasnya
    drawCanvasFrame(ctx);
}

function drawCanvasFrame(ctx) {
    let borderColors = { dark: '#1c1917', classic: '#ffffff', romantic: '#ffe4e6' };
    let textColors = { dark: '#fbbf24', classic: '#1c1917', romantic: '#be123c' };
    let subTextColors = { dark: '#a8a29e', classic: '#57534e', romantic: '#9f1239' };
    let bgBoxColors = { dark: 'rgba(28, 25, 23, 0.85)', classic: 'rgba(255, 255, 255, 0.8)', romantic: 'rgba(255, 241, 242, 0.85)' };

    const borderWidth = canvasElement.width * 0.04;
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColors[selectedFrameStyle];
    ctx.strokeRect(borderWidth/2, borderWidth/2, canvasElement.width - borderWidth, canvasElement.height - borderWidth);

    const boxHeight = canvasElement.height * 0.16;
    const boxY = canvasElement.height - boxHeight - borderWidth - (canvasElement.height * 0.04);
    const boxX = borderWidth + (canvasElement.width * 0.08);
    const boxWidth = canvasElement.width - (boxX * 2);

    const assetSize = canvasElement.width * 0.26;
    const assetX = (canvasElement.width / 2) - (assetSize / 2);
    const assetY = boxY - assetSize + (canvasElement.height * 0.04);

    if (loadedWeddingAsset.complete && loadedWeddingAsset.naturalWidth > 0) {
        ctx.drawImage(loadedWeddingAsset, assetX, assetY, assetSize, assetSize);
    }

    ctx.fillStyle = bgBoxColors[selectedFrameStyle];
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    let decorSet = {
        dark: { topL: "✨ ✦", topR: "✦ ✨", bottom: "✨ 👑 ✨" },
        classic: { topL: "🌸 ✦", topR: "✦ 🌸", bottom: "✨ 💕 ✨" },
        romantic: { topL: "❤️ ✦", topR: "✦ ❤️", bottom: "🎈 ❤️ 🎈" }
    };
    let currentDecor = decorSet[selectedFrameStyle];

    ctx.fillStyle = textColors[selectedFrameStyle];
    ctx.font = `${canvasElement.width * 0.035}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(currentDecor.topL, boxX + 15, boxY + (canvasElement.height * 0.035));
    ctx.textAlign = 'right';
    ctx.fillText(currentDecor.topR, boxX + boxWidth - 15, boxY + (canvasElement.height * 0.035));
    ctx.textAlign = 'center';
    ctx.fillText(currentDecor.bottom, canvasElement.width / 2, boxY + boxHeight - (canvasElement.height * 0.02));

    // Menulis teks secara langsung memanfaatkan font yang telah dimuat di awal
    ctx.fillStyle = textColors[selectedFrameStyle];
    ctx.font = `italic ${canvasElement.width * 0.085}px 'Great Vibes', cursive`; 
    ctx.textAlign = 'center';
    ctx.fillText("Sabrina & Raka", canvasElement.width / 2, boxY + (boxHeight / 1.75));
    
    ctx.fillStyle = subTextColors[selectedFrameStyle];
    ctx.font = `bold ${canvasElement.width * 0.023}px sans-serif`;
    ctx.fillText("29.05.2026 — HAPPY EVER AFTER", canvasElement.width / 2, boxY + (boxHeight / 1.25));

    canvasElement.toBlob((blob) => { 
        currentPhotoBlob = blob; 
        afterCaptureBtn.classList.remove('hidden');
        initAudioRecorder();
    }, 'image/png');
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

modalDeleteBtn.addEventListener('click', () => { 
    if (confirm("Apakah Anda yakin ingin menghapus kenangan foto ini?")) { 
        galleryData = galleryData.filter(p => p.id !== activeSelectedId); 
        renderGallery(); 
        galleryModal.classList.add('hidden'); 
    } 
});

function resetBooth() {
    audioPlayback.classList.add('hidden'); audioPlayback.src = ""; currentAudioBlob = null;
    recordStatus.innerText = "Belum merekam"; recordBtn.innerText = "Mulai Rekam";
    uploadWeddingBtn.innerText = "Kirim 🚀"; uploadWeddingBtn.disabled = false;
    guestNameInput.value = "";
    galleryInput.value = ""; 
    uploadedImageElement = null;
    webcamElement.classList.remove('hidden'); canvasElement.classList.add('hidden');
    preCaptureAction.classList.remove('hidden'); afterCaptureBtn.classList.add('hidden');
    switchCameraBtn.classList.remove('hidden');
    closeBoothBtn.classList.remove('hidden'); 
}

retakeBtn.addEventListener('click', () => {
    resetBooth();
    startWebcam(); 
});

document.addEventListener('DOMContentLoaded', () => { 
    renderGallery(); 
    if (document.fonts) {
        document.fonts.load("italic 40px 'Great Vibes'");
    }
});
