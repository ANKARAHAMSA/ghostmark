// Ghostmark Ambient Cursor Spotlight

(function initSpotlight() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  const spotlight = document.createElement('div');
  spotlight.className = 'cursor-spotlight';
  document.body.appendChild(spotlight);

  let mouseX = -200, mouseY = -200;
  let spotX = -200, spotY = -200;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function loop() {
    spotX += (mouseX - spotX) * 0.12;
    spotY += (mouseY - spotY) * 0.12;

    spotlight.style.transform = `translate3d(${spotX}px, ${spotY}px, 0)`;

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
