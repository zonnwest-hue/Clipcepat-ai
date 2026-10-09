# ClipCepat AI — starter website

Website statis berbahasa Indonesia, siap diunggah sebagai aset frontend ke Cloudflare Pages.

## Fitur yang sudah berjalan
- Desain responsif untuk HP dan desktop.
- Navigasi Beranda, Buat Klip, Analisis Potensi FYP, Subtitle & Judul, Riwayat, dan Customer Service.
- Validasi format URL YouTube (bukan pengunduhan).
- Form pilihan durasi, format, kualitas target, dan fokus klip.
- Template saran konten dan FAQ customer service terbatas pada ClipCepat.
- Tidak membutuhkan build command.

## Yang belum aktif (memerlukan backend/API)
1. **Membuat klip sungguhan dari URL YouTube.** Frontend tidak mengambil atau mengunduh video. Perlu sumber video yang sah, backend pemrosesan (misalnya FFmpeg pada layanan yang sesuai), antrean pekerjaan, penyimpanan sementara/hasil, dan endpoint unduhan. Memproses video berat di Cloudflare Pages saja bukan rancangan yang cukup.
2. **AI customer service generatif.** Saat ini jawabannya adalah FAQ berbasis aturan. Untuk AI generatif, buat Cloudflare Worker/server backend yang memanggil API model AI. Simpan kunci API sebagai secret server-side, jangan di `app.js`.
3. **Analisis video sesungguhnya.** Perlu transkrip/metadata/konten yang dapat diakses secara sah, lalu dikirim ke model AI.
4. **Subtitle otomatis.** Perlu speech-to-text, penyelarasan waktu, dan pembakaran/penyematan subtitle saat ekspor.
5. **Riwayat lintas perangkat, akun, dan file permanen.** Perlu database dan object storage.
6. **1080p/2K.** Pilihan di UI hanya target. Hasil nyata bergantung pada resolusi sumber, kemampuan pemroses, codec, dan batas layanan.

## Deploy ke Cloudflare Pages
1. Ekstrak ZIP ini.
2. Buat repository GitHub baru dan unggah `index.html`, `styles.css`, `app.js`, `_headers`, dan `README.md` ke root repository.
3. Di Cloudflare Dashboard, buka **Workers & Pages → Create → Pages → Connect to Git**.
4. Pilih repository. Untuk situs statis ini, gunakan build command kosong dan build output directory `/` (root repository). Jika dashboard tidak menerima `/`, gunakan konfigurasi direktori sesuai petunjuk Cloudflare yang muncul.
5. Deploy, lalu buka URL yang diberikan Cloudflare.

Alternatif unggah aset statis: gunakan opsi Direct Upload jika tersedia pada dashboard akunmu.

## Catatan penting
- Jangan menjanjikan FYP/viral; AI hanya memberi estimasi dan saran.
- Jangan gunakan URL YouTube untuk mengunduh atau mengolah konten tanpa hak/izin yang sesuai. Periksa ketentuan YouTube dan hukum yang berlaku.
- Paket gratis pihak ketiga dapat memiliki batas, perubahan ketentuan, dan biaya penggunaan. Verifikasi sebelum mengaktifkan backend.
- Website demo ini tidak memiliki login, database, backend pemrosesan video, atau API AI generatif.
