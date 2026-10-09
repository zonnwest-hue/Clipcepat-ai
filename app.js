(() => {
  const $ = (id) => document.getElementById(id);
  const fileInput = $("videoFile"), preview = $("preview"), exportBtn = $("exportBtn");
  let selectedFile = null, ffmpeg = null, ffmpegLoading = null;

  const showError = (message) => { $("errorMessage").textContent = message || ""; };
  const formatBytes = (n) => n < 1024*1024 ? `${(n/1024).toFixed(0)} KB` : `${(n/1024/1024).toFixed(1)} MB`;

  fileInput.addEventListener("change", () => {
    showError("");
    selectedFile = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
    if (!selectedFile) { exportBtn.disabled = true; return; }
    if (!selectedFile.type.startsWith("video/")) {
      selectedFile = null; exportBtn.disabled = true;
      showError("File ini tidak terdeteksi sebagai video. Pilih file video seperti MP4, MOV, atau WebM."); return;
    }
    preview.src = URL.createObjectURL(selectedFile);
    preview.classList.remove("hidden");
    $("fileInfo").textContent = `${selectedFile.name} · ${formatBytes(selectedFile.size)} · Durasi akan dibaca dari pemutar video`;
    $("fileInfo").classList.remove("hidden");
    preview.onloadedmetadata = () => {
      $("startTime").max = preview.duration;
      $("endTime").max = preview.duration;
      $("endTime").value = Math.min(15, preview.duration).toFixed(1);
    };
    exportBtn.disabled = false;
  });

  $("checkUrl").addEventListener("click", () => {
    const raw = $("youtubeUrl").value.trim();
    const msg = $("urlMessage");
    try {
      const url = new URL(raw);
      const host = url.hostname.toLowerCase().replace(/^www\./, "");
      if (!["youtube.com","m.youtube.com","youtu.be","youtube-nocookie.com"].includes(host)) {
        msg.textContent = "Ini bukan domain YouTube yang dikenali. Untuk keselamatan, jangan masukkan pautan mencurigakan.";
        return;
      }
      msg.textContent = "Tautan YouTube dikenali sebagai referensi, tetapi aplikasi ini tidak mengunduh atau memprosesnya langsung. Jika Anda pemilik/punya izin, gunakan opsi unduhan resmi yang tersedia bagi akun/konten Anda, lalu unggah file videonya di kotak kiri.";
    } catch {
      msg.textContent = "Masukkan URL lengkap, misalnya https://www.youtube.com/watch?v=... . Tautan hanya diperiksa, bukan diunduh.";
    }
  });

  async function loadFFmpeg() {
    if (ffmpeg && ffmpeg.loaded) return ffmpeg;
    if (ffmpegLoading) return ffmpegLoading;
    ffmpegLoading = (async () => {
      if (!window.FFmpegWASM || !window.FFmpegUtil) {
        throw new Error("Mesin video belum termuat. Periksa koneksi internet, lalu muat ulang halaman.");
      }
      const { FFmpeg } = window.FFmpegWASM;
      const { toBlobURL } = window.FFmpegUtil;
      ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress }) => {
        const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
        $("progressBar").style.width = pct + "%";
        $("progressText").textContent = `Sedang memproses video… ${pct}%`;
      });
      const coreBase = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${coreBase}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${coreBase}/ffmpeg-core.wasm`, "application/wasm")
      });
      return ffmpeg;
    })();
    try { return await ffmpegLoading; } finally { ffmpegLoading = null; }
  }

  function makeSrt(text, duration, title) {
    const clean = text.trim();
    if (!clean) return "";
    const esc = (s) => s.replace(/-->/g, "→").replace(/\r/g, "").trim();
    const stamp = (s) => {
      const ms = Math.max(0, Math.round(s * 1000));
      const h = String(Math.floor(ms / 3600000)).padStart(2,"0");
      const m = String(Math.floor(ms % 3600000 / 60000)).padStart(2,"0");
      const sec = String(Math.floor(ms % 60000 / 1000)).padStart(2,"0");
      const milli = String(ms % 1000).padStart(3,"0");
      return `${h}:${m}:${sec},${milli}`;
    };
    return `1\n${stamp(0)} --> ${stamp(Math.max(1,duration))}\n${esc(title ? title + "\\n" + clean : clean)}\n`;
  }
  function downloadBlob(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 30000);
  }

  exportBtn.addEventListener("click", async () => {
    showError("");
    if (!selectedFile) { showError("Pilih file video terlebih dahulu."); return; }
    const start = Number($("startTime").value), end = Number($("endTime").value);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) {
      showError("Waktu akhir harus lebih besar dari waktu mulai, dan keduanya tidak boleh negatif."); return;
    }
    if (Number.isFinite(preview.duration) && end > preview.duration + 0.1) {
      showError(`Waktu akhir melewati durasi video (${preview.duration.toFixed(1)} detik).`); return;
    }
    const safeName = (selectedFile.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi,"-").slice(0,45) || "clip");
    exportBtn.disabled = true; $("progressArea").classList.remove("hidden");
    $("progressBar").style.width = "2%"; $("progressText").textContent = "Memuat mesin video (pertama kali bisa lama)…";
    try {
      const engine = await loadFFmpeg();
      const inputName = "input-video";
      const outputName = "clipcepat-output.mp4";
      await engine.writeFile(inputName, new Uint8Array(await selectedFile.arrayBuffer()));
      $("progressText").textContent = "Memotong video…";
      const result = await engine.exec(["-ss", String(start), "-i", inputName, "-t", String(end-start), "-c:v", "libx264", "-preset", "ultrafast", "-crf", "27", "-c:a", "aac", "-movflags", "+faststart", outputName]);
      if (result !== 0) throw new Error("FFmpeg tidak dapat menyelesaikan pemotongan video.");
      const data = await engine.readFile(outputName);
      downloadBlob(new Blob([data.buffer], {type:"video/mp4"}), `${safeName}-clip.mp4`);
      const subtitle = makeSrt($("subtitleText").value, end-start, $("clipTitle").value.trim());
      if (subtitle) downloadBlob(new Blob([subtitle], {type:"text/plain;charset=utf-8"}), `${safeName}-subtitle.srt`);
      $("progressBar").style.width = "100%";
      $("progressText").textContent = subtitle ? "Selesai. File MP4 dan subtitle SRT diunduh terpisah." : "Selesai. File MP4 berhasil diunduh.";
    } catch (err) {
      showError(`Ekspor gagal: ${err && err.message ? err.message : err}\nCoba video lebih pendek/kecil, pastikan internet stabil, atau gunakan browser/perangkat lain.`);
      $("progressText").textContent = "Proses belum berhasil.";
    } finally { exportBtn.disabled = !selectedFile; }
  });
})();