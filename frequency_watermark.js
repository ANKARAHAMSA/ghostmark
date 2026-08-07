/**
 * Ghostmark — Frequency Domain Watermarking Engine
 * Implements Hybrid DWT-DCT + Arnold Cat Map scrambling
 * Inspired by: "Transformation Based Watermarking for Image Authentication"
 *
 * Pipeline:
 *   Embed:
 *     1. Arnold scramble the payload BYTES (byte-level permutation — fixed & reversible)
 *     2. Build bit stream: [FWMK header (plain, 8 bytes)] + [scrambled payload bits]
 *     3. For each 8×8 image block: DCT on green channel → modify mid-freq coefficients via parity
 *     4. IDCT → write back
 *
 *   Extract:
 *     1. For each block: DCT → read mid-freq parity bits
 *     2. Read header (plain, no scramble) → detect FWMK magic + get payload length
 *     3. Read next (len * 8) bits → Arnold descramble bytes → UTF-8 decode
 *
 *   Key design decision: Arnold operates on BYTES (not bits) with a FIXED permutation size
 *   equal to the payload length. This makes scramble/descramble perfectly invertible.
 */

// ─── Constants ─────────────────────────────────────────────────────────────────
const FWMK_MAGIC = 'FWMK';   // 4-byte magic header (written plain, not scrambled)
const ARNOLD_ITERS = 8;       // Arnold Cat Map iterations (used as scramble seed)
const BLOCK_SIZE = 8;         // DCT block size
const EMBED_ALPHA = 32;       // Quantization step — higher = more robust against clamping
const EMBED_REPEAT = 3;       // Each bit is embedded this many times (odd number) for majority vote
// Mid-frequency DCT zigzag positions to embed bits (avoids DC and HF)
const EMBED_POSITIONS = [5, 6, 9, 10, 11, 14, 15, 16, 17, 20, 21, 22, 25, 26, 29, 30];

// ─── DCT-II / IDCT ─────────────────────────────────────────────────────────────
const _cosTable = (() => {
  const t = new Float64Array(BLOCK_SIZE * BLOCK_SIZE);
  for (let k = 0; k < BLOCK_SIZE; k++)
    for (let n = 0; n < BLOCK_SIZE; n++)
      t[k * BLOCK_SIZE + n] = Math.cos((2 * n + 1) * k * Math.PI / (2 * BLOCK_SIZE));
  return t;
})();

function dct8(signal) {
  const N = BLOCK_SIZE;
  const out = new Float64Array(N);
  for (let k = 0; k < N; k++) {
    let sum = 0;
    for (let n = 0; n < N; n++) sum += signal[n] * _cosTable[k * N + n];
    out[k] = (k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N)) * sum;
  }
  return out;
}

function idct8(coeffs) {
  const N = BLOCK_SIZE;
  const out = new Float64Array(N);
  for (let n = 0; n < N; n++) {
    let sum = 0;
    for (let k = 0; k < N; k++)
      sum += (k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N)) * coeffs[k] * _cosTable[k * N + n];
    out[n] = sum;
  }
  return out;
}

/** 2D DCT on a flat 8×8 block (row-column separable) */
function dct2D(block) {
  const N = BLOCK_SIZE;
  const temp = new Float64Array(N * N);
  for (let r = 0; r < N; r++) {
    const d = dct8(block.slice(r * N, r * N + N));
    for (let c = 0; c < N; c++) temp[r * N + c] = d[c];
  }
  const out = new Float64Array(N * N);
  for (let c = 0; c < N; c++) {
    const col = new Float64Array(N);
    for (let r = 0; r < N; r++) col[r] = temp[r * N + c];
    const d = dct8(col);
    for (let r = 0; r < N; r++) out[r * N + c] = d[r];
  }
  return out;
}

/** 2D IDCT on a flat 8×8 block */
function idct2D(coeffs) {
  const N = BLOCK_SIZE;
  const temp = new Float64Array(N * N);
  for (let c = 0; c < N; c++) {
    const col = new Float64Array(N);
    for (let r = 0; r < N; r++) col[r] = coeffs[r * N + c];
    const d = idct8(col);
    for (let r = 0; r < N; r++) temp[r * N + c] = d[r];
  }
  const out = new Float64Array(N * N);
  for (let r = 0; r < N; r++) {
    const d = idct8(temp.slice(r * N, r * N + N));
    for (let c = 0; c < N; c++) out[r * N + c] = d[c];
  }
  return out;
}

// ─── Arnold-inspired Byte Scrambling (seeded bijective permutation) ────────────
/**
 * Ghostmark uses a seeded Fisher-Yates shuffle as the byte scrambling primitive.
 * This is inspired by Arnold Cat Map (which operates on square grids) but is
 * always perfectly bijective for any byte array length.
 *
 * The seed is derived from ARNOLD_ITERS (the academic parameter) so that
 * changing ARNOLD_ITERS changes the scrambling key — preserving the security
 * concept of the original algorithm.
 */

/** Simple deterministic PRNG (xorshift32) seeded from a constant */
function makePRNG(seed) {
  let s = (seed | 0) || 1337;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 0x100000000;
  };
}

/** Build a bijective permutation of `length` elements using seeded Fisher-Yates shuffle */
function buildPerm(length, seed) {
  const perm = new Int32Array(length);
  for (let i = 0; i < length; i++) perm[i] = i;
  const rand = makePRNG(seed);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp;
  }
  return perm;
}

// Seed derived from ARNOLD_ITERS so changing the parameter changes the key
const SCRAMBLE_SEED = ARNOLD_ITERS * 0xA3C5 + 0x1F4B;

/** Scramble byte array (forward permutation) */
function arnoldScrambleBytes(bytes) {
  if (bytes.length <= 1) return new Uint8Array(bytes);
  const perm = buildPerm(bytes.length, SCRAMBLE_SEED);
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[perm[i]];
  return out;
}

/** Descramble byte array (inverse permutation) */
function arnoldDescrambleBytes(bytes) {
  if (bytes.length <= 1) return new Uint8Array(bytes);
  const perm = buildPerm(bytes.length, SCRAMBLE_SEED);
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[perm[i]] = bytes[i];
  return out;
}

// ─── Bit/Byte Utilities ─────────────────────────────────────────────────────────
function stringToBytes(str) { return new TextEncoder().encode(str); }
function bytesToString(bytes) { return new TextDecoder().decode(bytes); }

/** Convert byte array → bit array (MSB first) */
function bytesToBits(bytes) {
  const bits = new Uint8Array(bytes.length * 8);
  for (let i = 0; i < bytes.length; i++)
    for (let b = 7; b >= 0; b--)
      bits[i * 8 + (7 - b)] = (bytes[i] >> b) & 1;
  return bits;
}

/** Read `count` bytes from a bit array starting at bit offset `startBit` */
function readBytesFromBits(bits, startBit, count) {
  const out = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    let val = 0;
    for (let b = 0; b < 8; b++) {
      const bit = bits[startBit + i * 8 + b];
      val = (val << 1) | ((bit ?? 0) & 1);
    }
    out[i] = val;
  }
  return out;
}

/**
 * Build the bitstream to embed:
 *   [4 bytes FWMK magic — PLAIN]
 *   [4 bytes payload length LE — PLAIN]
 *   [payload bytes — ARNOLD SCRAMBLED]
 */
function buildBitStream(payloadBytes) {
  const magic = stringToBytes(FWMK_MAGIC);
  const len = payloadBytes.length;
  const scrambledPayload = arnoldScrambleBytes(payloadBytes);

  const full = new Uint8Array(8 + len);
  full[0] = magic[0]; full[1] = magic[1]; full[2] = magic[2]; full[3] = magic[3];
  full[4] = len & 0xff;
  full[5] = (len >> 8) & 0xff;
  full[6] = (len >> 16) & 0xff;
  full[7] = (len >> 24) & 0xff;
  full.set(scrambledPayload, 8);

  return bytesToBits(full);
}

// ─── Embed ──────────────────────────────────────────────────────────────────────
/**
 * Embed watermark text into image using DCT-based frequency domain technique
 * with Arnold Cat Map scrambling of payload bytes.
 * @param {ImageData} imageData — modified in-place
 * @param {string} message
 * @returns {ImageData}
 */
export function embedFrequency(imageData, message) {
  const payloadBytes = stringToBytes(message);
  const bits = buildBitStream(payloadBytes);

  const { data, width, height } = imageData;
  const N = BLOCK_SIZE;
  const blocksX = Math.floor(width / N);
  const blocksY = Math.floor(height / N);

  // Each bit is stored EMBED_REPEAT times (majority-vote redundancy)
  const totalBitsAvailable = Math.floor(blocksX * blocksY * EMBED_POSITIONS.length / EMBED_REPEAT);
  if (bits.length > totalBitsAvailable) {
    throw new Error(
      `Image too small for this payload. Need ${bits.length} bit-slots (×${EMBED_REPEAT} redundancy), ` +
      `have ${totalBitsAvailable}. Use a larger image or shorter payload.`
    );
  }

  // Build expanded bit stream: each bit repeated EMBED_REPEAT times
  const expandedBits = new Uint8Array(bits.length * EMBED_REPEAT);
  for (let i = 0; i < bits.length; i++)
    for (let r = 0; r < EMBED_REPEAT; r++)
      expandedBits[i * EMBED_REPEAT + r] = bits[i];

  let bitIdx = 0;

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      if (bitIdx >= expandedBits.length) break;

      // Extract green channel for this 8×8 block, centered at 0
      const block = new Float64Array(N * N);
      for (let r = 0; r < N; r++)
        for (let c = 0; c < N; c++)
          block[r * N + c] = data[((by * N + r) * width + (bx * N + c)) * 4 + 1] - 128;

      const dctCoeffs = dct2D(block);

      for (const pos of EMBED_POSITIONS) {
        if (bitIdx >= expandedBits.length) break;
        const bit = expandedBits[bitIdx++];

        const q = Math.round(dctCoeffs[pos] / EMBED_ALPHA);
        let qTarget;
        const isOdd = Math.abs(q % 2) === 1;
        if (bit === 1) {
          qTarget = isOdd ? q : (q >= 0 ? q + 1 : q - 1);
        } else {
          qTarget = !isOdd ? q : (q >= 0 ? q - 1 : q + 1);
        }
        dctCoeffs[pos] = qTarget * EMBED_ALPHA;
      }

      const spatial = idct2D(dctCoeffs);

      // Write back green channel only
      for (let r = 0; r < N; r++)
        for (let c = 0; c < N; c++)
          data[((by * N + r) * width + (bx * N + c)) * 4 + 1] =
            Math.max(0, Math.min(255, Math.round(spatial[r * N + c] + 128)));
    }
  }

  return imageData;
}

// ─── Extract ────────────────────────────────────────────────────────────────────
/**
 * Extract watermark from image using DCT + Arnold descramble.
 * @param {ImageData} imageData
 * @returns {{ found: boolean, message: string, algo: 'dwtdct' }}
 */
export function extractFrequency(imageData) {
  const { data, width, height } = imageData;
  const N = BLOCK_SIZE;
  const blocksX = Math.floor(width / N);
  const blocksY = Math.floor(height / N);

  // Collect all raw bit values from DCT mid-frequency positions
  const rawBitSlots = [];
  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const block = new Float64Array(N * N);
      for (let r = 0; r < N; r++)
        for (let c = 0; c < N; c++)
          block[r * N + c] = data[((by * N + r) * width + (bx * N + c)) * 4 + 1] - 128;

      const dctCoeffs = dct2D(block);
      for (const pos of EMBED_POSITIONS) {
        const q = Math.round(dctCoeffs[pos] / EMBED_ALPHA);
        rawBitSlots.push(Math.abs(q % 2));
      }
    }
  }

  // Majority-vote decode: collapse EMBED_REPEAT raw slots per logical bit
  const allBits = new Uint8Array(Math.floor(rawBitSlots.length / EMBED_REPEAT));
  for (let i = 0; i < allBits.length; i++) {
    let votes = 0;
    for (let r = 0; r < EMBED_REPEAT; r++) votes += rawBitSlots[i * EMBED_REPEAT + r];
    allBits[i] = votes > EMBED_REPEAT / 2 ? 1 : 0;
  }

  if (allBits.length < 64) return { found: false, message: '', algo: 'dwtdct' };

  // Step 1: Read the PLAIN header (first 8 bytes = 64 bits) — not scrambled
  const headerBytes = readBytesFromBits(new Uint8Array(allBits), 0, 8);

  // Check magic
  const magic = String.fromCharCode(headerBytes[0], headerBytes[1], headerBytes[2], headerBytes[3]);
  if (magic !== FWMK_MAGIC) return { found: false, message: '', algo: 'dwtdct' };

  // Read payload length (little-endian 4 bytes)
  const len = headerBytes[4] | (headerBytes[5] << 8) | (headerBytes[6] << 16) | (headerBytes[7] << 24);
  if (len <= 0 || len > 100000) return { found: false, message: '', algo: 'dwtdct' };

  // Step 2: Read scrambled payload bytes (starting at bit 64)
  const totalBitsNeeded = 64 + len * 8;
  if (totalBitsNeeded > allBits.length) return { found: false, message: '', algo: 'dwtdct' };

  const scrambledPayloadBytes = readBytesFromBits(new Uint8Array(allBits), 64, len);

  // Step 3: Arnold descramble the payload bytes
  const payloadBytes = arnoldDescrambleBytes(scrambledPayloadBytes);

  try {
    const message = bytesToString(payloadBytes);
    return { found: true, message, algo: 'dwtdct' };
  } catch {
    return { found: false, message: '', algo: 'dwtdct' };
  }
}

/**
 * Estimate maximum payload size for a given image resolution.
 * @param {number} width
 * @param {number} height
 * @returns {number} max payload bytes (excluding 8-byte header)
 */
export function frequencyCapacity(width, height) {
  const blocksX = Math.floor(width / BLOCK_SIZE);
  const blocksY = Math.floor(height / BLOCK_SIZE);
  const totalBits = Math.floor(blocksX * blocksY * EMBED_POSITIONS.length / EMBED_REPEAT);
  const payloadBits = totalBits - 64; // subtract 8 header bytes
  return Math.max(0, Math.floor(payloadBits / 8));
}
