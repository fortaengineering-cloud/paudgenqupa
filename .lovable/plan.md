

# PAUD GenQuPa - Aplikasi Full-Stack
**Sistem Pendaftaran & Portal Sekolah PAUD Islami**

---

## 🎨 Branding & Desain

- **Tema**: Modern Islamic Education — clean, warm, dan kid-friendly
- **Palet Warna**: Hijau (Islamic), Gold/Kuning Emas (Excellence), Putih (Clean)
- **Font**: Modern dan mudah dibaca
- **Ikon**: Lucide icons + ornamen Islam subtle

---

## 📄 Halaman Publik (Landing Page)

### Hero Section
- Banner besar dengan placeholder gambar anak-anak belajar
- Nama sekolah "PAUD GenQuPa" dengan tagline
- Tombol CTA "Daftar Sekarang" menuju halaman registrasi

### Tentang Kami
- Latar Belakang Pendirian: fokus pada Golden Age (0-6 tahun) dan Hybrid Education (Quran + Teknologi)
- Dikelola oleh Yayasan Pendidikan Generasi Qurani Pandeglang

### Visi & Misi
- Ditampilkan dalam card yang rapi dan visual menarik

### Program Unggulan
- 4 kartu fitur: **Tahfidz Juz 30**, **Adab Islami**, **Play-Based Learning**, **Multilingual** (Indonesia, Arab, Inggris)

### Galeri Foto
- Grid galeri dengan filter kategori (Tahfidz, Outing, Wisuda, dll)
- Foto dikelola admin melalui CMS

### Kontak & Footer
- Alamat: Perumahan Mutiara NIMS Blok B6
- Embed Google Maps placeholder
- Info kontak sekolah dan yayasan

---

## 🔐 Sistem Autentikasi

### Registrasi Orang Tua
- Form registrasi dengan **Nomor HP** sebagai username utama + Password
- Sistem otomatis membuat dummy email format: `[nama_parent]@paud.genqupa.co.id` untuk kebutuhan Supabase Auth
- Setelah registrasi, langsung masuk ke Dashboard Orang Tua

### Login
- Login menggunakan **Nomor HP + Password**

### Admin
- Admin pertama di-**seed** langsung di database
- Login admin menggunakan email & password standar melalui halaman admin terpisah

---

## 👨‍👩‍👧‍👦 Dashboard Orang Tua

### Slider Pengumuman
- Banner carousel yang dikelola admin
- Klik banner bisa membuka link di tab baru (jika ada)

### Daftar Anak
- Kartu untuk setiap anak yang terdaftar menampilkan:
  - Nama, tanggal lahir, jenis kelamin
  - Status pendaftaran: **Menunggu**, **Terverifikasi**, **Ditolak**

### Tambah Anak Baru
- Tombol "Tambah Anak" membuka form dengan field:
  - Nama lengkap, Tempat & Tanggal Lahir, Jenis Kelamin, Anak ke-, Alamat
- Sistem multi-child: satu akun bisa mendaftarkan banyak anak

---

## ⚙️ Admin CMS (Protected Route)

### Manajemen Konten
- Edit teks halaman "Tentang Kami" dan "Visi & Misi" langsung dari dashboard admin

### Manajemen Galeri Foto
- Upload dan hapus foto kegiatan
- Kelompokkan foto berdasarkan album/kategori

### Manajemen Banner
- Upload gambar untuk slider pengumuman di Dashboard
- Tambahkan URL link opsional ke setiap banner

### Daftar Pendaftar
- Tabel semua siswa yang mendaftar beserta data orang tua
- Fitur verifikasi: ubah status pendaftaran (Menunggu → Terverifikasi / Ditolak)
- Filter dan pencarian

---

## 🗄️ Backend (Supabase - Lovable Cloud)

### Tabel Database
- **profiles** — Data orang tua (nama, nomor HP, alamat)
- **user_roles** — Peran pengguna (admin, parent) — tabel terpisah untuk keamanan
- **children** — Data anak terhubung ke parent (multi-child)
- **banners** — Gambar slider + link URL
- **gallery_categories** — Kategori album galeri
- **gallery_photos** — Foto kegiatan + referensi kategori
- **site_content** — Konten CMS (About, Visi, Misi) yang bisa diedit admin

### Storage
- Bucket untuk foto galeri dan banner

### Security
- Row Level Security (RLS) di semua tabel
- Orang tua hanya bisa melihat data anak mereka sendiri
- Admin bisa mengakses semua data
- Fungsi `has_role()` untuk pengecekan role yang aman

---

## 📱 Responsif & Mobile-First
- Semua halaman dioptimalkan untuk tampilan mobile
- Navigasi hamburger menu di mobile
- Card layout yang responsif

