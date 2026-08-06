import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  // All HTML files are treated as entry points (MPA mode)
  build: {
    rollupOptions: {
      input: {
        index:     'index.html',
        sentry:    'sentry.html',
        encoder:   'encoder.html',
        validator: 'validator.html',
        vault:     'vault.html',
      }
    }
  }
})
