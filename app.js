// ==========================================
// 1. DEKLARASI VARIABEL & ELEMEN DOM
// ==========================================
const startBoothBtn = document.getElementById('startBoothBtn');
const galleryGrid = document.getElementById('galleryGrid');

// Elemen Modal Galeri
const galleryModal = document.getElementById('galleryModal');
const modalImg = document.getElementById('modalImg');
const modalAudio = document.getElementById('modalAudio');
const noAudioTxt = document.getElementById('noAudioTxt');
const modalShareBtn = document.getElementById('modalShareBtn');
const modalDeleteBtn = document.getElementById('modalDeleteBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

// State Aplikasi
let activeSelectedId = null;

// Data Awal Galeri (Dummy/Contoh Foto Bawaan)
let galleryData = [
    {
        id: "sample-1",
        photoUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop",
        audioUrl: "", // Tidak ada rekaman suara
        label: "Momen Bahagia Sabrina & Raka",
        rawPhotoBlob: null
    },
    {
        id: "sample-2",
        photoUrl: "https://images.unsplash.com/photo-1519225495810-7512c696505a?q=80&w=600&auto=format&fit=crop",
        audioUrl: "", 
        label: "Senyuman Hangat di Hari Pernikahan",
        rawPhotoBlob: null
    }
];

// ==========================================
// 2. FUNGSI UTAMA: TRIGGER SHARE (WEB SHARE API)
// ==========================================
/**
 * Fungsi global untuk membagikan file Blob gambar ke aplikasi pihak ketiga (WhatsApp, IG, dll)
 * @param {Blob} blobData - Data mentah gambar
 */
async function triggerShare(blobData) {
    if (!blobData) return;
    
    const file = new File([blobData], "photobooth_moment.png", { type: "image/png" });
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: 'Photobooth Sabrina & Raka',
                text: 'Lihat keseruan momen kami di pernikahan Sabrina & Raka! ✨'
            });
        } catch (err) {
            console.log("Pengguna membatalkan pembagian atau terjadi kesalahan:", err);
        }
    } else {
        alert("Browser atau perangkat Anda tidak mendukung fitur berbagi file langsung. Silakan simpan gambar secara manual.");
    }
}

// ==========================================
// 3. FUNGSI UTAMA: RENDER DATA KE GRID GALERI
// ==========================================
function renderGallery() {
    // Kosongkan grid terlebih dahulu
    galleryGrid.innerHTML = "";
    
    if (galleryData.length === 0) {
        galleryGrid.innerHTML = `
            <div class="col-span-2 sm:col-span-3 text-center py-10 text-stone-400 text-sm">
                Belum ada foto di galeri. Jadilah yang pertama mengabadikan momen!
            </div>
        `;
        return;
    }

    // Buat elemen card foto satu per satu
    galleryData.forEach(item => {
        const card = document.createElement('div');
        card.className = "group relative aspect-square bg-stone-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-stone-200/60 transform active:scale-98";
        
        // Indikator jika foto memiliki rekaman suara
        const audioIndicator = item.audioUrl 
            ? `<div class="absolute top-2 right-2 bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium shadow">🎵 Bersuara</div>` 
            : '';

        card.innerHTML = `
            <img src="${item.photoUrl}" alt="Momen Galeri" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <p class="text-white text-xs truncate w-full font-medium">Lihat Momen ➔</p>
            </div>
            ${audioIndicator}
        `;
        
        // Ketika kartu foto diklik, buka jendela detail modal
        card.addEventListener('click', () => openGalleryModal(item.id));
        
        galleryGrid.appendChild(card);
    });
}

// ==========================================
// 4. LOGIKA MODAL DETAIL & FIX TOMBOL SHARE
// ==========================================
function openGalleryModal(id) {
    const item = galleryData.find(p => p.id === id); 
    if (!item) return;
    
    activeSelectedId = id; 
    modalImg.src = item.photoUrl;
    
    // Cek ketersediaan file audio pendukung
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

// FIX BUG: Event Listener Tombol Bagikan di Dalam Modal Galeri
modalShareBtn.addEventListener('click', async () => {
    const item = galleryData.find(p => p.id === activeSelectedId);
    if (!item) return;

    try {
        // Kasus A: Jika foto hasil jepretan baru (punya data mentah rawPhotoBlob)
        if (item.rawPhotoBlob) {
            triggerShare(item.rawPhotoBlob);
        } 
        // Kasus B: Jika foto dummy/bawaan lama yang berbentuk URL link HTTP internet
        else if (item.photoUrl.startsWith('http')) {
            modalShareBtn.innerText = "Memuat...";
            
            // Mengubah URL gambar menjadi data Blob mentah agar bisa di-share lewat API perangkat
            const response = await fetch(item.photoUrl);
            const blob = await response.blob();
            modalShareBtn.innerText = "Bagikan";
            
            const file = new File([blob], "wedding_gallery.png", { type: "image/png" });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Galeri Kebahagiaan Sabrina & Raka',
                    text: item.label || 'Momen indah dari pernikahan Sabrina & Raka!'
                });
            } else {
                alert("Fitur bagikan file langsung tidak didukung di browser ini. Sila unduh gambar secara manual.");
            }
        }
    } catch (err) {
        console.error("Gagal memproses pembagian data:", err);
        modalShareBtn.innerText = "Bagikan";
    }
});

// Aksi Tutup Jendela Modal
closeModalBtn.addEventListener('click', () => { 
    galleryModal.classList.add('hidden'); 
    modalAudio.pause(); // Hentikan audio agar suara tidak bocor saat modal ditutup
});

// Aksi Hapus Item dari Array Galeri
modalDeleteBtn.addEventListener('click', () => { 
    if (confirm("Apakah Anda yakin ingin menghapus kenangan foto ini?")) { 
        galleryData = galleryData.filter(p => p.id !== activeSelectedId); 
        renderGallery(); // Render ulang susunan grid
        galleryModal.classList.add('hidden'); 
    } 
});

// ==========================================
// 5. INISIALISASI AWAL JALANNYA APLIKASI
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Render data bawaan saat web pertama kali dimuat
    renderGallery();
    
    // Logika tombol utama navigasi ke seksi photobooth
    if (startBoothBtn) {
        startBoothBtn.addEventListener('click', () => {
            alert("Sistem Kamera Booth Diaktifkan! Hubungkan modul interface hardware kamera Anda di bagian ini.");
            // Tempatkan logika trigger buka kamera/halaman photobooth Anda di bawah sini
        });
    }
});
