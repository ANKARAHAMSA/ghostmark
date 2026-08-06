function update() {
  const enc  = parseInt(sessionStorage.getItem('gm_enc')  || '0');
  const scan = parseInt(sessionStorage.getItem('gm_scan') || '0');
  const ver  = parseInt(sessionStorage.getItem('gm_ver')  || '0');

  countUp('s-enc',  enc);
  countUp('s-scan', scan);
  countUp('s-ver',  ver);

  const feed = document.getElementById('activity-feed');
  const evs  = JSON.parse(sessionStorage.getItem('gm_ev') || '[]');
  if (!evs.length) {
    feed.innerHTML = '<div class="act-empty">No activity yet — encode or scan an image to see events here.</div>';
  } else {
    feed.innerHTML = evs.slice().reverse().map(e => `
      <div class="act-row ${e.type}">
        <span class="act-dot"></span>
        <div class="act-body">
          <div class="act-name">${e.title}</div>
          <div class="act-detail">${e.detail}</div>
        </div>
        <div class="act-time">${e.time}</div>
      </div>`).join('');
  }
}

function countUp(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let v = 0; const step = Math.max(1, Math.ceil(target / 30));
  const t = setInterval(() => { v = Math.min(v + step, target); el.textContent = v; if (v >= target) clearInterval(t); }, 20);
}

update();
setInterval(update, 2000);
