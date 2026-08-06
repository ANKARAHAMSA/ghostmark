/* empty css               */import"./cursor-BM6MqkFw.js";import{a as e,i as t,t as n}from"./watermark-CMhcE80_.js";var r=null,i=0,a=null,o=e=>document.getElementById(e),s=o(`drop-zone`),c=o(`dz-inner`),l=o(`file-input`),u=o(`preview-canvas`),d=o(`scan-btn`),f=o(`scan-idle`),p=o(`scan-running`),m=o(`result-section`);s.addEventListener(`click`,()=>{l.value=``,l.click()}),s.addEventListener(`dragover`,e=>{e.preventDefault(),s.classList.add(`over`)}),s.addEventListener(`dragleave`,()=>s.classList.remove(`over`)),s.addEventListener(`drop`,e=>{e.preventDefault(),s.classList.remove(`over`),e.dataTransfer.files[0]&&h(e.dataTransfer.files[0])}),l.addEventListener(`change`,e=>{e.target.files[0]&&h(e.target.files[0])});async function h(t){if(!t.type.startsWith(`image/`)){_(`Not an image file`,`err`);return}let n=await e(t);r=n.imageData,i=n.width*n.height,a=n.canvas;let o=u.getContext(`2d`);o.clearRect(0,0,u.width,u.height),u.width=n.width,u.height=n.height,o.drawImage(n.canvas,0,0),l.value=``,u.classList.remove(`hidden`),c.classList.add(`hidden`),d.disabled=!1,f.classList.remove(`hidden`),p.classList.add(`hidden`),m.classList.add(`hidden`),m.innerHTML=``}d.addEventListener(`click`,async()=>{if(!r)return;d.disabled=!0,f.classList.add(`hidden`),p.classList.remove(`hidden`),m.classList.add(`hidden`),await new Promise(e=>setTimeout(e,600));let e=t(r),s=n(r,e.found),c=JSON.parse(sessionStorage.getItem(`gm_ev`)||`[]`);if(e.found){let t=parseInt(sessionStorage.getItem(`gm_ver`)||`0`)+1,n=parseInt(sessionStorage.getItem(`gm_scan`)||`0`)+1;sessionStorage.setItem(`gm_ver`,t),sessionStorage.setItem(`gm_scan`,n),c.push({type:`scan_found`,title:`Watermark & Integrity Scanned`,detail:`${new TextEncoder().encode(e.message).length} bytes | Integrity: ${s.overallScore}%`,payload:e.message,time:new Date().toLocaleTimeString()})}else{let e=parseInt(sessionStorage.getItem(`gm_scan`)||`0`)+1;sessionStorage.setItem(`gm_scan`,e),c.push({type:`scan_empty`,title:`No watermark found`,detail:`${i.toLocaleString()} pixels | Integrity: ${s.overallScore}%`,time:new Date().toLocaleTimeString()})}sessionStorage.setItem(`gm_ev`,JSON.stringify(c)),p.classList.add(`hidden`),m.classList.remove(`hidden`);let l=new Date().toLocaleTimeString();if(e.found){let t=new TextEncoder().encode(e.message).length;m.innerHTML=`
      <div class="payload-status-row">
        <span class="payload-pip found"></span>
        <span class="payload-status-label found">Watermark Authentic</span>
        <span class="payload-status-sub">${l}</span>
      </div>

      <div class="payload-box">
        <div class="payload-box-label">Decoded Payload (Your Watermark)</div>
        <div class="payload-text" id="pt">${g(e.message)}</div>
        <button class="copy-btn" id="copy-btn">
          <span class="material-symbols-outlined">content_copy</span>Copy
        </button>
      </div>

      <div class="payload-meta">
        <div><div class="payload-meta-val">${t}</div><div class="payload-meta-key">Bytes</div></div>
        <div><div class="payload-meta-val">${s.overallScore}%</div><div class="payload-meta-key">LSB Integrity</div></div>
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
          <img src="${a.toDataURL()}" class="heatmap-img" />
          <canvas id="hm-canvas" class="heatmap-canvas"></canvas>
        </div>
        <div class="heatmap-legend">
          <div class="legend-item"><span class="legend-color intact"></span>Intact LSB Watermark</div>
          <div class="legend-item"><span class="legend-color warning"></span>Compression Shift</div>
          <div class="legend-item"><span class="legend-color tampered"></span>Altered / Edited</div>
        </div>
      </div>
    `,o(`copy-btn`).addEventListener(`click`,function(){navigator.clipboard.writeText(e.message),this.innerHTML=`<span class="material-symbols-outlined">check</span>Copied`,setTimeout(()=>this.innerHTML=`<span class="material-symbols-outlined">content_copy</span>Copy`,2e3)});let n=!1;o(`toggle-heatmap-btn`).addEventListener(`click`,()=>{n=!n;let e=o(`heatmap-view`);if(n){e.classList.remove(`hidden`);let t=o(`hm-canvas`);s.renderHeatmap(t)}else e.classList.add(`hidden`)}),_(`Watermark & Integrity Verified`,`ok`)}else{m.innerHTML=`
      <div class="payload-status-row">
        <span class="payload-pip notfound"></span>
        <span class="payload-status-label notfound">No Watermark Detected</span>
        <span class="payload-status-sub">${l}</span>
      </div>

      <div class="payload-meta" style="margin-bottom:16px;">
        <div><div class="payload-meta-val">0%</div><div class="payload-meta-key">Watermark Coverage</div></div>
        <div><div class="payload-meta-val">${i.toLocaleString()}</div><div class="payload-meta-key">Pixels Scanned</div></div>
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
          <img src="${a.toDataURL()}" class="heatmap-img" />
          <canvas id="hm-canvas" class="heatmap-canvas"></canvas>
        </div>
        <div class="heatmap-legend">
          <div class="legend-item"><span class="legend-color neutral" style="background:rgba(255,255,255,0.2);"></span>Unwatermarked Standard Pixel</div>
          <div class="legend-item"><span class="legend-color tampered"></span>Compression / Bit Noise Region</div>
        </div>
      </div>
    `;let e=!1;o(`toggle-heatmap-btn`).addEventListener(`click`,()=>{e=!e;let t=o(`heatmap-view`);if(e){t.classList.remove(`hidden`);let e=o(`hm-canvas`);s.renderHeatmap(e)}else t.classList.add(`hidden`)}),_(`No watermark found`,`err`)}d.disabled=!1});function g(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function _(e,t=`ok`){let n=document.createElement(`div`);n.className=`toast ${t}`,n.innerHTML=`<span class="material-symbols-outlined">${t===`ok`?`check_circle`:`error`}</span>${e}`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add(`show`)),setTimeout(()=>{n.classList.remove(`show`),setTimeout(()=>n.remove(),300)},3500)}