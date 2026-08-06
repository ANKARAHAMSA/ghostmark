import { embedWatermark, loadImageToCanvas, canvasToBlob } from './watermark.js';

let imgData = null, origCanvas = null, blobUrl = null;
const $ = id => document.getElementById(id);

// DOM
const dz = $('drop-zone'), dzInner = $('dz-inner'), fi = $('file-input');
const prevCanvas = $('preview-canvas'), imgMeta = $('image-meta');
const dims = $('meta-dims'), sz = $('meta-size'), cap = $('meta-cap');
const wmt = $('wm-text'), byteCtr = $('byte-counter');
const encBtn = $('encode-btn'), dlBtn = $('download-btn');
const progArea = $('prog-area'), progBar = $('prog-bar'), progLbl = $('prog-label');
const resultArea = $('result-area'), cmpSection = $('compare-section');
const origC = $('original-canvas'), outC = $('output-canvas');

// Drop zone
dz.addEventListener('click', () => fi.click());
dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); });
dz.addEventListener('dragleave', () => dz.classList.remove('over'));
dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('over'); if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });
fi.addEventListener('change', e => { if (e.target.files[0]) load(e.target.files[0]); });

async function load(file) {
  if (!file.type.startsWith('image/')) { toast('Not an image file', 'err'); return; }
  const r = await loadImageToCanvas(file);
  imgData = r.imageData; origCanvas = r.canvas;
  const pc = prevCanvas.getContext('2d');
  prevCanvas.width = r.width; prevCanvas.height = r.height;
  pc.drawImage(r.canvas, 0, 0);
  prevCanvas.classList.remove('hidden'); dzInner.classList.add('hidden');
  dims.textContent = `${r.width}×${r.height}`;
  sz.textContent   = fmt(file.size);
  cap.textContent  = fmt(Math.floor(r.width * r.height * 6 / 8));
  imgMeta.classList.remove('hidden');
  ready(); reset();
}

wmt.addEventListener('input', () => {
  byteCtr.textContent = new TextEncoder().encode(wmt.value).length + ' bytes';
  ready(); reset();
});

function ready() { encBtn.disabled = !(imgData && wmt.value.trim()); }

encBtn.addEventListener('click', async () => {
  if (!imgData || !wmt.value.trim()) return;
  encBtn.disabled = true; dlBtn.classList.add('hidden');
  resultArea.innerHTML = ''; cmpSection.classList.add('hidden');
  progArea.classList.remove('hidden');

  try {
    await anim(0, 40, 300); progLbl.textContent = 'Analysing pixel matrix…';
    const clone = new ImageData(new Uint8ClampedArray(imgData.data), imgData.width, imgData.height);
    await anim(40, 80, 400); progLbl.textContent = 'Writing payload to LSB channels…';
    embedWatermark(clone, wmt.value.trim());
    await anim(80, 100, 200);

    const oc = outC.getContext('2d');
    outC.width = clone.width; outC.height = clone.height;
    oc.putImageData(clone, 0, 0);
    const nc = origC.getContext('2d');
    origC.width = origCanvas.width; origC.height = origCanvas.height;
    nc.drawImage(origCanvas, 0, 0);

    const blob = await canvasToBlob(outC);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    blobUrl = URL.createObjectURL(blob);

    progArea.classList.add('hidden');
    cmpSection.classList.remove('hidden'); dlBtn.classList.remove('hidden');

    const pb = new TextEncoder().encode(wmt.value.trim()).length;
    resultArea.innerHTML = `
      <div class="result-row ok">
        <span class="result-pip"></span>
        <div>
          <div class="result-label">Watermark embedded</div>
          <div class="result-sub">${pb} bytes · ${clone.width}×${clone.height}px · lossless PNG output</div>
        </div>
      </div>`;

    // session
    const e = parseInt(sessionStorage.getItem('gm_enc') || '0') + 1;
    sessionStorage.setItem('gm_enc', e);
    const ev = JSON.parse(sessionStorage.getItem('gm_ev') || '[]');
    ev.push({ type: 'encode', title: 'Image watermarked', detail: `${pb} bytes · ${clone.width}×${clone.height}px`, payload: wmt.value.trim(), time: new Date().toLocaleTimeString() });
    sessionStorage.setItem('gm_ev', JSON.stringify(ev));
    toast('Watermark embedded', 'ok');
  } catch(err) {
    progArea.classList.add('hidden');
    resultArea.innerHTML = `<div class="result-row err"><span class="result-pip"></span><div><div class="result-label">Failed</div><div class="result-sub">${err.message}</div></div></div>`;
    toast(err.message, 'err');
  }
  encBtn.disabled = false;
});

dlBtn.addEventListener('click', () => {
  if (!blobUrl) return;
  const a = document.createElement('a'); a.href = blobUrl; a.download = 'ghostmark_watermarked.png'; a.click();
});

function anim(a, b, ms) {
  return new Promise(r => {
    const n = 30, s = (b - a) / n; let v = a;
    const t = setInterval(() => { v = Math.min(v + s, b); progBar.style.width = v + '%'; if (v >= b) { clearInterval(t); r(); } }, ms / n);
  });
}

function reset() { resultArea.innerHTML = ''; dlBtn.classList.add('hidden'); cmpSection.classList.add('hidden'); progArea.classList.add('hidden'); }
function fmt(b) { return b < 1024 ? b + ' B' : b < 1048576 ? (b/1024).toFixed(1) + ' KB' : (b/1048576).toFixed(1) + ' MB'; }

function toast(msg, type = 'ok') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="material-symbols-outlined">${type === 'ok' ? 'check_circle' : 'error'}</span>${msg}`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3500);
}
