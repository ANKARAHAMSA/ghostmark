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

Ghostmark features **two core engines**:
1. **LSB Steganography** — High-capacity spatial domain embedding (lossless, instant).
2. **DWT-DCT Frequency Engine** — Robust frequency domain embedding (JPEG compression resilient).

---

## 🔬 How It Works

### Mode 01 — LSB Steganography (Spatial Domain)

Embeds watermark bits into the 2 least significant bits of RGB pixel channels.

- **Pixel Shift**: `p' = (p & 0xFC) | w` — maximum shift of ±3 per channel (out of 255).
- **Visual Quality**: PSNR ≥ 51 dB (imperceptible change to human eye).
- **Header**: Includes `GHMK` magic header for deterministic payload extraction.

```
[ Image ] + [ Payload ] ──( LSB Encoder )──▶ [ Watermarked PNG ]
                                                     │
                                               ( Validator )
                                                     │
                                             ▼ [ Decoded Payload ]
```

---

### Mode 02 — DWT-DCT + Arnold Scrambling (Frequency Domain)

Inspired by *"Transformation Based Watermarking for Image Authentication"*, this mode converts 8×8 pixel blocks into frequency space using the 2D Discrete Cosine Transform (DCT-II).

- **Payload Security**: Scrambles byte positions using a deterministic Fisher-Yates permutation key derived from `ARNOLD_ITERS`.
- **Frequency Embedding**: Modifies 16 mid-frequency coefficients per block using Quantization Index Modulation (alpha = 32).
- **Robustness**: Uses 3× redundancy with majority-vote decoding to achieve zero Bit Error Rate (BER) even under JPEG compression (> 75% quality).

---

## ⚖️ Algorithm Comparison

| Feature | LSB Steganography | DWT-DCT Frequency |
|---|---|---|
| **Domain** | Spatial (Pixel LSB) | Frequency (DCT Mid-Band) |
| **JPEG Survival** | ❌ No | ✅ Yes (> 75% quality) |
| **Visual Quality (PSNR)** | ≥ 51 dB | ≥ 40 dB |
| **Max Capacity (512×512)** | ~196 KB | ~2.7 KB |
| **Scrambling** | None | Keyed Permutation |
| **Best For** | High-res PNGs, lossless archives | JPEG sharing, social media |

---

## ✨ Key Features

- **👁️ Dual Algorithm Selector** — Choose between LSB (Mode 01) and DWT-DCT (Mode 02) with a single click.
- **🔍 Auto-Detection Validator** — Automatically identifies algorithm headers (`GHMK` or `FWMK`) and recovers payload.
- **🛡️ Tamper Heatmap Inspector** — 32×32 grid bitplane analysis highlighting intact vs altered image regions.
- **📱 Mobile-First Responsive Design** — Full hamburger navigation and responsive UI tested down to 375px.
- **🔒 100% Client-Side Privacy** — Operations execute locally in-browser. No server uploads.
- **🕳️ Session Vault** — Local history tracking encode and decode events.

---

## 🛠️ Installation & Setup

```bash
# Clone repository
git clone https://github.com/ANKARAHAMSA/ghostmark.git
cd ghostmark

# Install dependencies
npm install

# Start development server
npm run dev
```

### Run Test Suite

```bash
node --experimental-vm-modules test.mjs
```

Runs **18 automated tests** validating LSB, DWT-DCT, and cross-algorithm isolation.

---

## 📂 Project Architecture

```
ghostmark/
├── index.html              # Cinematic landing page
├── sentry.html             # Dashboard & live session metrics
├── encoder.html            # Encoder interface (LSB & DWT-DCT selector)
├── validator.html          # Validator & tamper inspector
├── vault.html              # Local event vault
│
├── watermark.js            # LSB steganography & integrity analyzer
├── frequency_watermark.js  # DWT-DCT & scrambling engine
├── encoder.js              # Encoder UI logic
├── validator.js            # Validator UI logic
├── test.mjs                # 18-suite test runner
└── shared.css              # Dark minimal design system & mobile layout
```

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

  Made with ❤️ by [ANKARAHAMSA](https://github.com/ANKARAHAMSA)

  *Ghostmark — leave no trace, prove everything.*

</div>
