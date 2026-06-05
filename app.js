// ==========================================
// KONFIGURASI DATABASE SUPABASE
// ==========================================
const SUPABASE_URL = "https://fehdsbsdjcyifefsqnzm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ugGoNz1zo28WdTvb7iI64Q_9lw5-dd1";

let supabase = null;

// Inisialisasi Supabase Client dengan aman tanpa merusak UI web utama
try {
    if (typeof supabase === 'undefined' && typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else if (typeof Supabase !== 'undefined') {
        supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (error) {
    console.warn("Supabase SDK belum siap. Berjalan dalam mode Local Fallback.", error);
}

// Pengikatan Elemen DOM Utama
const startBoothBtn = document.getElementById('startBoothBtn');
const boothSection = document.getElementById('booth-section');
const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('photoCanvas');
const canvasContainer = document.getElementById('canvasContainer'); 
const captureBtn = document.getElementById('captureBtn');
const afterCaptureBtn = document.getElementById('afterCaptureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const shareBtn = document.getElementById('shareBtn');
const downloadBtn = document.getElementById('downloadBtn');
const uploadWeddingBtn = document.getElementById('uploadWeddingBtn');
const weddingGalleryGrid = document.getElementById('weddingGalleryGrid');

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

const triggerGalleryBtn = document.getElementById('triggerGalleryBtn');
const galleryInput = document.getElementById('galleryInput');

let selectedFrameStyle = 'dark'; 
let selectedFilter = 'normal';
let useTimer = true; 
let currentFacingMode = 'user'; 
let currentStream = null;
let uploadedImageElement = null;

let loadedWeddingAsset = new Image();
loadedWeddingAsset.src = "pengantin.png"; 

let galleryData = [
    { id: "dummy-1", photoUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=400&auto=format&fit=crop", audioUrl: null, label: "✨ Oleh: Keluarga Pengantin" },
    { id: "dummy-2", photoUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=400&auto=format&fit=crop", audioUrl: null, label: "✨ Doa Terbaik untuk Kalian" }
];
let activeSelectedId = null;

// EVENT LISTENERS MANAGEMENT
if (openSettingsBtn) openSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

if (triggerUploadModalBtn) {
    triggerUploadModalBtn.addEventListener('click', () => {
        nameInputModal.classList.remove('hidden');
        guestNameInput.focus();
    });
}
if (cancelUploadBtn) cancelUploadBtn.addEventListener('click', () => nameInputModal.classList.add('hidden'));

if (closeBoothBtn) {
    closeBoothBtn.addEventListener('click', () => {
        stopWebcamStream();
        settingsModal.classList.add('hidden');
        boothSection.classList.add('hidden');
        resetBooth();
    });
}

function stopWebcamStream() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}

if (switchCameraBtn) {
    switchCameraBtn.addEventListener('click', () => {
        currentFacingMode = (currentFacingMode === 'user') ? 'environment' : 'user';
        if (currentFacingMode === 'user') {
            webcamElement.classList.add('transform', '-scale-x-100');
        } else {
            webcamElement.classList.remove('transform', '-scale-x-100');
        }
        startWebcam();
    });
}

if (startBoothBtn) {
    startBoothBtn.addEventListener('click', () => {
        boothSection.classList.remove('hidden');
        startWebcam();
    });
}

if (triggerGalleryBtn) {
    triggerGalleryBtn.addEventListener('click', () => {
        galleryInput.click();
    });
}

if (galleryInput) {
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
                    frameUI.classList.add('hidden'); 
                    captureImage(true); 
                };
                uploadedImageElement.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

async function startWebcam() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    uploadedImageElement = null;
    try {
        const constraints = {
            video: { facingMode: currentFacingMode, width: { ideal: 1024 }, height: { ideal: 768 } },
            audio: false
        };
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        webcamElement.srcObject = currentStream;
        webcamElement.onloadedmetadata = () => {
            webcamElement.play().catch(e => console.log("Autoplay diblokir:", e));
        };
    } catch (err) {
        alert("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.");
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
    if (event && event.currentTarget) {
        event.currentTarget.className = "bg-amber-500 border border-amber-500 text-[10px] py-1.5 rounded-lg font-medium text-stone-950";
    }
    webcamElement.className = `w-full h-full object-contain ${currentFacingMode === 'user' ? 'transform -scale-x-100' : ''} filter-${filterType}`;
};

window.changeFrameStyle = function(style) {
    selectedFrameStyle = style;
    const buttons = frameSelector.getElementsByTagName('button');
    for (let btn of buttons) {
        btn.className = "bg-stone-900/80 border border-stone-700/60 text-[10px] py-2 rounded-xl font-medium text-stone-300";
    }
    if (event && event.currentTarget) {
        event.currentTarget.className = "bg-amber-500 border border-amber-500 text-[10px] py-2 rounded-xl font-medium text-stone-950";
    }

    if (style === 'dark') {
        frameCardInner.className = "w-11/12 mx-auto bg-stone-950 bg-opacity-65 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 shadow-lg flex items-center gap-2 mb-2";
        weddingTitle.className = "font-handwriting text-base text-amber-400 font-bold tracking-wide leading-none truncate";
        weddingDate.className = "text-[7px] text-stone-300 font-medium tracking-wider mt-0.5 uppercase truncate";
    } else if (style === 'classic') {
        frameCardInner.className = "w-11/12 mx-auto bg-white bg-opacity-65 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-stone-200 shadow-lg flex items-center gap-2 mb-2";
        weddingTitle.className = "font-handwriting text-base text-stone-900 font-bold tracking-wide leading-none truncate";
        weddingDate.className = "text-[7px] text-stone-600 font-medium tracking-wider mt-0.5 uppercase truncate";
    } else if (style === 'romantic') {
        frameCardInner.className = "w-11/12 mx-auto bg-rose-50 bg-opacity-65 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-rose-200 shadow-lg flex items-center gap-2 mb-2";
        weddingTitle.className = "font-handwriting text-base text-rose-700 font-bold tracking-wide leading-none truncate";
        weddingDate.className = "text-[7px] text-rose-900/70 font-medium tracking-wider mt-0.5 uppercase truncate";
    }
};

if (captureBtn) {
    captureBtn.addEventListener('click', () => {
        preCaptureAction.classList.add('hidden'); 
        switchCameraBtn.classList.add('hidden');
        closeBoothBtn.classList.add('hidden'); 
        settingsModal.classList.add('hidden');
        frameUI.classList.add('hidden'); 
        
        if (useTimer) {
            countdownOverlay.classList.remove('hidden');
            let count = 3;
            countdownText.innerText = count;
            let timer = setInterval(() => { 
                count--; 
                if (count > 0) { countdownText.innerText = count; } 
                else { 
                    clearInterval(timer); 
                    countdownOverlay.classList.add('hidden'); 
                    triggerFlashAndCapture(); 
                } 
            }, 1000);
        } else {
            triggerFlashAndCapture();
        }
    });
}

function triggerFlashAndCapture() {
    flashEffect.classList.remove('hidden');
    flashEffect.style.opacity = '1';
    setTimeout(() => {
        flashEffect.style.opacity = '0';
        setTimeout(() => { flashEffect.classList.add('hidden'); }, 200);
        captureImage(false);
    }, 400);
}

function captureImage(isUploadedMode = false) {
    const ctx = canvasElement.getContext('2d');
    canvasElement.width = 768;
    canvasElement.height = 1024;

    if (isUploadedMode && uploadedImageElement) {
        let targetWidth = uploadedImageElement.width;
        let targetHeight = uploadedImageElement.height;
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
            data[i] = Math.min(255, data[i] * 1.15 + 10);
            data[i+1] = Math.min(255, data[i+1] * 1.06 + 5);
            data[i+2] = Math.min(255, data[i+2] * 1.10 + 6);
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

    let borderColors = { dark: '#0c0a09', classic: '#ffffff', romantic: '#ffe4e6' };
    let textColors = { dark: '#fbbf24', classic: '#1c1917', romantic: '#be123c' };
    let subTextColors = { dark: '#d6d3d1', classic: '#57534e', romantic: '#9f1239' };
    let bgBoxColors = { dark: 'rgba(12, 10, 9, 0.65)', classic: 'rgba(255, 255, 255, 0.65)', romantic: 'rgba(255, 241, 242, 0.65)' };
    let innerBorderColors = { dark: 'rgba(255,255,255,0.1)', classic: 'rgba(0,0,0,0.08)', romantic: 'rgba(255,255,255,0.2)' };

    const borderWidth = canvasElement.width * 0.025; 
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColors[selectedFrameStyle];
    ctx.strokeRect(borderWidth/2, borderWidth/2, canvasElement.width - borderWidth, canvasElement.height - borderWidth);

    const boxHeight = canvasElement.height * 0.11;
    const boxY = canvasElement.height - boxHeight - borderWidth - (canvasElement.height * 0.02);
    const boxX = borderWidth + (canvasElement.width * 0.04);
    const boxWidth = canvasElement.width - (boxX * 2);

    ctx.fillStyle = bgBoxColors[selectedFrameStyle];
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 12);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = innerBorderColors[selectedFrameStyle];
    ctx.stroke();

    const paddingBox = 12;
    const assetHeight = boxHeight - (paddingBox * 2);
    const assetWidth = assetHeight; 
    const assetX = boxX + paddingBox + 4;
    const assetY = boxY + paddingBox;

    if (loadedWeddingAsset.complete && loadedWeddingAsset.naturalWidth > 0) {
        ctx.drawImage(loadedWeddingAsset, assetX, assetY, assetWidth, assetHeight);
    }

    const contentStartX = assetX + assetWidth + 16; 
    let decorSet = {
        dark: { bottom: "✨ 💕 ✨" },
        classic: { bottom: "✨ 💕 ✨" },
        romantic: { bottom: "🎈 ❤️ 🎈" }
    };
    let currentDecor = decorSet[selectedFrameStyle];

    document.fonts.load(`italic ${canvasElement.width * 0.045}px 'Great Vibes'`).then(() => {
        ctx.fillStyle = textColors[selectedFrameStyle];
        ctx.font = `italic ${canvasElement.width * 0.045}px 'Great Vibes', cursive`; 
        ctx.textAlign = 'left';
        ctx.fillText("Sabrina & Raka", contentStartX, boxY + (boxHeight / 2.1));
        
        ctx.fillStyle = subTextColors[selectedFrameStyle];
        ctx.font = `bold ${canvasElement.width * 0.018}px sans-serif`;
        ctx.fillText("29.05.2026 — HAPPY EVER AFTER", contentStartX, boxY + (boxHeight / 1.4));

        ctx.fillStyle = textColors[selectedFrameStyle];
        ctx.font = `${canvasElement.width * 0.022}px Arial`;
        ctx.textAlign = 'right';
        ctx.fillText(currentDecor.bottom, boxX + boxWidth - paddingBox, boxY + boxHeight / 1.7);

        canvasElement.toBlob((blob) => { currentPhotoBlob = blob; }, 'image/png');
    });

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
        console.log("Mikrofon dilewati atau tidak diizinkan.");
    }
}

if (recordBtn) {
    recordBtn.addEventListener('click', () => {
        if (!mediaRecorder) return alert("Izin mikrofon diperlukan.");
        if (mediaRecorder.state === "inactive") {
            audioChunks = []; mediaRecorder.start(); recordBtn.innerText = "Stop"; recordStatus.innerText = "🔴 Merekam...";
        } else {
            mediaRecorder.stop(); recordBtn.innerText = "Rekam Ulang"; recordStatus.innerText = "Selesai!";
        }
    });
}

if (canvasContainer) {
    canvasContainer.addEventListener('click', () => {
        if (canvasElement) {
            const dataUrl = canvasElement.toDataURL('image/png');
            fullscreenImg.src = dataUrl;
            fullscreenPreviewModal.classList.remove('hidden');
        }
    });
}
if (closeFullscreenBtn) {
    closeFullscreenBtn.addEventListener('click', () => {
        fullscreenPreviewModal.classList.add('hidden');
    });
}

function triggerShare(blobFile) {
    if (!blobFile) return;
    const file = new File([blobFile], "wedding_photobooth.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file] }); }
}
function triggerDownload(blobFile) {
    if (!blobFile) return;
    const a = document.createElement('a'); a.href = URL.createObjectURL(blobFile); a.download = `booth_${Date.now()}.png`; a.click();
}
if (shareBtn) shareBtn.addEventListener('click', () => triggerShare(currentPhotoBlob));
if (downloadBtn) downloadBtn.addEventListener('click', () => triggerDownload(currentPhotoBlob));
if (modalDownloadBtn) {
    modalDownloadBtn.addEventListener('click', () => {
        const item = galleryData.find(p => p.id === activeSelectedId);
        if (item) { const a = document.createElement('a'); a.href = item.photoUrl; a.download = `wedding_${Date.now()}.png`; a.click(); }
    });
}

function renderGallery() {
    if (!weddingGalleryGrid) return;
    weddingGalleryGrid.innerHTML = "";
    galleryData.forEach(item => {
        const card = document.createElement('div');
        card.className = "bg-white p-2.5 rounded-xl shadow border border-stone-200/60 cursor-pointer transform hover:scale-[1.02] transition-all";
        card.addEventListener('click', () => openGalleryModal(item.id));
        card.innerHTML = `<div class='overflow-hidden rounded-lg aspect-[3/4]'><img src='${item.photoUrl}' class='w-full h-full object-cover' alt='photo'></div><p class='text-[9px] font-medium text-stone-500 text-center mt-2 truncate px-1'>${item.label}</p>`;
        weddingGalleryGrid.appendChild(card);
    });
}

// AMBIL DATA DARI DATABASE (TABEL: Digipic)
async function fetchGalleryFromSupabase() {
    if (!supabase) {
        renderGallery();
        return;
    }
    try {
        const { data, error } = await supabase
            .from('Digipic')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            galleryData = data.map(item => ({
                id: item.id,
                photoUrl: item.photo_url,
                audioUrl: item.audio_url,
                label: item.label
            }));
        }
        renderGallery();
    } catch (err) {
        console.error("Gagal mengambil data dari tabel Digipic:", err.message);
        renderGallery(); // Fallback ke data lokal jika ada isu tabel
    }
}

// UPLOAD DATA KE DATABASE (STORAGE BUCKET & TABEL: Digipic)
if (uploadWeddingBtn) {
    uploadWeddingBtn.addEventListener('click', async () => {
        const namaTamu = guestNameInput.value.trim();
        if (namaTamu === "") {
            alert("Nama tidak boleh kosong!");
            guestNameInput.focus();
            return;
        }

        uploadWeddingBtn.innerText = "Mengirim..."; 
        uploadWeddingBtn.disabled = true;

        const uniqueId = "photo-" + Date.now();
        const labelNama = `✨ Oleh: ${namaTamu}`;

        if (!supabase) {
            let localPhotoUrl = canvasElement.toDataURL('image/png');
            let localAudioUrl = currentAudioBlob ? URL.createObjectURL(currentAudioBlob) : null;
            
            galleryData.unshift({
                id: uniqueId,
                photoUrl: localPhotoUrl,
                audioUrl: localAudioUrl,
                label: labelNama
            });
            
            renderGallery();
            finishUploadSuccess();
            return;
        }

        try {
            let finalPhotoUrl = "";
            let finalAudioUrl = null;

            if (currentPhotoBlob) {
                const photoFileName = `${uniqueId}.png`;
                const { data: photoUpload, error: photoError } = await supabase.storage
                    .from('wedding-assets')
                    .upload(`photos/${photoFileName}`, currentPhotoBlob, { contentType: 'image/png' });

                if (photoError) throw photoError;

                const { data: publicPhotoData } = supabase.storage
                    .from('wedding-assets')
                    .getPublicUrl(`photos/${photoFileName}`);
                    
                finalPhotoUrl = publicPhotoData.publicUrl;
            }

            if (currentAudioBlob) {
                const audioFileName = `${uniqueId}.mp3`;
                const { data: audioUpload, error: audioError } = await supabase.storage
                    .from('wedding-assets')
                    .upload(`audios/${audioFileName}`, currentAudioBlob, { contentType: 'audio/mp3' });

                if (audioError) throw audioError;

                const { data: publicAudioData } = supabase.storage
                    .from('wedding-assets')
                    .getPublicUrl(`audios/${audioFileName}`);
                    
                finalAudioUrl = publicAudioData.publicUrl;
            }

            const { error: insertError } = await supabase
                .from('Digipic')
                .insert([
                    { id: uniqueId, label: labelNama, photo_url: finalPhotoUrl, audio_url: finalAudioUrl }
                ]);

            if (insertError) throw insertError;

            await fetchGalleryFromSupabase(); 
            finishUploadSuccess();

        } catch (err) {
            alert("Gagal mengunggah kenangan ke Supabase: " + err.message);
        } finally {
            uploadWeddingBtn.innerText = "Kirim 🚀"; 
            uploadWeddingBtn.disabled = false;
        }
    });
}

function finishUploadSuccess() {
    nameInputModal.classList.add('hidden');
    boothSection.classList.add('hidden'); 
    
    successToast.classList.remove('hidden');
    setTimeout(() => { successToast.classList.add('hidden'); }, 3500);

    resetBooth();
    const targetSection = document.getElementById('gallery-section');
    if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
}

function openGalleryModal(id) {
    const item = galleryData.find(p => p.id === id); 
    if (!item) return;
    
    activeSelectedId = id; 
    modalImg.src = item.photoUrl;
    
    if (item.audioUrl) { 
        modalAudio.src = item.audioUrl; 
        modalAudio.classList.remove('hidden'); 
        noAudioTxt.classList.add('hidden'); 
    } else { 
        modalAudio.src = ""; 
        modalAudio.classList.add('hidden'); 
        noAudioTxt.classList.remove('hidden'); 
    }
    
    galleryModal.classList.remove('hidden');
}

if (modalShareBtn) {
    modalShareBtn.addEventListener('click', async () => {
        const item = galleryData.find(p => p.id === activeSelectedId);
        if (!item) return;

        try {
            if (item.photoUrl.startsWith('http')) {
                modalShareBtn.innerText = "Memuat...";
                const response = await fetch(item.photoUrl);
                const blob = await response.blob();
                modalShareBtn.innerText = "Bagikan";
                
                const file = new File([blob], "wedding_gallery.png", { type: "image/png" });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Galeri Kebahagiaan Sabrina & Raka',
                        text: item.label
                    });
                } else {
                    alert("Gagal membagikan langsung. Silakan download foto terlebih dahulu.");
                }
            } else {
                alert("Fitur bagikan hanya tersedia untuk berkas online.");
            }
        } catch (err) {
            console.error("Gagal membagikan:", err);
            modalShareBtn.innerText = "Bagikan";
        }
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => { 
        galleryModal.classList.add('hidden'); 
        modalAudio.pause(); 
    });
}

if (modalDeleteBtn) {
    modalDeleteBtn.addEventListener('click', async () => { 
        if (confirm("Apakah Anda yakin ingin menghapus kenangan foto ini dari database?")) { 
            try {
                if (supabase) {
                    const { error } = await supabase
                        .from('Digipic')
                        .delete()
                        .eq('id', activeSelectedId);

                    if (error) throw error;
                    await fetchGalleryFromSupabase(); 
                } else {
                    galleryData = galleryData.filter(p => p.id !== activeSelectedId);
                    renderGallery();
                }
                galleryModal.classList.add('hidden'); 
            } catch (err) {
                alert("Gagal menghapus berkas: " + err.message);
            }
        } 
    });
}

function resetBooth() {
    if (audioPlayback) { audioPlayback.classList.add('hidden'); audioPlayback.src = ""; }
    currentAudioBlob = null;
    if (recordStatus) recordStatus.innerText = "Belum merekam"; 
    if (recordBtn) recordBtn.innerText = "Mulai Rekam";
    if (uploadWeddingBtn) { uploadWeddingBtn.innerText = "Kirim 🚀"; uploadWeddingBtn.disabled = false; }
    if (guestNameInput) guestNameInput.value = "";
    if (galleryInput) galleryInput.value = ""; 
    uploadedImageElement = null;
    if (webcamElement) webcamElement.classList.remove('hidden'); 
    if (canvasContainer) canvasContainer.classList.add('hidden'); 
    if (preCaptureAction) preCaptureAction.classList.remove('hidden'); 
    if (afterCaptureBtn) afterCaptureBtn.classList.add('hidden');
    if (switchCameraBtn) switchCameraBtn.classList.remove('hidden');
    if (closeBoothBtn) closeBoothBtn.classList.remove('hidden'); 
    if (frameUI) frameUI.classList.remove('hidden'); 
}

if (retakeBtn) {
    retakeBtn.addEventListener('click', () => {
        resetBooth();
        startWebcam(); 
    });
}

document.addEventListener('DOMContentLoaded', () => { 
    fetchGalleryFromSupabase(); 
});
