# @xiangheng08/qrcode

## 简介

一个基于 Web Components 的轻量级二维码生成器，支持纠错码功能。

## 功能特性

- 生成标准二维码
- 支持纠错码级别 (L/M/Q/H)
- 可配置二维码版本 (1-40)
- 可自定义像素大小和颜色
- 基于 Lit 的 Web Components 实现

## 使用方法

```html
<xh-qrcode 
  value="hello world!" 
  version="5" 
  error-correction-level="M"
  pixelSize="10" 
  color="#000" 
  background="#fff">
</xh-qrcode>
```

### 属性说明

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| value | string | '' | 二维码内容 |
| version | number | 1 | 二维码版本 (1-40) |
| errorCorrectionLevel | string | 'M' | 纠错码级别 (L/M/Q/H) |
| pixelsize | number | 4 | 像素大小 |
| color | string | '#000000' | 前景色 |
| background | string | '#ffffff' | 背景色 |

### 纠错码级别说明

- **L** (Low) - 约可纠错 7% 的数据码字
- **M** (Medium) - 约可纠错 15% 的数据码字
- **Q** (Quartile) - 约可纠错 25% 的数据码字
- **H** (High) - 约可纠错 30% 的数据码字

## 构建

```bash
npm run build
```

## 开发

```bash
npm run dev
```