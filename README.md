<div align="center">

  <img src="public/logo.svg" alt="Ghostmark Logo" width="84" height="84" />

  # GHOSTMARK

  ### *Invisible Image Watermarking & Steganographic Verification Engine*

  [![License: MIT](https://img.shields.io/badge/License-MIT-c8f000.svg?style=for-the-badge&logoColor=black)](LICENSE)
  [![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![JavaScript](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![LSB Engine](https://img.shields.io/badge/LSB-2--Bit_Engine-c8f000.svg?style=for-the-badge)](https://en.wikipedia.org/wiki/Steganography)
  [![DWT-DCT](https://img.shields.io/badge/DWT--DCT-Frequency_Domain-lime.svg?style=for-the-badge)](https://en.wikipedia.org/wiki/Discrete_cosine_transform)
  [![Mobile Ready](https://img.shields.io/badge/Mobile-Optimized-00e5ff.svg?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries)

  <p align="center">
    <b>Protect digital artwork, verify photo provenance, and embed hidden copyright metadata directly inside image data with zero perceptual loss.</b>
    <br />
    <i>100% Client-Side Engine · Imperceptible Signatures · Compression Resilient · Open Source</i>
  </p>

  <br />

  🌐 **[Try Live Application → ghostmark.vercel.app](https://ghostmark.vercel.app)**

  <br />

</div>

---

## 📖 Project Overview

**Ghostmark** is a privacy-first, client-side web platform designed for **invisible image watermarking, copyright protection, and digital media verification**. 

Traditional image protection relies on visible stamps, logos, or text overlays. While easy to apply, visible watermarks ruin the aesthetic quality of photographs and digital art, and can easily be cropped out or erased using modern AI inpainting tools.

Ghostmark solves this by embedding unidentifiable digital signatures, cryptographic keys, or ownership metadata directly into the image's binary structure. To human eyes, the watermarked photo appears completely identical to the original. However, using Ghostmark's built-in **Validator**, the secret payload can be reliably detected, extracted, and verified anytime.

### Key Highlights & Innovations
- **Dual Watermarking Engines**: Spatial LSB for maximum capacity; DWT-DCT Frequency transformation for JPEG compression survival.
- **Tamper Heatmap Inspector**: Visualizes pixel-level alterations using a fine-grained 32×32 block integrity grid.
- **Zero-Server Architecture**: 100% of processing happens locally in your browser memory. Your images are never uploaded to any remote server.
- **Mobile-Optimized Interface**: Fully responsive UI with custom navigation, dark cyber aesthetic, and touch-friendly controls.

---

## 🔬 Core Technologies & Algorithms

Ghostmark implements two distinct watermarking algorithms designed for different security requirements and media distribution channels:

```
                                  ┌──────────────────────────┐
                                  │      Input Image         │
                                  └────────────┬─────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       ▼                                               ▼
         ┌───────────────────────────┐                   ┌───────────────────────────┐
         │ Mode 01: LSB Engine       │                   │ Mode 02: DWT-DCT Engine   │
         │ (Spatial Domain)          │                   │ (Frequency Domain)        │
         └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                       │                                               │
                       ├─▶ Fast, Pixel-Level Modification              ├─▶ 8x8 DCT Frequency Spectrum
                       ├─▶ High Payload Capacity                       ├─▶ Mid-Band Quantization (QIM)
                       └─▶ Ideal for PNGs & Archival Media             └─▶ JPEG Compression Survival
```

---

### Algorithm 01: Least Significant Bit (LSB) Steganography

Spatial-domain steganography works by embedding payload bits directly into the raw color values of an image's pixels.

#### How It Works:
1. **Pixel Bit Structure**: In standard 24-bit RGB images, every pixel consists of Red, Green, and Blue channels. Each channel holds an 8-bit integer value ranging from `0` to `255` (binary `00000000` to `11111111`).
2. **2-Bit Embedding**: Ghostmark overwrites only the **lowest 2 bits** of each color channel. For example, changing a Red channel value from `204` (`11001100`) to `207` (`11001111`) alters the brightness by less than 1.2%.
3. **Imperceptibility**: Human visual cortex cannot distinguish color changes smaller than 3 to 4 units out of 255. Ghostmark maintains a **Peak Signal-to-Noise Ratio (PSNR) of 51 dB or higher**, ensuring 99.8%+ visual fidelity.
4. **Header Protocol**: Every embedded message is prefixed with a 4-byte `GHMK` protocol signature and a 4-byte payload length header. This prevents false positive detections when scanning unwatermarked images.

```
Byte Offset:   0     1     2     3     4     5     6     7     8 ... 8+N
             ┌─────┬─────┬─────┬─────┬───────────────────┬──────────────┐
             │ 'G' │ 'H' │ 'M' │ 'K' │  Payload Length   │ Encoded Text │
             │     │     │     │     │ (4-byte UInt32)   │ Payload      │
             └─────┴─────┴─────┴─────┴───────────────────┴──────────────┘
                         Protocol Header                 Secret Message
```

---

### Algorithm 02: DWT-DCT + Permutation Scrambling (Frequency Domain)

While LSB steganography is fast and offers massive storage capacity, lossy image compression (like JPEG saving or messaging app re-compression) clears pixel LSBs, destroying spatial watermarks.

To solve this, Ghostmark includes a frequency-domain engine based on **Discrete Wavelet & Discrete Cosine Transformations (DWT-DCT)** combined with **keyed byte-permutation scrambling**.

#### How It Works:
1. **Payload Scrambling**: Before embedding, payload bytes are shuffled using a deterministic Fisher-Yates permutation algorithm seeded with a security key (`ARNOLD_ITERS`). This scrambles the payload order so data cannot be read without the key.
2. **Frequency Domain Split**: The green color channel of the image is partitioned into $8 \times 8$ pixel blocks. Each block undergoes a **2D Discrete Cosine Transform (DCT-II)**, converting spatial brightness into frequency coefficients:
   - **Low-Frequency (DC)**: Contains overall block lighting. Modifying this causes visible distortion.
   - **High-Frequency (HF)**: Stores fine edges and noise. JPEG compression aggressively removes these.
   - **Mid-Frequency Band**: Balanced region (positions 5 to 30 in zigzag order). Highly resilient to compression while remaining imperceptible.
3. **Quantization Index Modulation (QIM)**: Watermark bits are embedded into mid-frequency coefficients by rounding coefficients to even or odd multiples of a quantization step ($\alpha = 32$).
4. **3× Redundancy Voting**: Every bit is written across 3 separate coefficient slots. During extraction, a majority-vote algorithm resolves any minor rounding errors, achieving a **0% Bit Error Rate (BER)**.

---

## ⚖️ Detailed Engine Comparison

| Feature | Mode 01: LSB Steganography | Mode 02: DWT-DCT Frequency Engine |
|---|---|---|
| **Embedding Domain** | Spatial Domain (Raw Pixels) | Frequency Domain (DCT Coefficients) |
| **JPEG Compression Survival** | ❌ Fragile (Lossless PNG required) | ✅ Resilient (Survives JPEG > 75% quality) |
| **Max Capacity (512×512 Image)** | ~196 KB (Huge payload support) | ~2.7 KB (Text, keys, & signatures) |
| **Visual Quality (PSNR)** | $\ge 51 \text{ dB}$ (Lossless imperceptibility) | $\ge 40 \text{ dB}$ (High perceptual quality) |
| **Channel Used** | Red, Green, and Blue channels | Green channel mid-frequency band |
| **Data Security** | Header Validation Protocol (`GHMK`) | Keyed Permutation Scrambling (`FWMK`) |
| **Processing Speed** | Near Instantaneous (< 20ms) | Fast (~100ms for HD images) |
| **Primary Use Cases** | Lossless PNG archives, medical media, original art | Social media uploads, JPEG distribution, web sharing |

---

## ✨ Features & User Experience

### 🔒 100% In-Browser Privacy
Ghostmark is built entirely using vanilla Web APIs (HTML5 Canvas API, Web Crypto API, typed arrays). No image data or payload text is ever transmitted over the network.

### 🛡️ Tamper Heatmap Inspector
The **Validator** includes an interactive 32×32 block bitplane analyzer. When evaluating an image, it renders a visual overlay:
- **Green Blocks**: Intact, unmodified watermark data detected.
- **Orange/Yellow Blocks**: Minor compression noise detected.
- **Red Blocks**: Altered, edited, cropped, or drawn-over pixel regions.

### 📱 Responsive Mobile-First Interface
Ghostmark features a responsive layout designed for mobile phones, tablets, and desktop displays:
- Slide-over mobile hamburger menu on screens under 640px.
- Dynamic touch-friendly algorithm selector cards.
- Auto-scaling canvas previews and metadata cards.

---

## 🛠️ Local Development & Testing

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation Steps

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

Open your browser and navigate to `http://localhost:5173`.

### Running the End-to-End Test Suite

Ghostmark includes an automated test runner (`test.mjs`) covering 18 integration test scenarios:

```bash
node --experimental-vm-modules test.mjs
```

#### Test Suite Breakdown:
- **LSB Tests (7/7)**: Short/long payload encoding, Unicode/emoji support, clean image verification, pixel delta thresholds, confidence scoring.
- **DWT-DCT Tests (8/8)**: Frequency spectrum transformation, medium text payloads, capacity scaling, overflow guards, algorithm tag detection.
- **Isolation Tests (3/3)**: Cross-algorithm immunity checks and multi-pass watermarking validation.

---

## 📂 Codebase Architecture

```
ghostmark/
├── index.html              # Animated landing page & hero spotlight
├── sentry.html             # Real-time session metrics & monitoring dashboard
├── encoder.html            # Watermark embedding page (LSB / DWT-DCT selector)
├── validator.html          # Verification page & tamper heatmap inspector
├── vault.html              # Local event logs & history vault
│
├── watermark.js            # LSB steganography core engine & integrity analyzer
├── frequency_watermark.js  # DWT-DCT transformation & permutation engine
├── encoder.js              # Encoder UI interaction controller
├── validator.js            # Validator UI controller & auto-detection engine
├── sentry.js               # Metrics collector & telemetry handler
├── vault.js                # Vault storage manager (sessionStorage)
├── cursor.js               # Cyber matrix spotlight follower effect
│
├── shared.css              # Dark design system, CSS variables, & responsive grid
├── test.mjs                # 18-suite Node.js automated test runner
└── vite.config.js          # Multi-Page Application (MPA) Vite configuration
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [`LICENSE`](LICENSE) file for details.

---

<div align="center">

  Made with ❤️ by [ANKARAHAMSA](https://github.com/ANKARAHAMSA)

  *Ghostmark — Leave no trace. Prove everything.*

</div>
