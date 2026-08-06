function render() {
  const evs  = JSON.parse(sessionStorage.getItem('gm_ev') || '[]');
  const list = document.getElementById('vault-list');
  if (!evs.length) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-outlined">folder_open</span>
        <p>No records yet. Encode or validate an image to build history.</p>
        <a href="/encoder.html" class="btn btn-outline">
          <span class="material-symbols-outlined">lock</span>Go to Encoder
        </a>
      </div>`;
    return;
  }
  list.innerHTML = `<div class="vault-list">` +
    evs.slice().reverse().map(e => `
      <div class="vault-row ${e.type}">
        <span class="vault-dot"></span>
        <div class="vault-body">
          <div class="vault-title">${e.title}</div>
          <div class="vault-sub">${e.detail}</div>
          ${e.payload ? `<div class="vault-payload-text">${esc(e.payload)}</div>` : ''}
        </div>
        <div class="vault-time">${e.time}</div>
      </div>`).join('') +
  `</div>`;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

document.getElementById('clear-btn').addEventListener('click', () => {
  ['gm_enc','gm_scan','gm_ver','gm_ev'].forEach(k => sessionStorage.removeItem(k));
  render();
});

render();
