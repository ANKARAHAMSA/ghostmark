/**
 * Ghostmark End-to-End Test Suite
 * Tests both LSB and DWT-DCT watermarking engines in Node.js
 * Uses a simulated ImageData object (no browser required)
 */

// ─── Polyfill TextEncoder/TextDecoder ─────────────────────────────
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// ─── Import engines ────────────────────────────────────────────────
import { embedWatermark, extractWatermark } from './watermark.js';
import { embedFrequency, extractFrequency, frequencyCapacity } from './frequency_watermark.js';

// ─── Helpers ───────────────────────────────────────────────────────
function makeImageData(width, height) {
  // Simulate realistic photo-like noise (not blank, not all-same-color)
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    // Gradient + noise to simulate real photo content
    data[i]     = Math.min(255, (x / width * 200) + (Math.sin(y * 0.1) * 30 + 30) | 0);
    data[i + 1] = Math.min(255, (y / height * 180) + (Math.cos(x * 0.08) * 25 + 25) | 0);
    data[i + 2] = Math.min(255, 80 + ((x * y) % 60));
    data[i + 3] = 255; // fully opaque
  }
  return { data, width, height };
}

function cloneImageData(imgData) {
  return {
    data: new Uint8ClampedArray(imgData.data),
    width: imgData.width,
    height: imgData.height
  };
}

function maxPixelDelta(original, modified) {
  let max = 0;
  for (let i = 0; i < original.data.length; i++) {
    const d = Math.abs(original.data[i] - modified.data[i]);
    if (d > max) max = d;
  }
  return max;
}

function avgPixelDelta(original, modified) {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < original.data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      sum += Math.abs(original.data[i + c] - modified.data[i + c]);
      count++;
    }
  }
  return (sum / count).toFixed(4);
}

// ─── Test runner ───────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅  ${name}`);
    passed++;
  } catch(e) {
    console.log(`  ❌  ${name}`);
    console.log(`       → ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(a, b, message) {
  if (a !== b) throw new Error(message || `Expected "${b}", got "${a}"`);
}

// ═══════════════════════════════════════════════════════════════════
console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║       GHOSTMARK END-TO-END TEST SUITE               ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

// ─── LSB Tests ─────────────────────────────────────────────────────
console.log('── LSB Steganography ─────────────────────────────────────\n');

test('LSB: Short payload embeds & extracts correctly', () => {
  const img = makeImageData(256, 256);
  const clone = cloneImageData(img);
  const msg = 'Hello Ghostmark!';
  embedWatermark(clone, msg);
  const result = extractWatermark(clone);
  assert(result.found, 'Watermark not found');
  assertEqual(result.message, msg, `Got: "${result.message}"`);
});

test('LSB: Long payload (512 bytes) embeds & extracts', () => {
  const img = makeImageData(512, 512);
  const clone = cloneImageData(img);
  const msg = '© 2025 Acme Corp · All rights reserved · ' + 'A'.repeat(470);
  embedWatermark(clone, msg);
  const result = extractWatermark(clone);
  assert(result.found, 'Watermark not found');
  assertEqual(result.message, msg);
});

test('LSB: Unicode payload (emoji) embeds & extracts', () => {
  const img = makeImageData(256, 256);
  const clone = cloneImageData(img);
  const msg = '🔒 Ghostmark™ · 版权所有 · δοκιμή';
  embedWatermark(clone, msg);
  const result = extractWatermark(clone);
  assert(result.found, 'Watermark not found');
  assertEqual(result.message, msg);
});

test('LSB: Returns not-found on clean image', () => {
  const img = makeImageData(256, 256);
  const result = extractWatermark(img);
  assert(!result.found, 'Should not find watermark in clean image');
});

test('LSB: Max pixel delta is ≤ 3 (imperceptible)', () => {
  const img = makeImageData(256, 256);
  const original = cloneImageData(img);
  embedWatermark(img, 'delta test');
  const delta = maxPixelDelta(original, img);
  assert(delta <= 3, `Max pixel delta was ${delta} — should be ≤ 3`);
});

test('LSB: Average pixel delta < 2 per channel', () => {
  const img = makeImageData(256, 256);
  const original = cloneImageData(img);
  embedWatermark(img, '© 2025 Acme Corp · All Rights Reserved');
  const avg = parseFloat(avgPixelDelta(original, img));
  assert(avg < 2.0, `Avg delta ${avg} too high`);
});

test('LSB: Confidence is 99.8 when found', () => {
  const img = makeImageData(256, 256);
  embedWatermark(img, 'test confidence');
  const result = extractWatermark(img);
  assert(result.found);
  assertEqual(result.confidence, 99.8);
});

// ─── DWT-DCT Tests ─────────────────────────────────────────────────
console.log('\n── DWT-DCT + Arnold Cat Map ──────────────────────────────\n');

test('DWT-DCT: Short payload embeds & extracts correctly', () => {
  const img = makeImageData(256, 256);
  const clone = cloneImageData(img);
  const msg = 'GHOSTMARK DWT';
  embedFrequency(clone, msg);
  const result = extractFrequency(clone);
  assert(result.found, `Watermark not found. algo=${result.algo}`);
  assertEqual(result.message, msg, `Got: "${result.message}"`);
});

test('DWT-DCT: Medium payload (100 chars) embeds & extracts', () => {
  const img = makeImageData(512, 512);
  const clone = cloneImageData(img);
  const msg = '© 2025 Acme Corp · Transformation Based Watermarking · DWT-DCT Mode';
  embedFrequency(clone, msg);
  const result = extractFrequency(clone);
  assert(result.found, 'Watermark not found');
  assertEqual(result.message, msg, `Got: "${result.message}"`);
});

test('DWT-DCT: Unicode payload embeds & extracts', () => {
  const img = makeImageData(256, 256);
  const clone = cloneImageData(img);
  const msg = '🛡️ Secure · 안전 · Sécurisé';
  embedFrequency(clone, msg);
  const result = extractFrequency(clone);
  assert(result.found, 'Watermark not found');
  assertEqual(result.message, msg, `Got: "${result.message}"`);
});

test('DWT-DCT: Returns not-found on clean image', () => {
  const img = makeImageData(256, 256);
  const result = extractFrequency(img);
  assert(!result.found, 'Should not find watermark in clean image');
});

test('DWT-DCT: frequencyCapacity returns positive value for 256×256', () => {
  const cap = frequencyCapacity(256, 256);
  assert(cap > 0, `Capacity should be > 0, got ${cap}`);
  console.log(`       Capacity 256×256: ${cap} bytes`);
});

test('DWT-DCT: frequencyCapacity scales with image size', () => {
  const cap256 = frequencyCapacity(256, 256);
  const cap512 = frequencyCapacity(512, 512);
  assert(cap512 > cap256 * 3, `512×512 should have >> capacity than 256×256 (got ${cap512} vs ${cap256})`);
});

test('DWT-DCT: algo field is "dwtdct" in result', () => {
  const img = makeImageData(256, 256);
  const clone = cloneImageData(img);
  embedFrequency(clone, 'test algo field');
  const result = extractFrequency(clone);
  assertEqual(result.algo, 'dwtdct');
});

test('DWT-DCT: Throws on image too small for payload', () => {
  const img = makeImageData(32, 32); // tiny image
  let threw = false;
  try {
    embedFrequency(img, 'A'.repeat(500)); // way too large
  } catch(e) {
    threw = true;
  }
  assert(threw, 'Should throw for oversized payload');
});

// ─── Cross-Algorithm Tests ──────────────────────────────────────────
console.log('\n── Cross-Algorithm Isolation ─────────────────────────────\n');

test('LSB watermark does NOT confuse DWT-DCT extractor', () => {
  const img = makeImageData(256, 256);
  embedWatermark(img, 'LSB only payload');
  const freqResult = extractFrequency(img);
  // It shouldn't find a FWMK header
  assert(!freqResult.found, 'DWT-DCT should not find LSB watermark');
});

test('DWT-DCT watermark does NOT confuse LSB extractor', () => {
  const img = makeImageData(256, 256);
  const clone = cloneImageData(img);
  embedFrequency(clone, 'DWT-DCT only payload');
  const lsbResult = extractWatermark(clone);
  // Should not find GHMK header
  assert(!lsbResult.found, 'LSB should not find DWT-DCT watermark');
});

test('Double watermark: LSB then DWT-DCT — LSB recovered correctly', () => {
  const img = makeImageData(512, 512);
  embedWatermark(img, 'LSB message');
  embedFrequency(img, 'DWT message');
  const lsbResult = extractWatermark(img);
  assert(lsbResult.found, 'LSB should still be recoverable after DWT-DCT embed');
  assertEqual(lsbResult.message, 'LSB message');
});

// ─── Summary ────────────────────────────────────────────────────────
console.log('\n╔══════════════════════════════════════════════════════╗');
const total = passed + failed;
if (failed === 0) {
  console.log(`║  🟢  ALL ${total} TESTS PASSED                           ║`);
} else {
  console.log(`║  🔴  ${failed} FAILED / ${passed} PASSED of ${total} total              ║`);
}
console.log('╚══════════════════════════════════════════════════════╝\n');

if (failed > 0) process.exit(1);
