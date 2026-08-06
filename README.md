<div align="center">

  <img src="public/logo.svg" alt="Ghostmark Logo" width="80" height="80" />

  # GHOSTMARK

  ### *Invisible Image Watermarking & Steganographic Verification*

  [![License: MIT](https://img.shields.io/badge/License-MIT-c8f000.svg?style=for-the-badge&logoColor=black)](LICENSE)
  [![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![JavaScript](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![Steganography](https://img.shields.io/badge/LSB-2--Bit_Engine-c8f000.svg?style=for-the-badge)](https://en.wikipedia.org/wiki/Steganography)

  <p align="center">
    <b>Hide unidentifiable watermarks directly inside raw pixel channel data with zero perceptual loss.</b>
    <br />
    <i>Imperceptible to human eyes. Fully recoverable. 100% Client-Side.</i>
  </p>

  <br />

</div>

---

## 🌟 Overview

**Ghostmark** is a state-of-the-art web application engineered for **invisible steganographic watermarking**. Unlike traditional visible watermarks that alter image aesthetics or destroy visual composition, Ghostmark embeds encrypted payload signatures into the **2 Least Significant Bits (LSB)** of each RGB color channel.

The resulting watermarked image preserves **99.8%+ Peak Signal-to-Noise Ratio (PSNR)** — rendering the embedded mark completely invisible to human eyes while allowing deterministic extraction using the built-in **Validator**.

```
[ Original Image ]  +  [ Payload Secret ]  ──( LSB Encoder )──>  [ Watermarked PNG ]
                                                                       │
                                                                 ( Validator )
                                                                       │
                                                                 ▼ [ Decoded Secret ]
```

---

## ✨ Key Features

- **👁️ Imperceptible Steganography**: Writes secret payload data into the lowest bits of R, G, and B color channels. Maximum shift is $\pm 3$ per pixel value.
- **🛡️ GHMK Protocol Header**: Encodes a magic byte header (`GHMK`) alongside binary payload length metadata to guarantee zero false positives.
- **⚡ 100% Client-Side & Private**: All image processing happens locally inside the browser via HTML5 Canvas API and Web Crypto API. No server uploads.
- **🎭 Cinematic Animated Landing Page**: Interactive story-driven 3D intro featuring procedural Canvas animation, character storytelling, and dark cyber aesthetic.
- **📊 Sentry Dashboard**: Real-time session analytics tracking encoded counts, scanned images, visual delta metrics, and event history.
- **🔒 Secure Vault**: Local storage vault to track recent encoding & scanning history with one-click export.
- **💡 Ambient Spotlight Cursor**: Theme-matching ambient radial spotlight following mouse movement for immersive dark-mode UI.

---

## 🛠️ How LSB Steganography Works

Every pixel in a digital image consists of Red, Green, and Blue (RGB) values ranging from `0` to `255` (8-bit integer):

$$\text{Pixel Color} = [R_8, G_8, B_8]$$

Ghostmark isolates the **2 Least Significant Bits** of each channel:

```
Original Byte:  1 1 0 1 0 1  [ 0 1 ]  <-- 2 LSBs modified
Payload Bits:                [ 1 0 ]
------------------------------------
Modified Byte:  1 1 0 1 0 1  [ 1 0 ]  (Max visual difference: ±3 / 255)
```

Because human eyes cannot perceive a variance of $\pm 3$ units out of 255 in individual channel intensities, the watermark remains **100% invisible**.

> **Note**: Lossy compression formats like JPEG alter low-order bit values. Therefore, Ghostmark automatically enforces lossless **PNG** export to preserve embedded payloads indefinitely.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- `npm` or `pnpm`

### Installation & Local Setup

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

Open your browser and navigate to `http://localhost:5173` to explore Ghostmark locally!

---

## 📂 Project Architecture

```
ghostmark/
├── index.html          # Cinematic Animated Landing Page & Home Hero
├── sentry.html         # Sentry Session Dashboard & Live Metrics
├── encoder.html        # LSB Image Encoder Interface
├── validator.html      # Steganography Payload Validator & Extractor
├── vault.html          # Local Session Storage & Event Vault
├── watermark.js        # Core LSB Steganography Engine (Encode/Decode)
├── sentry.js           # Session Metrics & Activity Logger
├── encoder.js          # Encoder UI Logic & Canvas Render Controller
├── validator.js        # Validator UI Logic & Payload Recovery Engine
├── vault.js            # Vault Storage & Export Controller
├── cursor.js           # Ambient Cursor Spotlight Follower
├── shared.css          # Dark Minimal Design System & CSS Variables
├── vite.config.js      # Vite Multi-Page Application (MPA) Config
└── public/
    ├── logo.svg        # Ghostmark Emblem Brand Logo
    ├── favicon.svg     # Brand Favicon Icon
    └── bg-texture.jpg  # Translucent Dark Cyber Background Texture
```

---

## 🖥️ Page Navigation Guide

| Page | Path | Description |
| :--- | :--- | :--- |
| **Home** | `/index.html` | Interactive intro animation & product showcase |
| **Sentry** | `/sentry.html` | Live session metrics & visual delta overview |
| **Encoder** | `/encoder.html` | Embed secret text/keys into any image |
| **Validator** | `/validator.html` | Extract & verify hidden signatures from images |
| **Vault** | `/vault.html` | History log of recent watermarking operations |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

  Made with ❤️ by [ANKARAHAMSA](https://github.com/ANKARAHAMSA)

</div>
