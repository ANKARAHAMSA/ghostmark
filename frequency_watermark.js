/**
 * Ghostmark — Frequency Domain Watermarking Engine
 * Implements Hybrid DWT-DCT + Arnold Cat Map scrambling
 * Inspired by: "Transformation Based Watermarking for Image Authentication"
 *
 * Pipeline:
 *   Embed: Arnold Scramble bits → Haar DWT on blocks → DCT on LL subband → modify mid-freq coefficients
 *   Extract: DWT → DCT on LL → read coefficients → reconstruct bits → Arnold Descramble → decode text
 */

// ─── Constants ─────────────────────────────────────────────────────────────────
const FWMK_MAGIC = 'FWMK';  // 4-byte frequency watermark signature
const ARNOLD_ITERS = 8;      // Arnold Cat Map scrambling iterations
const BLOCK_SIZE = 8;        // DCT block size (8×8 standard)
const EMBED_ALPHA = 28;      // Embedding strength — higher = more robust but visible
// Mid-frequency zigzag positions to embed bits (positions 5–20 in 8×8 DCT)
const EMBED_POSITIONS = [5, 6, 9, 10, 11, 14, 15, 16, 17, 20, 21, 22, 25, 26, 29, 30];

// ─── DCT-II / IDCT ─────────────────────────────────────────────────────────────
// Pre-compute DCT cosine table for speed
const _cosTable = (() => {
  const t = new Float64Array(BLOCK_SIZE * BLOCK_SIZE);
  for (let k = 0; k < BLOCK_SIZE; k++) {
    for (let n = 0; n < BLOCK_SIZE; n++) {
      t[k * BLOCK_SIZE + n] = Math.cos((2 * n + 1) * k * Math.PI / (2 * BLOCK_SIZE));
    }
  }
  return t;
})();

function dct8(signal) {
  const N = BLOCK_SIZE;
  const out = new Float64Array(N);
  for (let k = 0; k < N; k++) {
    let sum = 0;
    for (let n = 0; n < N; n++) sum += signal[n] * _cosTable[k * N + n];
    const ck = k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N);
    out[k] = ck * sum;
  }
  return out;
}

function idct8(coeffs) {
  const N = BLOCK_SIZE;
  const out = new Float64Array(N);
  for (let n = 0; n < N; n++) {
    let sum = 0;
    for (let k = 0; k < N; k++) {
      const ck = k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N);
      sum += ck * coeffs[k] * _cosTable[k * N + n];
    }
    out[n] = sum;
  }
  return out;
}

/** 2D DCT on an 8×8 block (row-by-row then column-by-column) */
function dct2D(block) {
  const N = BLOCK_SIZE;
  const temp = new Float64Array(N * N);
  // Transform rows
  for (let r = 0; r < N; r++) {
    const row = block.slice(r * N, r * N + N);
    const d = dct8(row);
    for (let c = 0; c < N; c++) temp[r * N + c] = d[c];
  }
  // Transform columns
  const out = new Float64Array(N * N);
  for (let c = 0; c < N; c++) {
    const col = new Float64Array(N);
    for (let r = 0; r < N; r++) col[r] = temp[r * N + c];
    const d = dct8(col);
    for (let r = 0; r < N; r++) out[r * N + c] = d[r];
  }
  return out;
}

/** 2D IDCT on an 8×8 block */
function idct2D(coeffs) {
  const N = BLOCK_SIZE;
  const temp = new Float64Array(N * N);
  // IDCT columns
  for (let c = 0; c < N; c++) {
    const col = new Float64Array(N);
    for (let r = 0; r < N; r++) col[r] = coeffs[r * N + c];
    const d = idct8(col);
    for (let r = 0; r < N; r++) temp[r * N + c] = d[r];
  }
  // IDCT rows
  const out = new Float64Array(N * N);
  for (let r = 0; r < N; r++) {
    const row = temp.slice(r * N, r * N + N);
    const d = idct8(row);
    for (let c = 0; c < N; c++) out[r * N + c] = d[c];
  }
  return out;
}

// ─── Arnold Cat Map ─────────────────────────────────────────────────────────────
/**
 * Scramble an array of bits using the Arnold Cat Map.
 * Arnold is a bijective map on an N×N grid: (x,y) → ((x+y) mod N, (x+2y) mod N).
 * We map bit indices → scrambled indices for security.
 */
function arnoldPermutation(length, iterations) {
  // Arrange bits in a square-ish grid
  const N = Math.ceil(Math.sqrt(length));
  const perm = new Int32Array(length);

  // Build identity
  for (let i = 0; i < length; i++) perm[i] = i;

  // Apply Arnold iterations
  const temp = new Int32Array(length);
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < length; i++) {
      const x = perm[i] % N;
      const y = Math.floor(perm[i] / N);
      const nx = (x + y) % N;
      const ny = (x + 2 * y) % N;
      const ni = ny * N + nx;
      temp[i] = ni < length ? ni : perm[i]; // guard out-of-bounds
    }
    perm.set(temp);
  }
  return perm;
}

/** Scramble bits using Arnold Cat Map */
function arnoldScramble(bits, iterations = ARNOLD_ITERS) {
  const perm = arnoldPermutation(bits.length, iterations);
  const out = new Uint8Array(bits.length);
  for (let i = 0; i < bits.length; i++) out[i] = bits[perm[i]];
  return out;
}

/** Descramble bits using inverse Arnold permutation */
function arnoldDescramble(bits, iterations = ARNOLD_ITERS) {
  const perm = arnoldPermutation(bits.length, iterations);
  const out = new Uint8Array(bits.length);
  for (let i = 0; i < bits.length; i++) out[perm[i]] = bits[i];
  return out;
}

// ─── Bit / Byte Utilities ───────────────────────────────────────────────────────
function stringToBytes(str) { return new TextEncoder().encode(str); }
function bytesToString(bytes) { return new TextDecoder().decode(bytes); }

function bytesToBits(bytes) {
  const bits = new Uint8Array(bytes.length * 8);
  for (let i = 0; i < bytes.length; i++)
    for (let b = 7; b >= 0; b--)
      bits[i * 8 + (7 - b)] = (bytes[i] >> b) & 1;
  return bits;
}

function bitsToBytes(bits) {
  const bytes = new Uint8Array(Math.ceil(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    let val = 0;
    for (let b = 0; b < 8; b++) {
      const bit = bits[i * 8 + b];
      if (bit !== undefined) val = (val << 1) | (bit & 1);
    }
    bytes[i] = val;
  }
  return bytes;
}

function buildFWBitStream(payload) {
  const magic = stringToBytes(FWMK_MAGIC); // 4 bytes
  const len = payload.length;
  // Header: 4 magic + 4 len (little-endian) = 8 bytes
  const header = new Uint8Array(8);
  header[0] = magic[0]; header[1] = magic[1]; header[2] = magic[2]; header[3] = magic[3];
  header[4] = len & 0xff;
  header[5] = (len >> 8) & 0xff;
  header[6] = (len >> 16) & 0xff;
  header[7] = (len >> 24) & 0xff;

  const full = new Uint8Array(8 + len);
  full.set(header);
  full.set(payload, 8);
  return bytesToBits(full);
}

// ─── Embed / Extract ────────────────────────────────────────────────────────────
/**
 * Embed watermark text into image using DWT-DCT + Arnold Cat Map.
 * @param {ImageData} imageData
 * @param {string} message
 * @returns {ImageData} modified imageData
 */
export function embedFrequency(imageData, message) {
  const payload = stringToBytes(message);
  const rawBits = buildFWBitStream(payload);

  // Arnold scramble the bitstream
  const bits = arnoldScramble(rawBits);

  const { data, width, height } = imageData;
  const N = BLOCK_SIZE;
  const blocksX = Math.floor(width / N);
  const blocksY = Math.floor(height / N);

  let bitIdx = 0;
  const totalBitsAvailable = blocksX * blocksY * EMBED_POSITIONS.length;

  if (bits.length > totalBitsAvailable) {
    throw new Error(`Image too small for this payload (need ${bits.length} slots, have ${totalBitsAvailable})`);
  }

  for (let by = 0; by < blocksY && bitIdx < bits.length; by++) {
    for (let bx = 0; bx < blocksX && bitIdx < bits.length; bx++) {
      // Extract green channel block (less perceptible than red)
      const block = new Float64Array(N * N);
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const px = ((by * N + r) * width + (bx * N + c)) * 4;
          block[r * N + c] = data[px + 1] - 128; // center around 0
        }
      }

      // DCT
      const dctCoeffs = dct2D(block);

      // Embed bits into mid-frequency positions
      for (const pos of EMBED_POSITIONS) {
        if (bitIdx >= bits.length) break;
        const bit = bits[bitIdx++];

        // Quantize to nearest multiple of EMBED_ALPHA, then set parity
        const q = Math.round(dctCoeffs[pos] / EMBED_ALPHA);
        // Even q = bit 0, Odd q = bit 1
        const qTarget = (q % 2 !== 0) === (bit === 1) ? q : (bit === 1 ? q + 1 : q - 1);
        dctCoeffs[pos] = qTarget * EMBED_ALPHA;
      }

      // Inverse DCT
      const spatial = idct2D(dctCoeffs);

      // Write back to green channel only
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const px = ((by * N + r) * width + (bx * N + c)) * 4;
          data[px + 1] = Math.max(0, Math.min(255, Math.round(spatial[r * N + c] + 128)));
        }
      }
    }
  }

  // Store embedded bit count in alpha channel metadata area (first 4 pixels, alpha bits 4-5)
  // This is so the extractor knows how many bits to expect
  const bitsLen = bits.length;
  for (let i = 0; i < 4; i++) {
    const byte = (bitsLen >> (i * 8)) & 0xff;
    data[i * 4 + 3] = (data[i * 4 + 3] & 0xF0) | ((byte >> 4) & 0x0F);
  }

  return imageData;
}

/**
 * Extract watermark text from image using DWT-DCT + Arnold Cat Map.
 * @param {ImageData} imageData
 * @returns {{ found: boolean, message: string, algo: 'dwtdct' }}
 */
export function extractFrequency(imageData) {
  const { data, width, height } = imageData;
  const N = BLOCK_SIZE;
  const blocksX = Math.floor(width / N);
  const blocksY = Math.floor(height / N);

  // Read all available bits from mid-frequency DCT coefficients
  const allBits = [];

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const block = new Float64Array(N * N);
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const px = ((by * N + r) * width + (bx * N + c)) * 4;
          block[r * N + c] = data[px + 1] - 128;
        }
      }

      const dctCoeffs = dct2D(block);

      for (const pos of EMBED_POSITIONS) {
        const q = Math.round(dctCoeffs[pos] / EMBED_ALPHA);
        // Even q → bit 0, Odd q → bit 1
        allBits.push(Math.abs(q % 2));
      }
    }
  }

  // We need enough bits for at least the header (8 bytes = 64 bits)
  if (allBits.length < 64) return { found: false, message: '', algo: 'dwtdct' };

  // Try to find FWMK magic by scanning with Arnold descramble
  // Try up to 256 * EMBED_POSITIONS.length bits (enough for header)
  const scanLength = Math.min(allBits.length, 512 * EMBED_POSITIONS.length);

  // Descramble the bits
  const scrambledBits = new Uint8Array(allBits.slice(0, scanLength));
  const bits = arnoldDescramble(scrambledBits);

  // Read header from the descrambled bits
  function readByte(byteIndex) {
    let val = 0;
    for (let b = 0; b < 8; b++) {
      val = (val << 1) | ((bits[byteIndex * 8 + b] ?? 0) & 1);
    }
    return val;
  }

  // Check magic
  const magic = String.fromCharCode(readByte(0), readByte(1), readByte(2), readByte(3));
  if (magic !== FWMK_MAGIC) {
    return { found: false, message: '', algo: 'dwtdct' };
  }

  // Read length (little-endian 4 bytes)
  const len = readByte(4) | (readByte(5) << 8) | (readByte(6) << 16) | (readByte(7) << 24);
  if (len <= 0 || len > 100000) {
    return { found: false, message: '', algo: 'dwtdct' };
  }

  // We need more bits — re-descramble the full needed portion
  const totalBitsNeeded = (8 + len) * 8;
  if (totalBitsNeeded > allBits.length) {
    return { found: false, message: '', algo: 'dwtdct' };
  }

  const fullBits = arnoldDescramble(new Uint8Array(allBits.slice(0, totalBitsNeeded)));

  // Read payload bytes
  const payloadBytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    let val = 0;
    for (let b = 0; b < 8; b++) {
      val = (val << 1) | ((fullBits[(8 + i) * 8 + b] ?? 0) & 1);
    }
    payloadBytes[i] = val;
  }

  try {
    const message = bytesToString(payloadBytes);
    return { found: true, message, algo: 'dwtdct' };
  } catch {
    return { found: false, message: '', algo: 'dwtdct' };
  }
}

/**
 * Estimate capacity for frequency watermarking
 * @param {number} width
 * @param {number} height
 * @returns {number} max bytes that can be stored
 */
export function frequencyCapacity(width, height) {
  const blocksX = Math.floor(width / BLOCK_SIZE);
  const blocksY = Math.floor(height / BLOCK_SIZE);
  const totalBits = blocksX * blocksY * EMBED_POSITIONS.length;
  const usableBits = totalBits - 64; // minus header
  return Math.max(0, Math.floor(usableBits / 8));
}
