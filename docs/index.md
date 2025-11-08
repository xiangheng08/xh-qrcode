---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: '@xiangheng08/qrcode'
  text: '一个基于 Web Components 的轻量级二维码生成器'
  tagline: 基于 Lit 和 TypeScript 构建，支持多种二维码样式和功能
  image:
    src: /images/vite.svg
    alt: VitePress
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 组件示例
      link: /components/basic

features:
  - title: 🧩 Web Components
    details: 基于 Web Components 标准构建，可在任何框架中使用，无需额外依赖
  - title: 🎨 高度可定制
    details: 支持自定义颜色、形状、大小、logo等功能，满足各种个性化需求
  - title: 📱 多种类型
    details: 支持基础二维码、个人名片二维码、群二维码等多种类型
  - title: ⚡ 高性能
    details: 基于 Canvas 渲染，性能优异，支持实时预览
  - title: 📦 轻量级
    details: 体积小巧，易于集成到任何项目中
  - title: 🔧 易于使用
    details: 简单的 API 设计，通过 HTML 属性即可完成配置
---

<script setup>
  import HomeDynamicQRCode from '@theme/components/HomeDynamicQRCode.vue'
</script>

<HomeDynamicQRCode />
