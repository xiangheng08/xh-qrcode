import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  enhanceApp() {
    if (!import.meta.env.SSR) {
      // 引入组件
      import('@xiangheng08/qrcode')
      import('@xiangheng08/qrcode/elements/vcard')
      import('@xiangheng08/qrcode/elements/group')
    }
  },
} satisfies Theme
