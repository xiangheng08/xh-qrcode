# @xiangheng08/qrcode

## 简介

一个基于 Web Components 的轻量级二维码生成器，支持纠错码功能。

## 功能特性

- 生成标准二维码
- 支持纠错码级别 (L/M/Q/H)
- 可配置二维码版本 (1-40)
- 可自定义像素大小和颜色
- 支持添加Logo
- 支持遮罩层
- 基于 Lit 的 Web Components 实现

## 使用方法

```html
<xh-qrcode
  value="hello world!"
  version="5"
  errorcorrectionlevel="M"
  pixelsize="10"
  color="#000"
  background="#fff"
  logo="logo.png"
  logoscale="0.2"
  logopadding="0.1"
  mask
>
</xh-qrcode>
```

### 属性说明

| 属性名               | 类型    | 默认值                     | 描述                                  |
| -------------------- | ------- | -------------------------- | ------------------------------------- |
| value                | string  | ''                         | 二维码内容                            |
| version              | number  | undefined                  | 二维码版本 (1-40)                     |
| errorcorrectionlevel | string  | 'M'                        | 纠错码级别 (L/M/Q/H)                  |
| pixelsize            | number  | 4                          | 像素大小                              |
| color                | string  | '#000000'                  | 前景色                                |
| background           | string  | '#ffffff'                  | 背景色                                |
| padding              | number  | undefined                  | 内边距                                |
| size                 | number  | undefined                  | 二维码大小                            |
| logo                 | string  | undefined                  | Logo 图像 URL                         |
| logoscale            | number  | undefined                  | Logo 大小比例 (0-1，相对于二维码大小) |
| logopadding          | number  | 0.1                        | Logo 内边距（0-1，相对于 Logo 大小）  |
| mask                 | boolean | false                      | 是否有遮罩层                          |
| maskcolor            | string  | 'rgba(255, 255, 255, 0.9)' | 遮罩层颜色                            |

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

## 代码来源

[lib/core](https://github.com/xiangheng08/xh-qrcode/tree/HEAD/lib/core) 目录下的代码来源于 https://github.com/soldair/node-qrcode.git，由 https://lingma.aliyun.com/ 转换为 TypeScript 并将其中的注释翻译为中文。

The code in the [lib/core](https://github.com/xiangheng08/xh-qrcode/tree/HEAD/lib/core) directory originates from https://github.com/soldair/node-qrcode.git, converted to TypeScript and translated comments into Chinese by https://lingma.aliyun.com/.
