// Ghostmark Custom Radar Cursor Follower

(function initCursor() {
  // Disable on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  // Create cursor DOM elements
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';

  const ring = document.createElement('div');
  ring.className = 'cursor-ring';

  const spotlight = document.createElement('div');
  spotlight.className = 'cursor-spotlight';

  document.body.appendChild(spotlight);
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let spotX = -100, spotY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  }, { passive: true });

  // Interactive hover detection
  const interactiveSelector = 'a, button, .dropzone, input, textarea, .btn, [role="button"]';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      ring.classList.add('active');
      dot.classList.add('active');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      ring.classList.remove('active');
      dot.classList.remove('active');
    }
  }, { passive: true });

  // Smooth RAF Lerp loop
  function loop() {
    ringX += (mouseX - ringX) * 0.2;
    ringY += (mouseY - ringY) * 0.2;
    spotX += (mouseX - spotX) * 0.1;
    spotY += (mouseY - spotY) * 0.1;

    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    spotlight.style.transform = `translate3d(${spotX}px, ${spotY}px, 0)`;

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
