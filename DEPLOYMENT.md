# Panduan Deployment Aplikasi Music Streaming di cPanel

## Persiapan

1. Pastikan Anda memiliki akses ke cPanel dengan domain `musicstreaming.expedient609.com`
2. Pastikan Python 3.8+ tersedia di server cPanel Anda

## Langkah-langkah Deployment

### 1. Upload File Proyek

1. Kompres seluruh folder proyek (kecuali folder `venv` dan file `.env`) menjadi file ZIP
2. Login ke cPanel Anda
3. Buka File Manager
4. Navigasi ke direktori `public_html`
5. Upload file ZIP proyek
6. Ekstrak file ZIP tersebut

### 2. Setup Python Environment

1. Di cPanel, buka bagian "Setup Python App"
2. Buat aplikasi Python baru dengan pengaturan berikut:
   - Python Version: 3.8 atau lebih tinggi
   - Application Root: `/home/expedient609/musicstreaming`
   - Application URL: `musicstreaming.expedient609.com`
   - Application Entry Point: `passenger_wsgi.py`
   - Application Startup File: `passenger_wsgi.py`

### 3. Install Dependencies

1. Buka Terminal SSH di cPanel
2. Navigasi ke direktori proyek:
   ```
   cd ~/musicstreaming
   ```
3. Install dependencies menggunakan pip:
   ```
   pip install -r requirements.txt
   ```

### 4. Konfigurasi Environment Variables

1. Buat file `.env` di direktori root proyek dengan isi:
   ```
   DJANGO_SECRET_KEY=your-secure-secret-key
   DEBUG=False
   ALLOWED_HOSTS=musicstreaming.expedient609.com,www.musicstreaming.expedient609.com
   ```

### 5. Collect Static Files

1. Jalankan perintah berikut untuk mengumpulkan file statis:
   ```
   python manage.py collectstatic --noinput
   ```

### 6. Migrasi Database

1. Jalankan migrasi database:
   ```
   python manage.py migrate
   ```

### 7. Restart Aplikasi Python
1. Kembali ke panel "Setup Python App" di cPanel
2. Pilih aplikasi Python yang telah dibuat
3. Klik tombol "Restart" untuk memulai ulang aplikasi

## Troubleshooting

### Error Log

Jika aplikasi tidak berjalan dengan benar, periksa file log error:

1. File error.log di direktori root proyek
2. Log error Apache di cPanel (Error Log)

### Masalah Umum

1. **File Statis Tidak Muncul**: Pastikan Anda telah menjalankan `collectstatic` dan konfigurasi WhiteNoise sudah benar
2. **Error 500**: Periksa file error.log untuk detail masalah
3. **Error 404**: Pastikan URL yang diakses sudah benar dan handler404 sudah terdaftar

## Pemeliharaan

### Update Aplikasi

Untuk memperbarui aplikasi:

1. Upload file yang diperbarui ke server
2. Jalankan migrasi jika ada perubahan model:
   ```
   python manage.py migrate
   ```
3. Kumpulkan file statis jika ada perubahan:
   ```
   python manage.py collectstatic --noinput
   ```
4. Restart aplikasi Python di cPanel

### Backup Database

Lakukan backup database SQLite secara berkala:

1. Download file `db.sqlite3` dari server
2. Simpan di lokasi yang aman

## Keamanan

1. Pastikan file `.env` tidak dapat diakses publik
2. Periksa secara berkala untuk pembaruan keamanan Django
3. Gunakan HTTPS untuk semua koneksi