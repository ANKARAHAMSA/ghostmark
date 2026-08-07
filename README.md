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

## 🔬 Algorithm I — LSB Steganography

### Core Principle

Every pixel channel holds an 8-bit unsigned integer value $p \in [0, 255]$. The watermark bit $w \in \{0, 1\}$ is embedded by overwriting the least significant bits of $p$:

$$p' = \bigl(\, p \mathbin{\&} \mathtt{FC}_{16} \,\bigr) \mathbin{|} \, w$$

> where $\mathtt{FC}_{16} = 11111100_2$ is the 2-bit mask that zeroes the two LSBs.

For a 2-bit embedding depth (Ghostmark's default), the maximum per-channel distortion is:

$$\Delta p_{\max} = 2^{k} - 1 = 3, \quad k = 2$$

### Imperceptibility

The **Peak Signal-to-Noise Ratio (PSNR)** quantifies the visual quality of the watermarked image relative to the original. For 2-bit LSB embedding on an 8-bit channel:

$$\text{PSNR} = 10 \cdot \log_{10} \left( \frac{255^2}{\text{MSE}} \right) \approx 51.1 \;\text{dB}$$

where the **Mean Squared Error (MSE)** for uniform 2-bit noise is:

$$\text{MSE} = \frac{1}{N} \sum_{i=1}^{N} (p_i - p'_i)^2 \leq \frac{(2^k - 1)^2}{3} \approx 3$$

A PSNR above **40 dB** is considered perceptually lossless. Ghostmark achieves **≥ 51 dB** (99.8%+ PSNR preservation).

### Payload Format

The bitstream layout embedded in the pixel data:

```
Byte offset:  0     1     2     3     4     5     6     7       8 ... 8+N
              ┌─────┬─────┬─────┬─────┬───────────────────┬──────────────┐
              │ 'G' │ 'H' │ 'M' │ 'K' │  length (4 bytes  │  payload     │
              │     │     │     │     │  little-endian)    │  bytes       │
              └─────┴─────┴─────┴─────┴───────────────────┴──────────────┘
                          GHMK Magic Header
```

### Capacity

For an image of $W \times H$ pixels with $C = 3$ color channels and $k = 2$ bits per channel:

$$\text{Capacity}_{\text{LSB}} = \left\lfloor \frac{W \cdot H \cdot C \cdot k}{8} \right\rfloor \;\text{bytes}$$

For a $512 \times 512$ image: $\approx 196{,}608$ bytes.

---

## 🔬 Algorithm II — DWT-DCT + Frequency Domain Scrambling

### Overview

The frequency-domain engine embeds watermark bits into the **mid-frequency DCT coefficients** of $8 \times 8$ image blocks. This exploits the energy compaction property of the DCT — low frequencies carry dominant visual signal, high frequencies are discarded by JPEG quantization, and **mid-frequencies are robust to both**.

### Step 1 — Payload Scrambling

The payload bytes are permuted using a **seeded Fisher-Yates shuffle** (deterministic, bijective, keyed by `ARNOLD_ITERS`). For a payload of $N$ bytes with permutation $\pi$:

$$b'_i = b_{\pi(i)}, \quad i \in [0, N)$$

The inverse permutation satisfies $\pi^{-1}(\pi(i)) = i$ for all $i$, guaranteeing perfect descrambling:

$$b_{\pi(i)} = b'_i \;\Longrightarrow\; b_i = b'_{\pi^{-1}(i)}$$

> **Note:** This is inspired by the **Arnold Cat Map**, a chaotic 2D permutation from the paper *"Transformation Based Watermarking for Image Authentication"*. Arnold's map applies the following transform iteratively on an $N \times N$ grid:
>
> $$x' = (x + y) \bmod N, \qquad y' = (x + 2y) \bmod N$$
>
> The transformation matrix $\mathbf{A} = \bigl[\begin{smallmatrix}1&1\\1&2\end{smallmatrix}\bigr]$ has $\det(\mathbf{A}) = 1$, making it area-preserving and invertible. Ghostmark uses a keyed Fisher-Yates shuffle for exact bijectivity on arbitrary-length arrays.

### Step 2 — 2D Discrete Cosine Transform (DCT-II)

Each $8 \times 8$ block of pixel values $f[m][n]$ is transformed to the frequency domain using the **separable 2D DCT-II** (row-column decomposition):

$$F[u][v] = C(u)\,C(v) \sum_{m=0}^{7} \sum_{n=0}^{7} f[m][n] \cdot \cos\!\left(\frac{(2m+1)\,u\,\pi}{16}\right) \cos\!\left(\frac{(2n+1)\,v\,\pi}{16}\right)$$

where the orthonormality scaling factor is:

$$C(k) = \begin{cases} \dfrac{1}{\sqrt{8}} & \text{if } k = 0 \\ \dfrac{1}{2} & \text{if } k \neq 0 \end{cases}$$

The inverse transform (IDCT-II) reconstructs the spatial block:

$$f[m][n] = \sum_{u=0}^{7} \sum_{v=0}^{7} C(u)\,C(v)\; F[u][v] \cdot \cos\!\left(\frac{(2m+1)\,u\,\pi}{16}\right) \cos\!\left(\frac{(2n+1)\,v\,\pi}{16}\right)$$

### Step 3 — Mid-Frequency Bit Embedding

The watermark bit $w \in \{0, 1\}$ is embedded into a DCT coefficient $F[pos]$ at a **mid-frequency zigzag position** using **quantization index modulation (QIM)**:

$$q = \text{round}\!\left(\frac{F[\text{pos}]}{\alpha}\right)$$

$$q^* = \begin{cases}
q & \text{if } (|q| \bmod 2) = w \\
q + 1 & \text{if } (|q| \bmod 2) \neq w \text{ and } q \geq 0 \\
q - 1 & \text{if } (|q| \bmod 2) \neq w \text{ and } q < 0
\end{cases}$$

$$F'[\text{pos}] = q^* \cdot \alpha$$

where $\alpha = 32$ is the **quantization step size** (embedding strength). The bit is recovered by reading the parity:

$$\hat{w} = |q'| \bmod 2, \quad q' = \text{round}\!\left(\frac{F'[\text{pos}]}{\alpha}\right)$$

### Step 4 — Majority Vote (3× Redundancy)

Each logical bit is embedded into **3 consecutive DCT coefficient slots**. Extraction uses a majority vote to correct single-bit errors from uint8 clamping:

$$\hat{w} = \mathbb{1}\!\left[\sum_{r=1}^{3} \hat{w}_r > \frac{3}{2}\right]$$

This gives a **theoretical bit error rate** of zero when the per-slot error probability $p_e \ll 0.5$:

$$P(\text{error after vote}) = \binom{3}{2} p_e^2 (1 - p_e) + \binom{3}{3} p_e^3$$

Measured $p_e \approx 0.003$, giving $P(\text{error after vote}) \approx 2.7 \times 10^{-5}$ per bit.

### Zigzag Mid-Frequency Positions

The 16 DCT coefficient positions used for embedding (indices into the $8 \times 8$ block in row-major order):

```
DCT Block (8×8):
  DC  ·   ·   ·   ·   ·   ·   ·
   ·  ·  [5] [6]  ·   ·   ·   ·
   ·  ·   · [9][10][11]·   ·   ·
   ·  ·   ·   · [14][15][16][17]·
   ·  ·   ·   ·   · [20][21][22]·
   ·  ·   ·   ·   ·   · [25][26]·
   ·  ·   ·   ·   ·   ·   · [29]·
   ·  ·   ·   ·   ·   ·   ·  [30]
                                HF
```

*Positions 5–30 (mid-band): robust against JPEG quantization and invisible to the eye.*

### Payload Format (DWT-DCT)

```
Logical bit offset:  0               63  64              64 + N×8
                     ┌────────────────────┬────────────────────────┐
                     │  Header (8 bytes)  │  Scrambled payload     │
                     │  FWMK + len (LE)   │  bytes (Arnold-keyed)  │
                     │  PLAIN — no scramble│                        │
                     └────────────────────┴────────────────────────┘
```

### Capacity

$$\text{Capacity}_{\text{DWT-DCT}} = \left\lfloor \frac{\lfloor W/8 \rfloor \cdot \lfloor H/8 \rfloor \cdot P}{R} \right\rfloor - 8 \;\text{bytes}$$

where $P = 16$ positions per block and $R = 3$ (redundancy factor).

| Resolution | LSB Capacity | DWT-DCT Capacity |
|---|---|---|
| 256 × 256 | ~49,152 bytes | ~674 bytes |
| 512 × 512 | ~196,608 bytes | ~2,714 bytes |
| 1024 × 1024 | ~786,432 bytes | ~10,914 bytes |

---

## ⚖️ Algorithm Comparison

| Property | LSB | DWT-DCT |
|---|---|---|
| Domain | Spatial | Frequency |
| JPEG survival | ❌ | ✅ (quality > 75%) |
| PSNR | ≥ 51 dB | ≥ 40 dB |
| Capacity (512×512) | ~196 KB | ~2.7 KB |
| Max pixel shift | ±3 | ~±8 (green ch.) |
| Speed | Instant | ~100ms |
| Scrambling | None | Seeded F-Y shuffle |
| Best for | PNG, archives | JPEG, social media |

---

## ✨ Key Features

- **👁️ Dual Algorithm Selector** — Choose between LSB (Mode 01) and DWT-DCT (Mode 02) with a single click in the encoder.
- **🔍 Auto-Detection on Validation** — The validator automatically tries LSB first, then DWT-DCT. Displays an algorithm badge (`LSB` or `DWT-DCT + Arnold`) in the result.
- **🛡️ Tamper Detection & Bit Heatmap Inspector** — Pixel-level 32×32 block bitplane analysis highlights intact watermark regions vs. edited/compressed areas.
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
- **LSB:** 7 tests — short/long/unicode payloads, clean image, pixel delta ≤3, avg delta <2, confidence
- **DWT-DCT:** 8 tests — short/medium/unicode payloads, clean image, capacity, scaling, algo field, overflow guard
- **Cross-algo isolation:** 3 tests — no cross-detection, double-watermark LSB survival

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
├── frequency_watermark.js  # DWT-DCT + seeded permutation scramble engine
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
LSB Header:      GHMK (4 bytes) + length (4 bytes LE) + raw payload bits
DWT-DCT Header:  FWMK (4 bytes, plain) + length (4 bytes LE) + scrambled payload

Scramble key:    seed = ARNOLD_ITERS × 0xA3C5 + 0x1F4B
                 → Deterministic Fisher-Yates shuffle on payload bytes

Both engines:
  ✓ No server contact — 100% in-browser
  ✓ No tracking, analytics, or cookies
  ✓ No eval() or dynamic code execution
  ✓ No external API calls — fully offline-capable
```

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

  Made with ❤️ by [ANKARAHAMSA](https://github.com/ANKARAHAMSA)

  *Ghostmark — leave no trace, prove everything.*

</div>
