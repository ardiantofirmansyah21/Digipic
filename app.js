// Pengikatan Elemen DOM Utama
const startBoothBtn = document.getElementById('startBoothBtn');
const boothModal = document.getElementById('booth-modal');
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
const scrollToGalleryBtn = document.getElementById('scrollToGalleryBtn');

let mediaRecorder;
let audioChunks = [];
let currentAudioBlob = null;
let currentPhotoBlob = null;

const galleryModal = document.getElementById('galleryModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalImg = document.getElementById('modalImg');
const modalAudio = document.getElementById('modalAudio');
const noAudioTxt = document.getElementById('noAudioTxt');
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
const switchCameraBtn = document.getElementById('switchCameraBtn');
const closeBoothBtn = document.getElementById('closeBoothBtn');
const nameInputModal = document.getElementById('nameInputModal');
const cancelUploadBtn = document.getElementById('cancelUploadBtn');
const guestNameInput = document.getElementById('guestNameInput');
const flashEffect = document.getElementById('flashEffect');
const successToast = document.getElementById('successToast');
const triggerUploadModalBtn = document.getElementById('triggerUploadModalBtn');

const triggerGalleryBtn = document.getElementById('triggerGalleryBtn');
const galleryInput = document.getElementById('galleryInput');

const photoPreviewContainer = document.getElementById('photoPreviewContainer');
const previewImage = document.getElementById('previewImage');

// State Global Kontrol Aplikasi
let selectedFrameStyle = 'dark'; 
let selectedFilter = 'normal';
let currentFacingMode = 'user'; 
let currentStream = null;
let uploadedImageElement = null; 

// Memuat Gambar Aset Pengantin
let loadedWeddingAsset = new Image();
loadedWeddingAsset.src = "pengantin.png"; 

// Data Gallery Awal (Dummy)
let galleryData = [
    { id: "dummy-1", photoUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=400&auto=format&fit=crop", audioUrl: null, label: "✨ Oleh: Keluarga Pengantin" },
    { id: "dummy-2", photoUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=400&auto=format&fit=crop", audioUrl: null, label: "✨ Doa Terbaik untuk Kalian" }
];
let activeSelectedId = null;

// Fungsi Scroll Halus ke Galeri
scrollToGalleryBtn.addEventListener('click', () => {
    document.getElementById('gallery-section').scrollIntoView({ behavior: 'smooth' });
});

triggerUploadModalBtn.addEventListener('click', () => {
    nameInputModal.classList.remove('hidden');
    guestNameInput.focus();
});
cancelUploadBtn.addEventListener('click', () => nameInputModal.classList.add('hidden'));

closeBoothBtn.addEventListener('click', () => {
    stopWebcamStream();
    boothModal.classList.add('hidden');
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
    boothModal.classList.remove('hidden');
    resetBooth();
    startWebcam();
});

triggerGalleryBtn.addEventListener('click', () => galleryInput.click());

galleryInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        stopWebcamStream(); 
        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedImageElement = new Image();
            uploadedImageElement.onload = function() {
                boothModal.classList.remove('hidden'); // Tetap jalankan di dalam layar popup khusus
                preCaptureAction.classList.add('hidden'); 
                switchCameraBtn.classList.add('hidden');
                closeBoothBtn.classList.add('hidden'); 
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
    
    document.getElementById('webcam-container').style.setProperty('display', 'block', 'important');
    document.getElementById('webcam-container').classList.remove('hidden');
    webcamElement.classList.remove('hidden');
    frameUI.classList.remove('hidden'); 
    
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
        alert("Akses kamera ditolak atau perangkat tidak mendukung.");
    }
}

window.changeFilter = function(filterType) {
    selectedFilter = filterType;
    webcamElement.className = `w-full h-full object-cover ${currentFacingMode === 'user' ? 'transform -scale-x-100' : ''} filter-${filterType}`;
};

window.changeFrameStyle = function(style) {
    selectedFrameStyle = style;
    if (style === 'dark') {
        frameUI.style.borderColor = '#0c0a09';
        decorTop.innerHTML = "<span>✨ ✦</span><span>✦ ✨</span>";
        decorBottom.innerHTML = "<span>✨ 👑 ✨</span>";
        frameCardInner.className = "w-full bg-stone-950/95 backdrop-blur-xs px-3 py-2 rounded-xl border border-stone-800/60 text-center flex flex-col items-center";
        weddingTitle.className = "font-handwriting text-xl text-amber-400 font-bold leading-none";
        weddingDate.className = "text-[6px] text-stone-400 font-medium tracking-widest uppercase mt-0.5";
    } else if (style === 'classic') {
        frameUI.style.borderColor = '#ffffff';
        decorTop.innerHTML = "<span>🌸 ✦</span><span>✦ 🌸</span>";
        decorBottom.innerHTML = "<span>✨ 💕 ✨</span>";
        frameCardInner.className = "w-full bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl border border-stone-200 text-center flex flex-col items-center";
        weddingTitle.className = "font-handwriting text-xl text-stone-900 font-bold leading-none";
        weddingDate.className = "text-[6px] text-stone-500 font-medium tracking-widest uppercase mt-0.5";
    } else if (style === 'romantic') {
        frameUI.style.borderColor = '#ffe4e6';
        decorTop.innerHTML = "<span>❤️ ✦</span><span>✦ ❤️</span>";
        decorBottom.innerHTML = "<span>🎈 ❤️ 🎈</span>";
        frameCardInner.className = "w-full bg-rose-50/95 backdrop-blur-xs px-3 py-2 rounded-xl border border-rose-200 text-center flex flex-col items-center";
        weddingTitle.className = "font-handwriting text-xl text-rose-700 font-bold leading-none";
        weddingDate.className = "text-[6px] text-rose-900/60 font-medium tracking-widest uppercase mt-0.5";
    }
};

captureBtn.addEventListener('click', () => {
    preCaptureAction.classList.add('hidden'); 
    switchCameraBtn.classList.add('hidden');
    closeBoothBtn.classList.add('hidden'); 
    
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
});

function triggerFlashAndCapture() {
    flashEffect.classList.remove('hidden');
    flashEffect.style.opacity = '1';
    
    setTimeout(() => {
        flashEffect.style.opacity = '0';
        setTimeout(() => { flashEffect.classList.add('hidden'); }, 150);
        captureImage(false); 
    }, 300);
}

function captureImage(isUploadedMode = false) {
    const ctx = canvasElement.getContext('2d');
    
    document.getElementById('webcam-container').style.setProperty('display', 'none', 'important');
    document.getElementById('webcam-container').classList.add('hidden');
    frameUI.classList.add('hidden'); 
    webcamElement.classList.add('hidden');

    if (isUploadedMode && uploadedImageElement) {
        canvasElement.width = 720;
        canvasElement.height = 960;
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        ctx.drawImage(uploadedImageElement, 0, 0, canvasElement.width, canvasElement.height);
    } else {
        webcamElement.pause(); 
        const vWidth = webcamElement.videoWidth || 640;
        const vHeight = webcamElement.videoHeight || 480;
        
        canvasElement.width = 720;
        canvasElement.height = 960;
        
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        ctx.save();
        
        if (currentFacingMode === 'user') {
            ctx.translate(canvasElement.width, 0);
            ctx.scale(-1, 1);
        }
        
        const scale = Math.max(canvasElement.width / vWidth, canvasElement.height / vHeight);
        const x = (canvasElement.width / 2) - (vWidth / 2) * scale;
        const y = (canvasElement.height / 2) - (vHeight / 2) * scale;
        ctx.drawImage(webcamElement, x, y, vWidth * scale, vHeight * scale);
        ctx.restore();
        
        stopWebcamStream();
    }
    
    const imgData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const data = imgData.data;
    
    if (selectedFilter === 'glowing') {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.12 + 10);
            data[i+1] = Math.min(255, data[i+1] * 1.10 + 10);
            data[i+2] = Math.min(255, data[i+2] * 1.05 + 5);
        }
    } else if (selectedFilter === 'flawless') {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.15 + 15);
            data[i+1] = Math.min(255, data[i+1] * 1.06 + 5);
            data[i+2] = Math.min(255, data[i+2] * 1.10 + 8);
        }
    } else if (selectedFilter === 'warm') {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.12); data[i+1] = Math.min(255, data[i+1] * 1.03); data[i+2] = data[i+2] * 0.88;
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

    requestAnimationFrame(() => {
        drawCanvasFrame(ctx);
    });
}

function drawCanvasFrame(ctx) {
    let borderColors = { dark: '#0c0a09', classic: '#ffffff', romantic: '#ffe4e6' };
    let textColors = { dark: '#fbbf24', classic: '#1c1917', romantic: '#be123c' };
    let subTextColors = { dark: '#a8a29e', classic: '#57534e', romantic: '#9f1239' };
    let bgBoxColors = { dark: 'rgba(12, 10, 9, 0.95)', classic: 'rgba(255, 255, 255, 0.95)', romantic: 'rgba(255, 241, 242, 0.95)' };

    const borderWidth = canvasElement.width * 0.045; 
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColors[selectedFrameStyle];
    ctx.strokeRect(borderWidth/2, borderWidth/2, canvasElement.width - borderWidth, canvasElement.height - borderWidth);

    const boxHeight = canvasElement.height * 0.125; 
    const boxY = canvasElement.height - boxHeight - borderWidth - (canvasElement.height * 0.025);
    const boxX = borderWidth + (canvasElement.width * 0.05);
    const boxWidth = canvasElement.width - (boxX * 2);

    const assetSize = canvasElement.width * 0.18; 
    const assetX = (canvasElement.width / 2) - (assetSize / 2);
    const paddingCropOffset = assetSize * 0.18; 
    const assetY = boxY - assetSize + paddingCropOffset; 

    if (loadedWeddingAsset.complete && loadedWeddingAsset.naturalWidth > 0) {
        ctx.drawImage(loadedWeddingAsset, assetX, assetY, assetSize, assetSize);
    }

    ctx.fillStyle = bgBoxColors[selectedFrameStyle];
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = selectedFrameStyle === 'dark' ? '#292524' : '#e7e5e4';
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    let decorSet = {
        dark: { topL: "✨ ✦", topR: "✦ ✨", bottom: "✨ 👑 ✨" },
        classic: { topL: "🌸 ✦", topR: "✦ 🌸", bottom: "✨ 💕 ✨" },
        romantic: { topL: "❤️ ✦", topR: "✦ ❤️", bottom: "🎈 ❤️ 🎈" }
    };
    let currentDecor = decorSet[selectedFrameStyle];

    ctx.fillStyle = textColors[selectedFrameStyle];
    ctx.font = `${canvasElement.width * 0.030}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(currentDecor.topL, boxX + 16, boxY + (canvasElement.height * 0.026));
    ctx.textAlign = 'right';
    ctx.fillText(currentDecor.topR, boxX + boxWidth - 16, boxY + (canvasElement.height * 0.026));
    ctx.textAlign = 'center';
    ctx.fillText(currentDecor.bottom, canvasElement.width / 2, boxY + boxHeight - (canvasElement.height * 0.012));

    ctx.fillStyle = textColors[selectedFrameStyle];
    ctx.font = `italic ${canvasElement.width * 0.065}px 'Great Vibes', cursive`; 
    ctx.textAlign = 'center';
    ctx.fillText("Sabrina & Raka", canvasElement.width / 2, boxY + (boxHeight / 1.55));
    
    ctx.fillStyle = subTextColors[selectedFrameStyle];
    ctx.font = `bold ${canvasElement.width * 0.020}px sans-serif`;
    ctx.fillText("29.05.2026 — HAPPY EVER AFTER", canvasElement.width / 2, boxY + (boxHeight / 1.14));

    setTimeout(() => {
        const dataUrl = canvasElement.toDataURL('image/png');
        previewImage.src = dataUrl;
        
        photoPreviewContainer.classList.remove('hidden'); 
        photoPreviewContainer.style.setProperty('display', 'flex', 'important');

        canvasElement.toBlob((blob) => { 
            currentPhotoBlob = blob; 
            afterCaptureBtn.classList.remove('hidden');
            initAudioRecorder();
        }, 'image/png');
    }, 100);
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
        console.log("Akses mikrofon dilewati.");
    }
}

recordBtn.addEventListener('click', () => {
    if (!mediaRecorder) return alert("Izin mikrofon belum aktif.");
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
        card.className = "bg-white p-2 rounded-xl border border-stone-200 cursor-pointer shadow-xs transform hover:scale-[1.02] transition-all";
        card.addEventListener('click', () => openGalleryModal(item.id));
        card.innerHTML = `<div class='overflow-hidden rounded-lg aspect-[3/4]'><img src='${item.photoUrl}' class='w-full h-full object-cover' alt='photo'></div><p class='text-[9px] font-medium text-stone-600 text-center mt-2 truncate px-1 pt-0.5'>${item.label}</p>`;
        weddingGalleryGrid.appendChild(card);
    });
}

uploadWeddingBtn.addEventListener('click', () => {
    const namaTamu = guestNameInput.value.trim();
    if (namaTamu === "") { alert("Nama tidak boleh kosong!"); guestNameInput.focus(); return; }

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
        boothModal.classList.add('hidden'); 
        
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
    if (confirm("Apakah Anda yakin ingin menghapus foto kenangan ini?")) { 
        galleryData = galleryData.filter(p => p.id !== activeSelectedId); 
        renderGallery(); 
        galleryModal.classList.add('hidden'); 
    } 
});

function resetBooth() {
    audioPlayback.classList.add('hidden'); 
    audioPlayback.src = ""; 
    currentAudioBlob = null;
    recordStatus.innerText = "Belum merekam"; 
    recordBtn.innerText = "Mulai Rekam";
    uploadWeddingBtn.innerText = "Kirim 🚀"; 
    uploadWeddingBtn.disabled = false;
    guestNameInput.value = "";
    galleryInput.value = ""; 
    uploadedImageElement = null;
    
    if (previewImage) {
        previewImage.removeAttribute('src');
        previewImage.src = "";
    }
    
    if (photoPreviewContainer) {
        photoPreviewContainer.classList.add('hidden');
        photoPreviewContainer.style.setProperty('display', 'none', 'important');
    }

    document.getElementById('webcam-container').classList.remove('hidden');
    document.getElementById('webcam-container').style.setProperty('display', 'block', 'important');
    webcamElement.classList.remove('hidden'); 
    webcamElement.style.setProperty('display', 'block', 'important');
    frameUI.classList.remove('hidden');

    canvasElement.classList.add('hidden');
    preCaptureAction.classList.remove('hidden'); 
    afterCaptureBtn.classList.add('hidden');
    switchCameraBtn.classList.remove('hidden');
    closeBoothBtn.classList.remove('hidden'); 
}

retakeBtn.addEventListener('click', () => {
    resetBooth();
    setTimeout(() => { startWebcam(); }, 50);
});

document.addEventListener('DOMContentLoaded', () => { 
    renderGallery(); 
    if (document.fonts) { document.fonts.load("italic 40px 'Great Vibes'"); }
});
