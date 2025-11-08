import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './index.css'

export default {
  extends: DefaultTheme,
  enhanceApp() {
    if (!import.meta.env.SSR) {
      // 引入组件
      import('../../../lib/main')
      import('../../../lib/elements/vcard')
      import('../../../lib/elements/group')
    }
  },
} satisfies Theme
