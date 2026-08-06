import { defineConfig } from 'vite'

export default defineConfig({
  // All HTML files are treated as entry points (MPA mode)
  build: {
    rollupOptions: {
      input: {
        index:     'index.html',
        encoder:   'encoder.html',
        validator: 'validator.html',
        vault:     'vault.html',
      }
    }
  }
})
