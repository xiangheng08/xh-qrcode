import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  server: {
    port: 37725,
  },
  build: {
    lib: {
      entry: {
        'xh-qrcode': resolve(__dirname, 'lib/main.ts'),
        'elements/group': resolve(__dirname, 'lib/elements/group.ts'),
      },
      name: 'XHQRCode',
    },
  },
  plugins: [dts({ tsconfigPath: './tsconfig.dts.json' })],
})
