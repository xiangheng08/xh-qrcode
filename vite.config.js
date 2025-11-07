import { dirname, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import fg from 'fast-glob'
import pkg from './package.json'

const __dirname = dirname(fileURLToPath(import.meta.url))

const libDir = resolve(__dirname, 'lib')
const elements = fg.sync('elements/*.ts', { cwd: libDir }).reduce((acc, file) => {
  const name = file.replace(extname(file), '')
  acc[name] = resolve(libDir, file)
  return acc
}, {})

const banner = `

/**
 * ${pkg.name} v${pkg.version}
 * ${pkg.homepage}
 *
 * @license
 * Copyright (c) 2025-present ${pkg.author}
 * Released under the ${pkg.license} license
 * ${pkg.license_url}
 */

`

export default defineConfig({
  server: {
    port: 37725,
  },
  build: {
    lib: {
      entry: {
        'xh-qrcode': resolve(__dirname, 'lib/main.ts'),
        utils: resolve(__dirname, 'lib/utils/export.ts'),
        ...elements,
      },
      name: 'XHQRCode',
    },
    rollupOptions: {
      output: {
        banner,
      },
    },
  },
  plugins: [dts({ tsconfigPath: './tsconfig.dts.json' })],
})
