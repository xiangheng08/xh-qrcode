import { dirname, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import fg from 'fast-glob'

const __dirname = dirname(fileURLToPath(import.meta.url))

const libDir = resolve(__dirname, 'lib')
const elements = fg.sync('elements/*.ts', { cwd: libDir }).reduce((acc, file) => {
  const name = file.replace(extname(file), '')
  acc[name] = resolve(libDir, file)
  return acc
}, {})

export default defineConfig({
  server: {
    port: 37725,
  },
  build: {
    lib: {
      entry: {
        'xh-qrcode': resolve(__dirname, 'lib/main.ts'),
        ...elements,
      },
      name: 'XHQRCode',
    },
  },
  plugins: [dts({ tsconfigPath: './tsconfig.dts.json' })],
})
