# ClipCepat AI — paket awal untuk HP + Cloudflare Pages

## Yang benar-benar tersedia di paket ini
- Antarmuka responsif untuk HP.
- Upload video lokal.
- Pratinjau video dan pengaturan waktu mulai/akhir.
- Pemotongan/ekspor MP4 di browser menggunakan FFmpeg.wasm.
- Kolom subtitle manual; bila diisi, diunduh sebagai file SRT terpisah.
- Kolom tautan YouTube hanya memeriksa bentuk domain dan memberi instruksi aman. **Tidak mengunduh atau memproses video YouTube langsung.**

## Yang BELUM aktif
- AI otomatis memilih momen menarik.
- Transkripsi suara/subtitle otomatis.
- Subtitle yang tertanam langsung ke video.
- Pemrosesan URL YouTube.
- Klaim viral/FYP.
Fitur-fitur itu memerlukan integrasi model/layanan tambahan dan pengujian nyata. Jangan mempromosikannya sebagai aktif sebelum benar-benar terhubung dan diuji.

## Cara pasang dari HP Android
1. Unduh ZIP paket ini dan ekstrak menggunakan aplikasi pengelola file.
2. Buka GitHub di browser, masuk ke repositori Anda.
3. Masuk ke folder repositori. Pilih **Add file → Upload files** (atau unggah file satu per satu jika tampilan HP berbeda).
4. Unggah `index.html`, `styles.css`, `app.js`, `_headers`, dan `README.md` ke **root** repositori (jangan sampai tersimpan di dalam folder tambahan).
5. Tekan **Commit changes**.
6. Buka Cloudflare Dashboard → **Workers & Pages** → proyek Pages Anda.
7. Jika proyek terhubung ke GitHub, tunggu deployment otomatis. Jika tidak, buat deployment Direct Upload dari folder yang berisi file-file tersebut.
8. Buka URL `*.pages.dev` milik proyek. Tes upload video pendek MP4 terlebih dahulu.

## Catatan Cloudflare Pages
- `_headers` meminta header cross-origin isolation yang dibutuhkan sebagian fitur WebAssembly/SharedArrayBuffer. Perubahan header mungkin memerlukan deployment baru dan cache refresh.
- FFmpeg dan utilitasnya dimuat dari CDN jsDelivr. Saat pertama dibuka perlu internet dan dapat mengunduh file besar.
- Jika browser melaporkan `SharedArrayBuffer` tidak tersedia atau mesin FFmpeg gagal dimuat, periksa `_headers`, deployment terbaru, koneksi, dan dukungan browser. Jangan menghapus pesan error; gunakan sebagai petunjuk.
- Cloudflare Pages hanya meng-host situs statis. Paket ini tidak memakai backend, database, login, atau API AI.

## Batasan perangkat
Pemrosesan berjalan di RAM/perangkat pengguna. File besar, video resolusi tinggi, durasi panjang, atau banyak tab dapat membuat proses lambat/gagal atau tab tertutup. Mulai dengan klip uji pendek (misalnya 10–30 detik). Tutup aplikasi lain jika memori rendah.

## Keamanan rahasia
Versi ini **tidak membutuhkan secret/API key**. Jangan menaruh token, password, atau API key di `app.js`, `index.html`, repositori publik, atau variabel frontend. Jika kelak menambah AI API, panggil API melalui backend/Worker dan simpan secret lewat Cloudflare Dashboard → Worker → Settings → Variables and Secrets. Jangan memasukkan secret di prompt atau mengirimkannya ke browser.

## YouTube dan izin
Tautan YouTube bukan file video yang bisa diproses langsung oleh paket ini. Untuk video milik Anda, gunakan cara ekspor/unduh resmi yang tersedia bagi akun Anda atau sumber file asli, lalu unggah file lokal. Untuk video orang lain, pastikan Anda punya izin dan patuhi ketentuan platform/hak cipta. Jangan gunakan alat ini untuk melewati pembatasan unduhan.

## Troubleshooting
- **Tombol ekspor tidak aktif:** pilih file video lokal yang valid.
- **Gagal memuat FFmpeg:** reload halaman dengan internet stabil; pastikan deployment menggunakan file `_headers`.
- **Proses gagal di HP:** coba video lebih pendek/kecil, tutup tab lain, atau gunakan komputer. Tidak semua perangkat mendukung pemrosesan ini.
- **Video tanpa audio / format tidak terbaca:** coba MP4 H.264/AAC sebagai file sumber.
