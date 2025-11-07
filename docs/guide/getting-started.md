# 快速开始

让我们快速开始使用 [@xiangheng08/qrcode](https://github.com/xiangheng08/xh-qrcode) 创建你的第一个二维码。

## 基础使用

最简单的使用方式是直接在 HTML 中使用 [xh-qrcode](/components/basic) 组件：

```html
<xh-qrcode value="Hello World!"></xh-qrcode>
```

<xh-qrcode value="Hello World!"></xh-qrcode>

这将创建一个默认配置的二维码，内容为 "Hello World!"。

## 自定义属性

你可以通过设置不同的属性来自定义二维码的外观和行为：

```html
<xh-qrcode
  value="Hello World!"
  color="#00ff00"
  background="#000000"
  size="200"
  errorcorrectionlevel="H"
>
</xh-qrcode>
```

<xh-qrcode
value="Hello World!"
color="#00ff00"
background="#000000"
size="200"
errorcorrectionlevel="H" />

## 完整示例

以下是一个完整的 HTML 示例：

```html
<!DOCTYPE html>
<html>
  <head>
    <title>QRCode Example</title>
    <script type="module" src="https://unpkg.com/@xiangheng08/qrcode/dist/xh-qrcode.js"></script>
  </head>
  <body>
    <h1>我的二维码</h1>
    <xh-qrcode value="https://example.com" size="200" color="#000" background="#fff"> </xh-qrcode>
  </body>
</html>
```

## 在框架中使用

### Vue 示例

```vue
<template>
  <div>
    <h1>二维码示例</h1>
    <xh-qrcode :value="qrValue" :size="200"></xh-qrcode>
    <input v-model="qrValue" placeholder="输入二维码内容" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import '@xiangheng08/qrcode'

const qrValue = ref('Hello Vue!')
</script>
```

### React 示例

```jsx
import { useState } from 'react'
import '@xiangheng08/qrcode'

function App() {
  const [value, setValue] = useState('Hello React!')

  return (
    <div>
      <h1>二维码示例</h1>
      <xh-qrcode value={value} size={200}></xh-qrcode>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="输入二维码内容"
      />
    </div>
  )
}

export default App
```

## 下一步

- 查看 [基础二维码组件](/components/basic) 了解所有可用属性
- 探索 [个人名片二维码](/components/vcard) 创建更丰富的名片二维码
- 使用 [群二维码](/components/group) 为群聊生成二维码
