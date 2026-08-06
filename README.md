# Ghostmark

Invisible image watermarking. Embed hidden text payloads into any image using LSB steganography — no visible change, fully reversible.

## What it does

- **Encode** — Embed any text string into an image's pixel data. The change is mathematically imperceptible (&lt;0.01% visual delta per channel).
- **Validate** — Scan any watermarked PNG to extract and verify the hidden payload instantly.
- **Vault** — Session history of all encode and scan operations.

## How it works

LSB (Least Significant Bit) steganography writes data into the 2 least significant bits of each R, G, B channel. This causes a maximum shift of ±3 per channel value — invisible to the human eye but reliably detectable algorithmically.

A `GHMK` magic header is prepended to all payloads so the validator can confirm authenticity without false positives.

> **Note:** Always export watermarked images as PNG. JPEG re-compression destroys the LSB data.

## Stack

- Vite (multi-page, no framework)
- Vanilla JS ES modules
- Canvas API for pixel manipulation
- DM Serif Display · Inter · JetBrains Mono

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)
