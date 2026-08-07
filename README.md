<div align="center">

  <img src="public/logo.svg" alt="Ghostmark Logo" width="80" height="80" />

  # GHOSTMARK

  ### *Invisible Image Watermarking & Steganographic Verification*

  [![License: MIT](https://img.shields.io/badge/License-MIT-c8f000.svg?style=for-the-badge&logoColor=black)](LICENSE)
  [![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![JavaScript](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![LSB Engine](https://img.shields.io/badge/LSB-2--Bit_Engine-c8f000.svg?style=for-the-badge)](https://en.wikipedia.org/wiki/Steganography)
  [![DWT-DCT](https://img.shields.io/badge/DWT--DCT-Frequency_Domain-lime.svg?style=for-the-badge)](https://en.wikipedia.org/wiki/Discrete_cosine_transform)
  [![Mobile Ready](https://img.shields.io/badge/Mobile-Optimized-00e5ff.svg?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries)

  <p align="center">
    <b>Hide unidentifiable watermarks directly inside pixel channel data — two algorithms, zero perceptual loss.</b>
    <br />
    <i>Imperceptible to human eyes. Fully recoverable. 100% Client-Side. Mobile-Ready.</i>
  </p>

  <br />

  🌐 **[Live Demo → ghostmark.vercel.app](https://ghostmark.vercel.app)**

  <br />

</div>

---

## 📖 About The Project

**Ghostmark** is a privacy-first web application for **invisible image watermarking and authorship protection**. Unlike traditional visible stamps or overlays that degrade image aesthetics, Ghostmark hides digital signatures, copyright metadata, or secret keys directly inside raw pixel or frequency data — completely invisible to the human eye.

Ghostmark offers **two independent watermarking engines**, each suited for different use-cases: a fast spatial-domain LSB engine for lossless environments, and a robust frequency-domain DWT-DCT engine that survives JPEG compression.

---

## 🔬 Watermarking Algorithms

### Mode 01 — LSB Steganography

The fastest and most imperceptible mode. Every pixel contains 8-bit color values (0–255) for Red, Green, and Blue channels. Ghostmark embeds binary payloads into the **lowest 2 bits** of each channel:

- **Imperceptible Variance**: Shifts color values by at most $\pm 3$ out of 255 — invisible to the human visual cortex.
- **GHMK Magic Header**: A 4-byte `GHMK` magic header + binary length metadata ensures deterministic extraction and zero false positives.
- **Best for**: Lossless workflows, PNG images, archival use.

```
[ Image ] + [ Payload ] ──( LSB Encoder )──▶ [ Watermarked PNG ]
                                                     │
                                               ( Validator )
                                                     │
                                             ▼ [ Decoded Payload ]
```

### Mode 02 — DWT-DCT + Arnold Cat Map Scrambling

A research-grade frequency-domain watermarking engine inspired by *"Transformation Based Watermarking for Image Authentication"*. This mode survives JPEG compression, mild resizing, and color space conversion.

**Pipeline:**

```
Embed:
  1. Arnold-keyed Fisher-Yates scramble on payload bytes (key = ARNOLD_ITERS)
  2. Build bitstream: [FWMK header, plain 8 bytes] + [scrambled payload bits]
  3. Per 8×8 image block (green channel):
       a. 2D DCT-II (row-column separable, pre-computed cosine table)
       b. Quantize 16 mid-frequency zigzag positions via parity
          (even multiple of α=32 → bit 0, odd multiple → bit 1)
       c. 2D IDCT → write back pixels
  4. Each logical bit is written 3× (majority-vote redundancy for zero BER)

Extract:
  1. Per block: 2D DCT → parity of 16 mid-frequency coefficients
  2. Majority vote across 3 raw slots → logical bits
  3. Read FWMK header (plain) → detect magic + read payload length
  4. Arnold-keyed descramble → UTF-8 decode
```

| Property | LSB | DWT-DCT |
|---|---|---|
| JPEG survival | ❌ | ✅ (> 75% quality) |
| Capacity (256×256) | ~49,000 bytes | ~674 bytes |
| Max pixel shift | ±3 | ~±8 green ch. |
| Speed | Instant | ~100ms |
| Compression resilience | None | High |
| Best for | PNG, lossless | JPEG, social media |

---

## ✨ Key Features

- **👁️ Dual Algorithm Selector** — Choose between LSB (Mode 01) and DWT-DCT (Mode 02) with a single click in the encoder.
- **🔍 Auto-Detection on Validation** — The validator automatically tries LSB first, then DWT-DCT frequency extraction. Displays an algorithm badge in the result.
- **🛡️ Tamper Detection & Bit Heatmap Inspector** — Pixel-level 32×32 block bitplane analysis highlights intact watermark regions (green) vs. edited/compressed areas (red).
- **📱 Mobile-First Responsive Design** — Full hamburger navigation, responsive grids, and touch-friendly layout down to 375px.
- **🔒 Privacy First** — All operations run entirely in your browser. No server. No uploads. Your images never leave your device.
- **⚡ Lossless PNG Export** — Always outputs lossless PNG to preserve embedded bit structures.
- **🕳️ Session Vault** — Local session history of all encode/decode events with payload preview.

---

## 🎨 UI & Design

Ghostmark is built with a premium, Vercel-inspired **dark minimal aesthetic**:

- **Cinematic Animated Landing Page** — Interactive 3D intro with a mysterious hooded figure, dynamic canvas typography, smooth character motion, and custom spotlight lighting.
- **Ambient Cursor Spotlight** — Mouse movements dynamically illuminate the dark matrix background.
- **Sentry Session Dashboard** — Live overview tracking encoding metrics, scanned images, visual delta stats, and real-time event logs.
- **Algorithm Selector Cards** — Two premium card components with animated active states, mode badges, and capability tags.
- **Hamburger Mobile Nav** — Smooth fullscreen overlay navigation on all pages below 640px.

---

## 🛠️ Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/ANKARAHAMSA/ghostmark.git

# 2. Navigate into the project directory
cd ghostmark

# 3. Install dependencies
npm install

# 4. Start the local development server
npm run dev
```

Open your browser at `http://localhost:5173` to explore Ghostmark locally.

### Run Tests

```bash
node --experimental-vm-modules test.mjs
```

All 18 tests should pass:
- LSB: 7 tests (short/long/unicode payloads, clean image, pixel delta, confidence)
- DWT-DCT: 8 tests (short/medium/unicode payloads, clean image, capacity, algo field, overflow)
- Cross-algo isolation: 3 tests (no cross-detection, double-watermark survival)

---

## 📂 Project Architecture

```
ghostmark/
├── index.html              # Cinematic animated landing page
├── sentry.html             # Sentry session dashboard & live metrics
├── encoder.html            # Image encoder (LSB + DWT-DCT mode selector)
├── validator.html          # Payload validator & extractor (auto-detects algo)
├── vault.html              # Local session storage & event vault
│
├── watermark.js            # LSB steganography engine (encode/decode + integrity)
├── frequency_watermark.js  # DWT-DCT + Fisher-Yates scramble engine
├── encoder.js              # Encoder UI logic & algorithm switching
├── validator.js            # Validator UI logic & dual-algo auto-detection
├── sentry.js               # Session metrics & activity logger
├── vault.js                # Vault storage & export controller
├── cursor.js               # Ambient cursor spotlight effect
│
├── shared.css              # Dark minimal design system, CSS variables,
│                           # mobile responsive breakpoints & hamburger nav
├── test.mjs                # End-to-end test suite (18 tests, Node.js)
├── vite.config.js          # Vite multi-page application (MPA) config
└── public/
    ├── logo.svg            # Ghostmark emblem brand logo
    ├── favicon.svg         # Brand favicon
    └── bg-texture.jpg      # Dark cyber background texture
```

---

## 🔐 Security Architecture

```
DWT-DCT Scramble Key:
  seed = ARNOLD_ITERS × 0xA3C5 + 0x1F4B
  → Deterministic Fisher-Yates shuffle on payload bytes

LSB Header:     GHMK (4 bytes) + length (4 bytes LE) + payload
DWT-DCT Header: FWMK (4 bytes, plain) + length (4 bytes LE) + scrambled payload

Both engines:
  ✓ No server contact
  ✓ No external fonts (Google Fonts loaded client-side only)
  ✓ No tracking, analytics, or cookies
  ✓ No eval() or dynamic code execution
```

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

  Made with ❤️ by [ANKARAHAMSA](https://github.com/ANKARAHAMSA)

  *Ghostmark — leave no trace, prove everything.*

</div>
