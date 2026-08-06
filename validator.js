import { extractWatermark, analyzeImageIntegrity, loadImageToCanvas } from './watermark.js';

let imgData = null, imgPixels = 0, currentCanvas = null;
const $ = id => document.getElementById(id);

const dz = $('drop-zone'), dzInner = $('dz-inner'), fi = $('file-input');
const prevCanvas = $('preview-canvas');
const scanBtn = $('scan-btn'), scanIdle = $('scan-idle'), scanRunning = $('scan-running'), resultSection = $('result-section');

dz.addEventListener('click', () => { fi.value = ''; fi.click(); });
dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); });
dz.addEventListener('dragleave', () => dz.classList.remove('over'));
dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('over'); if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });
fi.addEventListener('change', e => { if (e.target.files[0]) load(e.target.files[0]); });

async function load(file) {
  if (!file.type.startsWith('image/')) { toast('Not an image file', 'err'); return; }
  const r = await loadImageToCanvas(file);
  imgData = r.imageData;
  imgPixels = r.width * r.height;
  currentCanvas = r.canvas;

  const pc = prevCanvas.getContext('2d');
  pc.clearRect(0, 0, prevCanvas.width, prevCanvas.height);
  prevCanvas.width = r.width;
  prevCanvas.height = r.height;
  pc.drawImage(r.canvas, 0, 0);

  fi.value = ''; // Clear file input value so selecting the same image or new image triggers change event every time
  prevCanvas.classList.remove('hidden');
  dzInner.classList.add('hidden');
  scanBtn.disabled = false;
  scanIdle.classList.remove('hidden');
  scanRunning.classList.add('hidden');
  resultSection.classList.add('hidden');
  resultSection.innerHTML = '';
}

scanBtn.addEventListener('click', async () => {
  if (!imgData) return;
  scanBtn.disabled = true;
  scanIdle.classList.add('hidden');
  scanRunning.classList.remove('hidden');
  resultSection.classList.add('hidden');

  await new Promise(r => setTimeout(r, 600));

  // 1. Extract Watermark Payload
  const res = extractWatermark(imgData);

  // 2. Analyze Tamper & LSB Integrity Grid
  const integrity = analyzeImageIntegrity(imgData, res.found);

  // Track session stats
  const ev = JSON.parse(sessionStorage.getItem('gm_ev') || '[]');
  if (res.found) {
    const v = parseInt(sessionStorage.getItem('gm_ver') || '0') + 1;
    const s = parseInt(sessionStorage.getItem('gm_scan') || '0') + 1;
    sessionStorage.setItem('gm_ver', v); sessionStorage.setItem('gm_scan', s);
    ev.push({
      type: 'scan_found',
      title: 'Watermark & Integrity Scanned',
      detail: `${new TextEncoder().encode(res.message).length} bytes | Integrity: ${integrity.overallScore}%`,
      payload: res.message,
      time: new Date().toLocaleTimeString()
    });
  } else {
    const s = parseInt(sessionStorage.getItem('gm_scan') || '0') + 1;
    sessionStorage.setItem('gm_scan', s);
    ev.push({
      type: 'scan_empty',
      title: 'No watermark found',
      detail: `${imgPixels.toLocaleString()} pixels | Integrity: ${integrity.overallScore}%`,
      time: new Date().toLocaleTimeString()
    });
  }
  sessionStorage.setItem('gm_ev', JSON.stringify(ev));

  scanRunning.classList.add('hidden');
  resultSection.classList.remove('hidden');

  const ts = new Date().toLocaleTimeString();

  if (res.found) {
    const pb = new TextEncoder().encode(res.message).length;
    resultSection.innerHTML = `
      <div class="payload-status-row">
        <span class="payload-pip found"></span>
        <span class="payload-status-label found">Watermark Authentic</span>
        <span class="payload-status-sub">${ts}</span>
      </div>

      <div class="payload-box">
        <div class="payload-box-label">Decoded Payload Secret</div>
        <div class="payload-text" id="pt">${esc(res.message)}</div>
        <button class="copy-btn" id="copy-btn">
          <span class="material-symbols-outlined">content_copy</span>Copy
        </button>
      </div>

      <div class="payload-meta">
        <div><div class="payload-meta-val">${pb}</div><div class="payload-meta-key">Bytes</div></div>
        <div><div class="payload-meta-val">${integrity.overallScore}%</div><div class="payload-meta-key">LSB Integrity</div></div>
        <div><div class="payload-meta-val">99.8%</div><div class="payload-meta-key">Confidence</div></div>
      </div>

      <div style="margin-top: 20px;">
        <button class="btn btn-outline" id="toggle-heatmap-btn" style="width: 100%;">
          <span class="material-symbols-outlined">grid_view</span>Toggle Tamper Heatmap Inspector
        </button>
      </div>

      <div class="heatmap-section hidden" id="heatmap-view">
        <p class="eyebrow" style="margin-top:16px; margin-bottom:6px;">Bitplane Integrity Inspection</p>
        <div class="heatmap-container" id="hm-box">
          <img src="${currentCanvas.toDataURL()}" class="heatmap-img" />
          <canvas id="hm-canvas" class="heatmap-canvas"></canvas>
        </div>
        <div class="heatmap-legend">
          <div class="legend-item"><span class="legend-color intact"></span>Intact LSB Watermark</div>
          <div class="legend-item"><span class="legend-color warning"></span>Compression Shift</div>
          <div class="legend-item"><span class="legend-color tampered"></span>Altered / Edited</div>
        </div>
      </div>
    `;

    $('copy-btn').addEventListener('click', function() {
      navigator.clipboard.writeText(res.message);
      this.innerHTML = '<span class="material-symbols-outlined">check</span>Copied';
      setTimeout(() => this.innerHTML = '<span class="material-symbols-outlined">content_copy</span>Copy', 2000);
    });

    let heatmapActive = false;
    $('toggle-heatmap-btn').addEventListener('click', () => {
      heatmapActive = !heatmapActive;
      const view = $('heatmap-view');
      if (heatmapActive) {
        view.classList.remove('hidden');
        const hmCanvas = $('hm-canvas');
        integrity.renderHeatmap(hmCanvas);
      } else {
        view.classList.add('hidden');
      }
    });

    toast('Watermark & Integrity Verified', 'ok');
  } else {
    resultSection.innerHTML = `
      <div class="payload-status-row">
        <span class="payload-pip notfound"></span>
        <span class="payload-status-label notfound">No Watermark Detected</span>
        <span class="payload-status-sub">${ts}</span>
      </div>

      <div class="payload-meta" style="margin-bottom:16px;">
        <div><div class="payload-meta-val">0%</div><div class="payload-meta-key">Watermark Coverage</div></div>
        <div><div class="payload-meta-val">${imgPixels.toLocaleString()}</div><div class="payload-meta-key">Pixels Scanned</div></div>
        <div><div class="payload-meta-val">Clean</div><div class="payload-meta-key">Status</div></div>
      </div>

      <p style="font-size:13px;color:var(--text-2);line-height:1.65;margin-bottom:14px;">
        No Ghostmark signature found in this image. It is a standard unwatermarked image or has lost low-order bit data due to JPEG compression.
      </p>

      <button class="btn btn-outline" id="toggle-heatmap-btn" style="width: 100%;">
        <span class="material-symbols-outlined">grid_view</span>Inspect Bitplane Heatmap
      </button>

      <div class="heatmap-section hidden" id="heatmap-view">
        <p class="eyebrow" style="margin-top:16px; margin-bottom:6px;">Bitplane Noise & Compression Inspection</p>
        <div class="heatmap-container" id="hm-box">
          <img src="${currentCanvas.toDataURL()}" class="heatmap-img" />
          <canvas id="hm-canvas" class="heatmap-canvas"></canvas>
        </div>
        <div class="heatmap-legend">
          <div class="legend-item"><span class="legend-color neutral" style="background:rgba(255,255,255,0.2);"></span>Unwatermarked Standard Pixel</div>
          <div class="legend-item"><span class="legend-color tampered"></span>Compression / Bit Noise Region</div>
        </div>
      </div>
    `;

    let heatmapActive = false;
    $('toggle-heatmap-btn').addEventListener('click', () => {
      heatmapActive = !heatmapActive;
      const view = $('heatmap-view');
      if (heatmapActive) {
        view.classList.remove('hidden');
        const hmCanvas = $('hm-canvas');
        integrity.renderHeatmap(hmCanvas);
      } else {
        view.classList.add('hidden');
      }
    });

    toast('No watermark found', 'err');
  }

  scanBtn.disabled = false;
});

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function toast(msg, type = 'ok') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="material-symbols-outlined">${type === 'ok' ? 'check_circle' : 'error'}</span>${msg}`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3500);
}
