/* empty css               */import"./cursor-BM6MqkFw.js";function e(){let e=JSON.parse(sessionStorage.getItem(`gm_ev`)||`[]`),n=document.getElementById(`vault-list`);if(!e.length){n.innerHTML=`
      <div class="empty-state">
        <span class="material-symbols-outlined">folder_open</span>
        <p>No records yet. Encode or validate an image to build history.</p>
        <a href="/encoder.html" class="btn btn-outline">
          <span class="material-symbols-outlined">lock</span>Go to Encoder
        </a>
      </div>`;return}n.innerHTML=`<div class="vault-list">`+e.slice().reverse().map(e=>`
      <div class="vault-row ${e.type}">
        <span class="vault-dot"></span>
        <div class="vault-body">
          <div class="vault-title">${e.title}</div>
          <div class="vault-sub">${e.detail}</div>
          ${e.payload?`<div class="vault-payload-text">${t(e.payload)}</div>`:``}
        </div>
        <div class="vault-time">${e.time}</div>
      </div>`).join(``)+`</div>`}function t(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}document.getElementById(`clear-btn`).addEventListener(`click`,()=>{[`gm_enc`,`gm_scan`,`gm_ver`,`gm_ev`].forEach(e=>sessionStorage.removeItem(e)),e()}),e();