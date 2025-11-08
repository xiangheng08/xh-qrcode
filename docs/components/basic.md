# 基础二维码 (xh-qrcode)

基础二维码组件是最核心的组件，可用于生成标准的二维码。

## 基本用法

```html
<xh-qrcode value="Hello World!"></xh-qrcode>
```

## 属性 (Attributes)

| 属性名               | 类型      | 默认值                       | 描述                                         |
| -------------------- | --------- | ---------------------------- | -------------------------------------------- |
| value                | `string`  | `''`                         | 二维码内容                                   |
| version              | `number`  | `undefined`                  | 二维码版本 (1-40)                            |
| errorcorrectionlevel | `string`  | `'M'`                        | 错误纠正级别 (`'L'`, `'M'`, `'Q'`, `'H'`)    |
| pixelSize            | `number`  | `4`                          | 像素大小                                     |
| color                | `string`  | `'#000000'`                  | 像素颜色                                     |
| background           | `string`  | `'#ffffff'`                  | 背景颜色                                     |
| padding              | `number`  | `undefined`                  | 内边距                                       |
| size                 | `number`  | `undefined`                  | 二维码大小                                   |
| logo                 | `string`  | `undefined`                  | Logo 图片 URL                                |
| logoScale            | `number`  | `undefined`                  | Logo 大小比例 (0-1)                          |
| logoPadding          | `number`  | `0.1`                        | Logo 内边距 (0-1)                            |
| mask                 | `boolean` | `false`                      | 是否显示遮罩层                               |
| maskColor            | `string`  | `'rgba(255, 255, 255, 0.9)'` | 遮罩层颜色                                   |
| resizeRedraw         | `boolean` | `true`                       | 窗口大小改变时是否重新绘制                   |
| shape                | `string`  | `'normal'`                   | 像素形状 (`'normal'`, `'circle'`, `'round'`) |

## 示例

### 基础二维码

```html
<xh-qrcode value="Basic QR Code"></xh-qrcode>
```

<xh-qrcode value="Basic QR Code"></xh-qrcode>

### 自定义颜色

```html
<xh-qrcode value="Colored QR Code" color="#00ff00" background="#000000"></xh-qrcode>
```

<xh-qrcode value="Colored QR Code" color="#00ff00" background="#000000"></xh-qrcode>

### 自定义大小

```html
<xh-qrcode value="Sized QR Code" size="200"></xh-qrcode>
```

<xh-qrcode value="Sized QR Code" size="200"></xh-qrcode>

### 高纠错级别

```html
<xh-qrcode value="High Error Correction" errorcorrectionlevel="H"></xh-qrcode>
```

<xh-qrcode value="High Error Correction" errorcorrectionlevel="H"></xh-qrcode>

### 带 Logo

```html
<xh-qrcode value="With Logo" errorcorrectionlevel="H" logo="./logo.svg"></xh-qrcode>
```

<xh-qrcode value="With Logo" errorcorrectionlevel="H" logo="../images/vite.svg"></xh-qrcode>

### 自定义 Logo 大小

```html
<xh-qrcode
  value="Large Logo"
  errorcorrectionlevel="H"
  logo="./logo.svg"
  logoScale="0.3"
></xh-qrcode>
```

<xh-qrcode
  value="Large Logo"
  errorcorrectionlevel="H"
  logo="../images/vite.svg"
  logoScale="0.3"
/>

### 显示遮罩层

```html
<xh-qrcode value="Masked QR Code" mask></xh-qrcode>
```

<xh-qrcode value="Masked QR Code" mask></xh-qrcode>

### 自定义遮罩层颜色

```html
<xh-qrcode value="Custom Mask Color" mask maskColor="rgba(0, 0, 0, 0.8)"></xh-qrcode>
```

<xh-qrcode value="Custom Mask Color" mask maskColor="rgba(0, 0, 0, 0.8)"></xh-qrcode>

### 带遮罩层内容

```html
<xh-qrcode value="With Mask Content" mask>
  <span style="background: pink; padding: 4px; border-radius: 4px">Mask Content</span>
</xh-qrcode>
```

<xh-qrcode value="With Mask Content" mask>
  <span style="background: pink; padding: 4px; border-radius: 4px">Mask Content</span>
</xh-qrcode>

### 不同形状

```html
<!-- 圆点形状 -->
<xh-qrcode value="Circle Shape" shape="circle"></xh-qrcode>

<!-- 圆角方形 -->
<xh-qrcode value="Round Shape" shape="round"></xh-qrcode>
```

<div style="display: flex; gap: 16px; flex-wrap: wrap;">
  <xh-qrcode value="Circle Shape" shape="circle" size="160" errorcorrectionlevel="H"></xh-qrcode>
  <xh-qrcode value="Round Shape" shape="round" size="160" errorcorrectionlevel="H"></xh-qrcode>
</div>

## CSS 自定义属性

可通过 CSS 自定义属性修改组件样式：

| 属性名         | 默认值                     | 描述       |
| -------------- | -------------------------- | ---------- |
| `--mask-color` | `rgba(255, 255, 255, 0.9)` | 遮罩层颜色 |

示例：

```html
<style>
  .custom-qrcode {
    --mask-color: rgba(0, 0, 0, 0.8);
  }
</style>

<xh-qrcode class="custom-qrcode" value="Custom Style" mask></xh-qrcode>
```

<xh-qrcode class="custom-qrcode" value="Custom Style" mask></xh-qrcode>

<style>
  .custom-qrcode {
    --mask-color: rgba(0, 0, 0, 0.8);
  }
</style>

## 事件

组件会派发以下事件：

| 事件名 | 描述                             |
| ------ | -------------------------------- |
| error  | 当生成二维码过程中发生错误时触发 |

监听错误事件：

```html
<xh-qrcode value="Test" @error="handleError"></xh-qrcode>

<script>
  function handleError(event) {
    console.error('生成二维码失败:', event.detail)
  }
</script>
```
