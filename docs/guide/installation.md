# 安装

可以通过 npm、yarn 或 pnpm 安装 [@xiangheng08/qrcode](https://github.com/xiangheng08/xh-qrcode)。

## 使用包管理器

::: code-group

```bash
npm install @xiangheng08/qrcode
```

```bash
yarn add @xiangheng08/qrcode
```

```bash
pnpm add @xiangheng08/qrcode
```

:::

## 在项目中使用

### 通过 import 方式使用

```js
import '@xiangheng08/qrcode'
```

导入后，你就可以在 HTML 中使用组件了：

```html
<xh-qrcode value="Hello World!"></xh-qrcode>
```

### 按需导入组件

如果你只需要特定的组件，可以按需导入：

```js
// 导入基础二维码组件
import '@xiangheng08/qrcode/elements/xh-qrcode'

// 导入个人名片二维码组件
import '@xiangheng08/qrcode/elements/vcard'

// 导入群二维码组件
import '@xiangheng08/qrcode/elements/group'
```

### 在浏览器中直接使用

你也可以通过 CDN 直接在浏览器中使用：

```html
<script type="module" src="https://unpkg.com/@xiangheng08/qrcode/dist/xh-qrcode.js"></script>

<!-- 使用组件 -->
<xh-qrcode value="Hello World!"></xh-qrcode>
```

## 在主流框架中使用

### Vue

在 Vue 项目中，可以直接使用组件：

```vue
<template>
  <xh-qrcode value="Hello Vue!"></xh-qrcode>
</template>

<script setup>
import '@xiangheng08/qrcode'
</script>
```

### React

在 React 项目中使用：

```jsx
import '@xiangheng08/qrcode'

function App() {
  return <xh-qrcode value="Hello React!"></xh-qrcode>
}
```

### Angular

在 Angular 项目中，需要在 module 中允许使用自定义元素：

```ts
import '@xiangheng08/qrcode'

@NgModule({
  // ...
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

然后在模板中使用：

```html
<xh-qrcode value="Hello Angular!"></xh-qrcode>
```
