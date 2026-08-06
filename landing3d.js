import * as THREE from 'three';

// Initialize 3D Scene
export function init3DLanding() {
  const container = document.getElementById('intro');
  const canvas = document.getElementById('stage3d');
  const cue = document.getElementById('scroll-cue');
  if (!container || !canvas) return;

  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  scene.fog = new THREE.FogExp2(0x050505, 0.04);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 2.2, 9);
  camera.lookAt(0, 2.0, 0);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Lights
  const ambientLight = new THREE.AmbientLight(0x1a1a24, 1.2);
  scene.add(ambientLight);

  const mainSpot = new THREE.SpotLight(0xc8f000, 4, 25, Math.PI / 4, 0.5, 1);
  mainSpot.position.set(0, 8, 4);
  mainSpot.castShadow = true;
  mainSpot.shadow.mapSize.width = 1024;
  mainSpot.shadow.mapSize.height = 1024;
  scene.add(mainSpot);

  const backRim = new THREE.DirectionalLight(0x3a55ff, 2.5);
  backRim.position.set(-5, 6, -4);
  scene.add(backRim);

  const wallGlow = new THREE.PointLight(0xc8f000, 0, 10);
  wallGlow.position.set(0, 2.8, -1.5);
  scene.add(wallGlow);

  // Environment: Floor & Wall
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0c,
    roughness: 0.4,
    metalness: 0.6
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Grid helper on floor for sci-fi look
  const grid = new THREE.GridHelper(30, 30, 0xc8f000, 0x1f1f28);
  grid.position.y = 0.01;
  grid.material.opacity = 0.15;
  grid.material.transparent = true;
  scene.add(grid);

  const wallGeo = new THREE.PlaneGeometry(30, 15);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x08080a,
    roughness: 0.8,
    metalness: 0.2
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 7.5, -2);
  wall.receiveShadow = true;
  scene.add(wall);

  // ----------------------------------------------------
  // BUILD 3D CHARACTER (Hierarchical Rig)
  // ----------------------------------------------------
  const charGroup = new THREE.Group();
  scene.add(charGroup);

  // Materials
  const hoodMat = new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 0.7 });
  const innerHoodMat = new THREE.MeshStandardMaterial({ color: 0x050507, roughness: 0.9 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0x18181f, roughness: 0.5 });
  const canMat = new THREE.MeshStandardMaterial({ color: 0x22222a, metalness: 0.8, roughness: 0.2 });
  const nozzleMat = new THREE.MeshBasicMaterial({ color: 0xc8f000 });

  // Root Pivot (Hip)
  const hipPivot = new THREE.Group();
  hipPivot.position.y = 1.6;
  charGroup.add(hipPivot);

  // Torso / Hoodie Body
  const torsoGeo = new THREE.CylinderGeometry(0.38, 0.28, 1.1, 12);
  const torso = new THREE.Mesh(torsoGeo, hoodMat);
  torso.position.y = 0.45;
  torso.castShadow = true;
  hipPivot.add(torso);

  // Head & Hood Group (Pivots at neck)
  const neckPivot = new THREE.Group();
  neckPivot.position.y = 1.05;
  hipPivot.add(neckPivot);

  // Hood Outer
  const hoodOuterGeo = new THREE.SphereGeometry(0.36, 16, 16);
  const hoodOuter = new THREE.Mesh(hoodOuterGeo, hoodMat);
  hoodOuter.castShadow = true;
  neckPivot.add(hoodOuter);

  // Hood Opening (Dark Void Inside)
  const hoodVoidGeo = new THREE.SphereGeometry(0.31, 16, 16);
  const hoodVoid = new THREE.Mesh(hoodVoidGeo, innerHoodMat);
  hoodVoid.position.set(0, -0.02, 0.06);
  neckPivot.add(hoodVoid);

  // Eyes (Glowing Narrow Slivers)
  const eyeGroup = new THREE.Group();
  eyeGroup.position.set(0, 0.04, 0.28);
  neckPivot.add(eyeGroup);

  const leftEyeGeo = new THREE.BoxGeometry(0.09, 0.025, 0.02);
  const rightEyeGeo = new THREE.BoxGeometry(0.09, 0.025, 0.02);
  const leftEye = new THREE.Mesh(leftEyeGeo, eyeMat);
  const rightEye = new THREE.Mesh(rightEyeGeo, eyeMat);
  leftEye.position.x = -0.11;
  rightEye.position.x = 0.11;
  leftEye.rotation.z = -0.15; // suspicious angle
  rightEye.rotation.z = 0.15;
  eyeGroup.add(leftEye);
  eyeGroup.add(rightEye);

  // --- LEGS ---
  const leftLegPivot = new THREE.Group();
  const rightLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.18, 0, 0);
  rightLegPivot.position.set(0.18, 0, 0);
  hipPivot.add(leftLegPivot);
  hipPivot.add(rightLegPivot);

  const legGeo = new THREE.CylinderGeometry(0.11, 0.08, 0.85, 8);
  const leftLeg = new THREE.Mesh(legGeo, hoodMat);
  const rightLeg = new THREE.Mesh(legGeo, hoodMat);
  leftLeg.position.y = -0.42;
  rightLeg.position.y = -0.42;
  leftLeg.castShadow = true;
  rightLeg.castShadow = true;
  leftLegPivot.add(leftLeg);
  rightLegPivot.add(rightLeg);

  // --- ARMS ---
  const leftArmPivot = new THREE.Group();
  const rightArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.42, 0.85, 0);
  rightArmPivot.position.set(0.42, 0.85, 0);
  hipPivot.add(leftArmPivot);
  hipPivot.add(rightArmPivot);

  const upperArmGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.5, 8);
  const leftArm = new THREE.Mesh(upperArmGeo, hoodMat);
  const rightArm = new THREE.Mesh(upperArmGeo, hoodMat);
  leftArm.position.y = -0.25;
  rightArm.position.y = -0.25;
  leftArm.castShadow = true;
  rightArm.castShadow = true;
  leftArmPivot.add(leftArm);
  rightArmPivot.add(rightArm);

  // Right Forearm + Hand + Spray Can
  const rightForearmPivot = new THREE.Group();
  rightForearmPivot.position.y = -0.5;
  rightArmPivot.add(rightForearmPivot);

  const forearmGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.45, 8);
  const rightForearm = new THREE.Mesh(forearmGeo, hoodMat);
  rightForearm.position.y = -0.22;
  rightForearm.castShadow = true;
  rightForearmPivot.add(rightForearm);

  // Spray Can in Hand
  const canGroup = new THREE.Group();
  canGroup.position.set(0, -0.45, 0.1);
  rightForearmPivot.add(canGroup);

  const canMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 12), canMat);
  canGroup.add(canMesh);
  const nozzleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.04, 8), nozzleMat);
  nozzleMesh.position.y = 0.12;
  canGroup.add(nozzleMesh);

  // Nozzle Tip World Position Anchor (for particles)
  const sprayTipAnchor = new THREE.Object3D();
  sprayTipAnchor.position.set(0, 0.14, 0);
  canGroup.add(sprayTipAnchor);

  // Left Forearm
  const leftForearmPivot = new THREE.Group();
  leftForearmPivot.position.y = -0.5;
  leftArmPivot.add(leftForearmPivot);
  const leftForearm = new THREE.Mesh(forearmGeo, hoodMat);
  leftForearm.position.y = -0.22;
  leftForearmPivot.add(leftForearm);

  // ----------------------------------------------------
  // SPRAY PARTICLES & NEON WALL TEXT
  // ----------------------------------------------------
  // Spray Particle System
  const particleCount = 200;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleAlphas = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = 0;
    particlePositions[i * 3 + 1] = 0;
    particlePositions[i * 3 + 2] = 0;
    particleAlphas[i] = 0;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('alpha', new THREE.BufferAttribute(particleAlphas, 1));

  const particleMat = new THREE.PointsMaterial({
    color: 0xc8f000,
    size: 0.12,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const sprayParticles = new THREE.Points(particleGeo, particleMat);
  scene.add(sprayParticles);

  // Create 3D Wall Text Canvas Texture
  const textCanvas = document.createElement('canvas');
  textCanvas.width = 2048;
  textCanvas.height = 512;
  const textCtx = textCanvas.getContext('2d');

  const textTexture = new THREE.CanvasTexture(textCanvas);
  const textPlaneGeo = new THREE.PlaneGeometry(10, 2.5);
  const textPlaneMat = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    depthWrite: false
  });
  const textPlane = new THREE.Mesh(textPlaneGeo, textPlaneMat);
  textPlane.position.set(0, 3.2, -1.98); // right on top of the wall
  scene.add(textPlane);

  function drawWallProgress(progressPct) {
    textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);

    const fullText = "GHOSTMARK";
    const charsToShow = Math.floor(progressPct * fullText.length);
    const partialCharRatio = (progressPct * fullText.length) % 1;

    textCtx.font = "bold 160px 'DM Serif Display', Georgia, serif";
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";

    // Neon Glow background
    textCtx.shadowColor = "#c8f000";
    textCtx.shadowBlur = 40;
    textCtx.fillStyle = "#c8f000";

    const currentString = fullText.substring(0, charsToShow);
    textCtx.fillText(currentString, textCanvas.width / 2, textCanvas.height / 2);

    if (charsToShow < fullText.length && partialCharRatio > 0.1) {
      textCtx.shadowBlur = 60;
      textCtx.fillStyle = "#ffffff";
      const nextChar = fullText[charsToShow];
      const charWidth = textCtx.measureText(fullText).width / fullText.length;
      const startX = (textCanvas.width - textCtx.measureText(fullText).width) / 2;
      const x = startX + charsToShow * charWidth + charWidth / 2;
      textCtx.fillText(nextChar, x, textCanvas.height / 2);
    }

    textTexture.needsUpdate = true;
  }

  // ----------------------------------------------------
  // ANIMATION TIMELINE (Total: 10.5 Seconds)
  // ----------------------------------------------------
  const DURATION = 10500; // ms
  let animStartTime = null;

  function emitParticles(fromPos, toPos) {
    const positions = particleGeo.attributes.position.array;
    for (let i = 0; i < 15; i++) {
      const idx = Math.floor(Math.random() * particleCount) * 3;
      const spreadX = (Math.random() - 0.5) * 0.4;
      const spreadY = (Math.random() - 0.5) * 0.4;
      const spreadZ = (Math.random() - 0.5) * 0.4;

      positions[idx] = fromPos.x + spreadX;
      positions[idx + 1] = fromPos.y + spreadY;
      positions[idx + 2] = fromPos.z + spreadZ;
    }
    particleGeo.attributes.position.needsUpdate = true;
  }

  function animate(timestamp) {
    if (!animStartTime) animStartTime = timestamp;
    const elapsed = timestamp - animStartTime;
    const t = Math.min(elapsed / DURATION, 1.0);

    // Timeline phases:
    // 0.00 - 0.25 (0s - 2.6s): Walk in from left (-5 to 0)
    // 0.25 - 0.40 (2.6s - 4.2s): Stop & Turn 90° towards back wall
    // 0.40 - 0.75 (4.2s - 7.8s): Raise arm up high, spray across wall (Writing "GHOSTMARK")
    // 0.75 - 0.90 (7.8s - 9.45s): Lower arm, step back, turn head back over shoulder (Guilty look)
    // 0.90 - 1.00 (9.45s - 10.5s): Freeze pose, reveal scroll button

    let charX = 0, charZ = 0, bodyRotY = 0, headRotY = 0, headRotX = 0;
    let rightArmRotX = 0, rightArmRotZ = 0, rightForearmRotX = 0;
    let leftArmRotX = 0, legWalkAngle = 0;
    let isSpraying = false;
    let sprayProgress = 0;

    if (t < 0.25) {
      // Walk In
      const p = t / 0.25;
      charX = -5 + p * 5; // -5 to 0
      bodyRotY = Math.PI / 2; // facing right (+X)
      legWalkAngle = Math.sin(p * Math.PI * 10) * 0.6;
      leftArmRotX = -legWalkAngle * 0.8;
      rightArmRotX = legWalkAngle * 0.8;
      // Head looking nervous
      headRotY = Math.sin(p * Math.PI * 4) * 0.4;
    } else if (t < 0.40) {
      // Turn to Wall
      const p = (t - 0.25) / 0.15;
      charX = 0;
      bodyRotY = Math.PI / 2 + p * (Math.PI / 2); // Rotate to face wall (Math.PI)
      legWalkAngle = 0;
      headRotY = (1 - p) * 0.2;
    } else if (t < 0.75) {
      // Spraying on Wall
      const p = (t - 0.40) / 0.35;
      charX = -3.2 + p * 6.4; // Moves hand across -3.2 to +3.2
      bodyRotY = Math.PI; // facing wall
      isSpraying = true;
      sprayProgress = p;

      // Arm raised high & pointing at wall
      rightArmRotX = -Math.PI / 2 - 0.2; // raise straight up/forward towards wall
      rightArmRotZ = -0.3 + Math.sin(p * Math.PI * 8) * 0.15; // writing motion
      rightForearmRotX = -0.4;

      wallGlow.intensity = 3 + Math.sin(p * 20) * 1.5;
      wallGlow.position.x = charX;
    } else if (t < 0.90) {
      // Step Back & Guilty Look Over Shoulder
      const p = (t - 0.75) / 0.15;
      charX = 3.2 - p * 0.8;
      charZ = p * 1.2; // step backwards away from wall
      bodyRotY = Math.PI - p * 0.5; // turn torso slightly towards camera

      // Arm lowers
      rightArmRotX = (-Math.PI / 2 - 0.2) * (1 - p);
      rightArmRotZ = 0;
      rightForearmRotX = 0;

      // Head turns sharp back over left shoulder towards camera!
      headRotY = p * (Math.PI * 0.75);
      headRotX = -0.15;

      wallGlow.intensity = Math.max(0, 3 * (1 - p));
    } else {
      // Hold final guilty pose
      charX = 2.4;
      charZ = 1.2;
      bodyRotY = Math.PI - 0.5;
      rightArmRotX = 0;
      headRotY = Math.PI * 0.75;
      headRotX = -0.15;
      wallGlow.intensity = 0.5;
      sprayProgress = 1.0;

      if (cue && !cue.classList.contains('visible')) {
        cue.classList.add('visible');
      }
    }

    // Apply transforms to character rig
    charGroup.position.set(charX, 0, charZ);
    hipPivot.rotation.y = bodyRotY;

    // Legs walk
    leftLegPivot.rotation.x = legWalkAngle;
    rightLegPivot.rotation.x = -legWalkAngle;

    // Head rotation
    neckPivot.rotation.y = headRotY;
    neckPivot.rotation.x = headRotX;

    // Arm rotations
    rightArmPivot.rotation.x = rightArmRotX;
    rightArmPivot.rotation.z = rightArmRotZ;
    rightForearmPivot.rotation.x = rightForearmRotX;
    leftArmPivot.rotation.x = leftArmRotX;

    // Draw spray & wall text update
    if (isSpraying) {
      drawWallProgress(sprayProgress);
      const tipPos = new THREE.Vector3();
      sprayTipAnchor.getWorldPosition(tipPos);
      emitParticles(tipPos, new THREE.Vector3(tipPos.x, 3.2, -1.98));
    } else if (t >= 0.75) {
      drawWallProgress(1.0);
    }

    // Camera subtle cinematic drift
    camera.position.x = Math.sin(t * Math.PI) * 0.5;
    camera.lookAt(0, 2.2, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Auto-init if DOM ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init3DLanding();
} else {
  document.addEventListener('DOMContentLoaded', init3DLanding);
}
