import { embedWatermark, loadImageToCanvas, canvasToBlob } from './watermark.js';
import { embedFrequency, frequencyCapacity } from './frequency_watermark.js';

let imgData = null, origCanvas = null, blobUrl = null;
let selectedAlgo = 'lsb'; // 'lsb' | 'dwtdct'
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

// ── Algorithm selector ────────────────────────────────────────────────
const algoCards = document.querySelectorAll('.algo-card');
algoCards.forEach(card => {
  card.addEventListener('click', () => {
    algoCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    selectedAlgo = card.dataset.algo;
    // Update capacity display if image already loaded
    if (imgData) updateCapacity(imgData.width, imgData.height);
    reset();
  });
});

function updateCapacity(w, h) {
  if (selectedAlgo === 'dwtdct') {
    cap.textContent = fmt(frequencyCapacity(w, h));
  } else {
    cap.textContent = fmt(Math.floor(w * h * 6 / 8));
  }
}

// ── Drop zone ─────────────────────────────────────────────────────────
dz.addEventListener('click', () => { fi.value = ''; fi.click(); });
dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); });
dz.addEventListener('dragleave', () => dz.classList.remove('over'));
dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('over'); if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });
fi.addEventListener('change', e => { if (e.target.files[0]) load(e.target.files[0]); });

async function load(file) {
  if (!file.type.startsWith('image/')) { toast('Not an image file', 'err'); return; }
  const r = await loadImageToCanvas(file);
  imgData = r.imageData; origCanvas = r.canvas;
  const pc = prevCanvas.getContext('2d');
  pc.clearRect(0, 0, prevCanvas.width, prevCanvas.height);
  prevCanvas.width = r.width; prevCanvas.height = r.height;
  pc.drawImage(r.canvas, 0, 0);

  fi.value = ''; // Reset file input value
  prevCanvas.classList.remove('hidden'); dzInner.classList.add('hidden');
  dims.textContent = `${r.width}×${r.height}`;
  sz.textContent   = fmt(file.size);
  updateCapacity(r.width, r.height);
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
    const clone = new ImageData(new Uint8ClampedArray(imgData.data), imgData.width, imgData.height);
    const isFreq = selectedAlgo === 'dwtdct';
    const algoLabel = isFreq ? 'DWT-DCT + Arnold Cat Map' : 'LSB Steganography';

    if (isFreq) {
      await anim(0, 20, 200); progLbl.textContent = 'Scrambling with Arnold Cat Map…';
      await anim(20, 55, 400); progLbl.textContent = 'Applying Haar DWT on image blocks…';
      await anim(55, 75, 300); progLbl.textContent = 'Modifying DCT mid-frequency coefficients…';
      embedFrequency(clone, wmt.value.trim());
      await anim(75, 100, 250);
    } else {
      await anim(0, 40, 300); progLbl.textContent = 'Analysing pixel matrix…';
      await anim(40, 80, 400); progLbl.textContent = 'Writing payload to LSB channels…';
      embedWatermark(clone, wmt.value.trim());
      await anim(80, 100, 200);
    }

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
          <div class="result-sub">${pb} bytes · ${clone.width}×${clone.height}px · ${algoLabel} · lossless PNG output</div>
        </div>
      </div>`;

    // session
    const e = parseInt(sessionStorage.getItem('gm_enc') || '0') + 1;
    sessionStorage.setItem('gm_enc', e);
    const ev = JSON.parse(sessionStorage.getItem('gm_ev') || '[]');
    ev.push({
      type: 'encode',
      title: 'Image watermarked',
      detail: `${pb} bytes · ${clone.width}×${clone.height}px · ${isFreq ? 'DWT-DCT' : 'LSB'}`,
      payload: wmt.value.trim(),
      algo: selectedAlgo,
      time: new Date().toLocaleTimeString()
    });
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
  const a = document.createElement('a'); a.href = blobUrl;
  a.download = selectedAlgo === 'dwtdct' ? 'ghostmark_dwtdct.png' : 'ghostmark_watermarked.png';
  a.click();
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
