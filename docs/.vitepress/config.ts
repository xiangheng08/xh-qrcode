import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '@xiangheng08/qrcode',
  description: '一个基于 Web Components 的轻量级二维码生成器',
  base: '/xh-qrcode/',
  head: [['link', { rel: 'icon', href: '/xh-qrcode/logo.svg' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: '组件', link: '/components/basic' },
      { text: '工具', link: '/utilities/group-avatar' },
    ],

    sidebar: [
      {
        text: '指南',
        items: [
          { text: '介绍', link: '/guide/introduction' },
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '安装', link: '/guide/installation' },
        ],
      },
      {
        text: '组件',
        items: [
          { text: '基础二维码', link: '/components/basic' },
          { text: '个人名片二维码', link: '/components/vcard' },
          { text: '群二维码', link: '/components/group' },
        ],
      },
      {
        text: '工具',
        items: [{ text: '群头像生成', link: '/utilities/group-avatar' }],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xiangheng08/xh-qrcode' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@xiangheng08/qrcode' },
    ],
  },
  vite: {
    resolve: {
      alias: {
        '@theme': join(__dirname, 'theme'),
      },
    },
  },
  vue: {
    template: {
      compilerOptions: {
        // 将 xh- 开头的标签视为自定义原生元素
        // https://cn.vuejs.org/guide/extras/web-components
        isCustomElement: (tag) => tag.startsWith('xh-'),
      },
    },
  },
})
