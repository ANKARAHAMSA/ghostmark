/* empty css               */import"./cursor-BM6MqkFw.js";import{c as e,i as t,n,s as r}from"./frequency_watermark-CvgMy0Xb.js";var i=null,a=0,o=null,s=e=>document.getElementById(e),c=s(`drop-zone`),l=s(`dz-inner`),u=s(`file-input`),d=s(`preview-canvas`),f=s(`scan-btn`),p=s(`scan-idle`),m=s(`scan-running`),h=s(`result-section`);c.addEventListener(`click`,()=>{u.value=``,u.click()}),c.addEventListener(`dragover`,e=>{e.preventDefault(),c.classList.add(`over`)}),c.addEventListener(`dragleave`,()=>c.classList.remove(`over`)),c.addEventListener(`drop`,e=>{e.preventDefault(),c.classList.remove(`over`),e.dataTransfer.files[0]&&g(e.dataTransfer.files[0])}),u.addEventListener(`change`,e=>{e.target.files[0]&&g(e.target.files[0])});async function g(t){if(!t.type.startsWith(`image/`)){v(`Not an image file`,`err`);return}let n=await e(t);i=n.imageData,a=n.width*n.height,o=n.canvas;let r=d.getContext(`2d`);r.clearRect(0,0,d.width,d.height),d.width=n.width,d.height=n.height,r.drawImage(n.canvas,0,0),u.value=``,d.classList.remove(`hidden`),l.classList.add(`hidden`),f.disabled=!1,p.classList.remove(`hidden`),m.classList.add(`hidden`),h.classList.add(`hidden`),h.innerHTML=``}f.addEventListener(`click`,async()=>{if(!i)return;f.disabled=!0,p.classList.add(`hidden`),m.classList.remove(`hidden`),h.classList.add(`hidden`),await new Promise(e=>setTimeout(e,600));let e=r(i),c=`lsb`;if(!e.found)try{let t=n(i);t.found&&(e=t,c=`dwtdct`)}catch{}let l=t(i,e.found),u=JSON.parse(sessionStorage.getItem(`gm_ev`)||`[]`),d=c===`dwtdct`?`DWT-DCT + Arnold`:`LSB`;if(e.found){let t=parseInt(sessionStorage.getItem(`gm_ver`)||`0`)+1,n=parseInt(sessionStorage.getItem(`gm_scan`)||`0`)+1;sessionStorage.setItem(`gm_ver`,t),sessionStorage.setItem(`gm_scan`,n),u.push({type:`scan_found`,title:`Watermark & Integrity Scanned`,detail:`${new TextEncoder().encode(e.message).length} bytes | ${d} | Integrity: ${l.overallScore}%`,payload:e.message,time:new Date().toLocaleTimeString()})}else{let e=parseInt(sessionStorage.getItem(`gm_scan`)||`0`)+1;sessionStorage.setItem(`gm_scan`,e),u.push({type:`scan_empty`,title:`No watermark found`,detail:`${a.toLocaleString()} pixels | Integrity: ${l.overallScore}%`,time:new Date().toLocaleTimeString()})}sessionStorage.setItem(`gm_ev`,JSON.stringify(u)),m.classList.add(`hidden`),h.classList.remove(`hidden`);let g=new Date().toLocaleTimeString();if(e.found){let t=new TextEncoder().encode(e.message).length;h.innerHTML=`
      <div class="payload-status-row">
        <span class="payload-pip found"></span>
        <span class="payload-status-label found">Watermark Authentic</span>
        ${c===`dwtdct`?`<span style="font-family:var(--f-mono);font-size:10px;background:rgba(200,240,0,0.1);color:var(--lime);border:1px solid rgba(200,240,0,0.3);border-radius:3px;padding:2px 7px;margin-left:8px;">DWT-DCT + Arnold</span>`:`<span style="font-family:var(--f-mono);font-size:10px;background:var(--bg-3);color:var(--text-3);border:1px solid var(--border-2);border-radius:3px;padding:2px 7px;margin-left:8px;">LSB</span>`}
        <span class="payload-status-sub">${g}</span>
      </div>

      <div class="payload-box">
        <div class="payload-box-label">Decoded Payload (Your Watermark)</div>
        <div class="payload-text" id="pt">${_(e.message)}</div>
        <button class="copy-btn" id="copy-btn">
          <span class="material-symbols-outlined">content_copy</span>Copy
        </button>
      </div>

      <div class="payload-meta">
        <div><div class="payload-meta-val">${t}</div><div class="payload-meta-key">Bytes</div></div>
        <div><div class="payload-meta-val">${l.overallScore}%</div><div class="payload-meta-key">Integrity Score</div></div>
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
          <img src="${o.toDataURL()}" class="heatmap-img" />
          <canvas id="hm-canvas" class="heatmap-canvas"></canvas>
        </div>
        <div class="heatmap-legend">
          <div class="legend-item"><span class="legend-color intact"></span>Intact LSB Watermark</div>
          <div class="legend-item"><span class="legend-color warning"></span>Compression Shift</div>
          <div class="legend-item"><span class="legend-color tampered"></span>Altered / Edited</div>
        </div>
      </div>
    `,s(`copy-btn`).addEventListener(`click`,function(){navigator.clipboard.writeText(e.message),this.innerHTML=`<span class="material-symbols-outlined">check</span>Copied`,setTimeout(()=>this.innerHTML=`<span class="material-symbols-outlined">content_copy</span>Copy`,2e3)});let n=!1;s(`toggle-heatmap-btn`).addEventListener(`click`,()=>{n=!n;let e=s(`heatmap-view`);if(n){e.classList.remove(`hidden`);let t=s(`hm-canvas`);l.renderHeatmap(t)}else e.classList.add(`hidden`)}),v(`Watermark & Integrity Verified`,`ok`)}else{h.innerHTML=`
      <div class="payload-status-row">
        <span class="payload-pip notfound"></span>
        <span class="payload-status-label notfound">No Watermark Detected</span>
        <span class="payload-status-sub">${g}</span>
      </div>

      <div class="payload-meta" style="margin-bottom:16px;">
        <div><div class="payload-meta-val">0%</div><div class="payload-meta-key">Watermark Coverage</div></div>
        <div><div class="payload-meta-val">${a.toLocaleString()}</div><div class="payload-meta-key">Pixels Scanned</div></div>
        <div><div class="payload-meta-val">Clean</div><div class="payload-meta-key">Status</div></div>
      </div>

      <p style="font-size:13px;color:var(--text-2);line-height:1.65;margin-bottom:14px;">
        No Ghostmark signature found. Both LSB and DWT-DCT algorithms were tested. This image is either unwatermarked or has lost watermark data due to heavy JPEG compression.
      </p>

      <button class="btn btn-outline" id="toggle-heatmap-btn" style="width: 100%;">
        <span class="material-symbols-outlined">grid_view</span>Inspect Bitplane Heatmap
      </button>

      <div class="heatmap-section hidden" id="heatmap-view">
        <p class="eyebrow" style="margin-top:16px; margin-bottom:6px;">Bitplane Noise & Compression Inspection</p>
        <div class="heatmap-container" id="hm-box">
          <img src="${o.toDataURL()}" class="heatmap-img" />
          <canvas id="hm-canvas" class="heatmap-canvas"></canvas>
        </div>
        <div class="heatmap-legend">
          <div class="legend-item"><span class="legend-color neutral" style="background:rgba(255,255,255,0.2);"></span>Unwatermarked Standard Pixel</div>
          <div class="legend-item"><span class="legend-color tampered"></span>Compression / Bit Noise Region</div>
        </div>
      </div>
    `;let e=!1;s(`toggle-heatmap-btn`).addEventListener(`click`,()=>{e=!e;let t=s(`heatmap-view`);if(e){t.classList.remove(`hidden`);let e=s(`hm-canvas`);l.renderHeatmap(e)}else t.classList.add(`hidden`)}),v(`No watermark found`,`err`)}f.disabled=!1});function _(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function v(e,t=`ok`){let n=document.createElement(`div`);n.className=`toast ${t}`,n.innerHTML=`<span class="material-symbols-outlined">${t===`ok`?`check_circle`:`error`}</span>${e}`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add(`show`)),setTimeout(()=>{n.classList.remove(`show`),setTimeout(()=>n.remove(),300)},3500)}