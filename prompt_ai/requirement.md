## 🧠 Context

- **Nama Website:** DocuFlip (atau FlipRead)
- **Objective:** Membangun aplikasi web interaktif yang memungkinkan pengguna untuk mengunggah, melihat, dan membaca file PDF dengan pengalaman visual yang realistis seperti membaca buku fisik (animasi efek membalik halaman / *flipbook*).
- **Project Base:** Repository ini (`Init-nextjs-app`) — sudah ter-setup dengan Next.js 16, Tailwind CSS v4, TypeScript strict, Serwist PWA
- **Target Audience:** Semua umur

## 📋 Requirements

### Halaman yang dibutuhkan

- **Home / Landing Page:** Area untuk pengguna mengunggah file PDF (mendukung fitur *drag-and-drop*) dan menampilkan daftar dokumen yang baru saja dibaca.
- **Reader / Viewer Page:** Halaman utama tempat PDF dirender menjadi bentuk buku interaktif.

### Fitur Utama

- [x] **Upload & Parsing PDF:** Integrasi dengan `pdf.js` (atau sejenisnya) untuk merender halaman PDF menjadi gambar/kanvas.
- [x] **Animasi Flipbook 3D/2D:** Efek kertas yang bisa dibuka/dibalik secara realistis (bisa menggunakan library seperti `react-pageflip` atau `turn.js`).
- [x] **Kontrol Navigasi:** Tombol *Next / Previous*, slider untuk melompat ke halaman tertentu, serta indikator nomor halaman.
- [x] **Interaksi Sentuh (Touch Support):** Fitur *swipe* untuk membalik halaman secara natural di perangkat mobile/tablet.
- [x] **Reading Tools:** Fitur *Zoom In/Out* dan *Fullscreen mode* untuk pengalaman membaca yang imersif.

### Desain & UI

- **Style:** Modern, Clean, & Minimalis (Fokus utama pada dokumen yang sedang dibaca tanpa banyak distraksi visual).
- **Color Palette:**
  - *Light Mode:* Latar belakang abu-abu terang (Netral) untuk menonjolkan dokumen, dengan aksen biru/indigo lembut untuk interaksi tombol.
  - *Dark Mode:* Latar belakang *charcoal* atau *slate* gelap (`#0F172A`) agar nyaman di mata saat membaca, dengan teks dan border yang disesuaikan.
- **Typography:** Gunakan Geist (sudah setup) untuk keseluruhan antarmuka UI (modern dan rapi).
- **Layout:** Mobile-first, responsive (Tampilan satu halaman pada mobile, dan tampilan buku terbuka/dua halaman pada desktop).
- **Dark Mode:** Wajib support

### Referensi Web

- [x] **Flipsnack / Heyzine:** Sebagai referensi interaksi membalik halaman dan kontrol navigasi.
- [x] **Issuu:** Sebagai referensi layout *viewer* minimalis yang berfokus pada konten dokumen.
