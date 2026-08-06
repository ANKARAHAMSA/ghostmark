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

## 📖 About The Project

**Ghostmark** is an advanced, privacy-first web application designed for **invisible image watermarking and authorship protection**. In traditional media protection, visible stamps and text overlays degrade the aesthetics and quality of photos. Ghostmark solves this by hiding digital signatures, copyright metadata, or secret keys directly inside the raw pixel data where human eyes cannot detect them.

Whether protecting original artwork, verifying photo authenticity, or tracking digital media provenance, Ghostmark delivers an unidentifiable layer of security without sacrificing image quality.

---

## 🔬 Steganography Technology

At the heart of Ghostmark is a high-precision **Least Significant Bit (LSB) Steganography Engine**. Every digital image pixel contains 8-bit color values (0–255) for Red, Green, and Blue channels. Ghostmark embeds encrypted binary payloads into the **lowest 2 bits** of each channel:

- **Imperceptible Variance**: Modifying the 2 lowest bits shifts color values by a maximum of $\pm 3$ units out of 255—a difference completely invisible to the human visual cortex.
- **GHMK Magic Protocol Header**: Every watermarked image includes a 4-byte `GHMK` magic header alongside binary length metadata to ensure deterministic extraction and zero false positives during scanning.
- **100% Client-Side Security**: Encoding and extraction run entirely inside your browser using the HTML5 Canvas API and Web Crypto API. No server uploads or external network requests are ever made.

```
[ Original Image ]  +  [ Payload Secret ]  ──( LSB Encoder )──>  [ Watermarked PNG ]
                                                                       │
                                                                 ( Validator )
                                                                       │
                                                                 ▼ [ Decoded Secret ]
```

---

## 🎨 Visual Showcase & UI Experience

Ghostmark is designed with a premium, Vercel-inspired **dark minimal aesthetic** tailored for high-end digital tools:

- **Cinematic Animated Landing Page**: An interactive 3D intro featuring a mysterious hooded figure, dynamic canvas typography, smooth character motion, and custom spotlight lighting.
- **Ambient Cursor Spotlight**: Mouse movements dynamically illuminate the dark matrix background texture, creating an atmospheric cyber security vibe.
- **Sentry Session Dashboard**: Live overview tracking encoding metrics, scanned images, visual delta stats ($<0.01\%$), and real-time session logs.
- **Interactive Validator & Vault**: Instant Drag-and-Drop image inspection with binary payload recovery and local session history.

---

## ✨ Key Features

- **👁️ 100% Invisible Signatures**: Zero visual degradation with 99.8%+ PSNR preservation.
- **🔍 Tamper Detection & Bit Heatmap Inspector**: Pixel-level LSB bitplane analysis that highlights intact watermark regions (Green) vs. edited/cropped/compressed areas (Red).
- **🛡️ Deterministic Verification**: Detects and extracts hidden payloads with 100% accuracy and zero false positives.
- **🔒 Privacy First**: All operations execute locally in memory—your photos never leave your device.
- **⚡ Lossless PNG Export**: Automatically outputs lossless PNG files to preserve embedded bit structures indefinitely.

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

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

  Made with ❤️ by [ANKARAHAMSA](https://github.com/ANKARAHAMSA)

</div>
