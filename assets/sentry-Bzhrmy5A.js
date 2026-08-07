/* empty css               */import"./cursor-BM6MqkFw.js";function e(){let e=parseInt(sessionStorage.getItem(`gm_enc`)||`0`),n=parseInt(sessionStorage.getItem(`gm_scan`)||`0`),r=parseInt(sessionStorage.getItem(`gm_ver`)||`0`);t(`s-enc`,e),t(`s-scan`,n),t(`s-ver`,r);let i=document.getElementById(`activity-feed`),a=JSON.parse(sessionStorage.getItem(`gm_ev`)||`[]`);i.innerHTML=a.length?a.slice().reverse().map(e=>`
      <div class="act-row ${e.type}">
        <span class="act-dot"></span>
        <div class="act-body">
          <div class="act-name">${e.title}</div>
          <div class="act-detail">${e.detail}</div>
        </div>
        <div class="act-time">${e.time}</div>
      </div>`).join(``):`<div class="act-empty">No activity yet — encode or scan an image to see events here.</div>`}function t(e,t){let n=document.getElementById(e);if(!n)return;let r=0,i=Math.max(1,Math.ceil(t/30)),a=setInterval(()=>{r=Math.min(r+i,t),n.textContent=r,r>=t&&clearInterval(a)},20)}e(),setInterval(e,2e3);