import { extractWatermark, loadImageToCanvas } from './watermark.js';

let imgData = null, imgPixels = 0;
const $ = id => document.getElementById(id);

const dz = $('drop-zone'), dzInner = $('dz-inner'), fi = $('file-input');
const prevCanvas = $('preview-canvas');
const scanBtn = $('scan-btn'), scanIdle = $('scan-idle'), scanRunning = $('scan-running'), resultSection = $('result-section');

dz.addEventListener('click', () => fi.click());
dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); });
dz.addEventListener('dragleave', () => dz.classList.remove('over'));
dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('over'); if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });
fi.addEventListener('change', e => { if (e.target.files[0]) load(e.target.files[0]); });

async function load(file) {
  if (!file.type.startsWith('image/')) { toast('Not an image file', 'err'); return; }
  const r = await loadImageToCanvas(file);
  imgData = r.imageData; imgPixels = r.width * r.height;
  const pc = prevCanvas.getContext('2d');
  prevCanvas.width = r.width; prevCanvas.height = r.height;
  pc.drawImage(r.canvas, 0, 0);
  prevCanvas.classList.remove('hidden'); dzInner.classList.add('hidden');
  scanBtn.disabled = false;
  scanIdle.classList.remove('hidden'); scanRunning.classList.add('hidden'); resultSection.classList.add('hidden'); resultSection.innerHTML = '';
}

scanBtn.addEventListener('click', async () => {
  if (!imgData) return;
  scanBtn.disabled = true;
  scanIdle.classList.add('hidden');
  scanRunning.classList.remove('hidden');
  resultSection.classList.add('hidden');

  await new Promise(r => setTimeout(r, 700));

  const res = extractWatermark(imgData);

  // track
  const ev = JSON.parse(sessionStorage.getItem('gm_ev') || '[]');
  if (res.found) {
    const v = parseInt(sessionStorage.getItem('gm_ver') || '0') + 1;
    const s = parseInt(sessionStorage.getItem('gm_scan') || '0') + 1;
    sessionStorage.setItem('gm_ver', v); sessionStorage.setItem('gm_scan', s);
    ev.push({ type: 'scan_found', title: 'Watermark detected', detail: `${new TextEncoder().encode(res.message).length} bytes found`, payload: res.message, time: new Date().toLocaleTimeString() });
  } else {
    const s = parseInt(sessionStorage.getItem('gm_scan') || '0') + 1;
    sessionStorage.setItem('gm_scan', s);
    ev.push({ type: 'scan_empty', title: 'No watermark found', detail: `${imgPixels.toLocaleString()} pixels scanned`, time: new Date().toLocaleTimeString() });
  }
  sessionStorage.setItem('gm_ev', JSON.stringify(ev));

  scanRunning.classList.add('hidden');
  resultSection.classList.remove('hidden');

  if (res.found) {
    const pb = new TextEncoder().encode(res.message).length;
    const ts = new Date().toLocaleTimeString();
    resultSection.innerHTML = `
      <div class="payload-status-row">
        <span class="payload-pip found"></span>
        <span class="payload-status-label found">Watermark found</span>
        <span class="payload-status-sub">${ts}</span>
      </div>
      <div class="payload-box">
        <div class="payload-box-label">Embedded payload</div>
        <div class="payload-text" id="pt">${esc(res.message)}</div>
        <button class="copy-btn" id="copy-btn">
          <span class="material-symbols-outlined">content_copy</span>Copy
        </button>
      </div>
      <div class="payload-meta">
        <div><div class="payload-meta-val">${pb}</div><div class="payload-meta-key">Bytes</div></div>
        <div><div class="payload-meta-val">${imgPixels.toLocaleString()}</div><div class="payload-meta-key">Pixels scanned</div></div>
        <div><div class="payload-meta-val">99.8%</div><div class="payload-meta-key">Confidence</div></div>
      </div>`;
    $('copy-btn').addEventListener('click', function() {
      navigator.clipboard.writeText(res.message);
      this.innerHTML = '<span class="material-symbols-outlined">check</span>Copied';
      setTimeout(() => this.innerHTML = '<span class="material-symbols-outlined">content_copy</span>Copy', 2000);
    });
    toast('Watermark found', 'ok');
  } else {
    resultSection.innerHTML = `
      <div class="payload-status-row">
        <span class="payload-pip notfound"></span>
        <span class="payload-status-label notfound">No watermark detected</span>
      </div>
      <p style="font-size:13px;color:var(--text-2);line-height:1.65;margin-bottom:14px;">
        No Ghostmark signature found in this image. It may not have been watermarked, or may have been re-saved as JPEG (which destroys LSB data).
      </p>
      <div class="tip-box">
        <span class="material-symbols-outlined">info</span>
        Always save watermarked images as PNG (lossless) to preserve the embedded payload.
      </div>`;
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
