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

| 属性名               | 类型      | 默认值                       | 描述                                  |
| -------------------- | --------- | ---------------------------- | ------------------------------------- |
| value                | `string`  | `''`                         | 二维码内容                            |
| version              | `number`  | `undefined`                  | 二维码版本 (1-40)                     |
| errorcorrectionlevel | `string`  | `'M'`                        | 纠错码级别 (L/M/Q/H)                  |
| pixelsize            | `number`  | `4`                          | 像素大小                              |
| color                | `string`  | `'#000000'`                  | 前景色                                |
| background           | `string`  | `'#ffffff'`                  | 背景色                                |
| padding              | `number`  | `undefined`                  | 内边距                                |
| size                 | `number`  | `undefined`                  | 二维码大小                            |
| logo                 | `string`  | `undefined`                  | Logo 图像 URL                         |
| logoscale            | `number`  | `undefined`                  | Logo 大小比例 (0-1，相对于二维码大小) |
| logopadding          | `number`  | `0.1 `                       | Logo 内边距（0-1，相对于 Logo 大小）  |
| mask                 | `boolean` | `false`                      | 是否有遮罩层                          |
| maskcolor            | `string`  | `'rgba(255, 255, 255, 0.9)`' | 遮罩层颜色                            |

### 纠错码级别说明

- **L** (Low) - 约可纠错 7% 的数据码字
- **M** (Medium) - 约可纠错 15% 的数据码字
- **Q** (Quartile) - 约可纠错 25% 的数据码字
- **H** (High) - 约可纠错 30% 的数据码字

### 二维码版本说明

二维码共有 40 个版本，从版本 1 到版本 40。每个版本的尺寸不同，版本越高，能存储的数据越多。

- **版本范围**: 1-40
- **版本 1 尺寸**: 21×21 模块
- **版本 40 尺寸**: 177×177 模块
- **尺寸计算公式**: (版本号 × 4 + 17) × (版本号 × 4 + 17)

如果不指定版本号，系统会根据要编码的数据量和纠错级别自动选择合适的版本。当手动指定版本时，需要确保所选版本能够容纳要编码的数据量，否则会抛出异常。

各版本的主要区别：

| 版本 | 尺寸 (模块) | 存储容量 (Byte模式)                                           |
| ---- | ----------- | ------------------------------------------------------------- |
| 1    | 21×21       | 17 字节 (L) / 7 字节 (M) / 11 字节 (Q) / 7 字节 (H)           |
| 2    | 25×25       | 32 字节 (L) / 20 字节 (M) / 26 字节 (Q) / 14 字节 (H)         |
| 3    | 29×29       | 53 字节 (L) / 32 字节 (M) / 42 字节 (Q) / 24 字节 (H)         |
| 4    | 33×33       | 78 字节 (L) / 48 字节 (M) / 62 字节 (Q) / 36 字节 (H)         |
| ...  | ...         | ...                                                           |
| 40   | 177×177     | 2953 字节 (L) / 2331 字节 (M) / 1663 字节 (Q) / 1273 字节 (H) |

注：存储容量因纠错级别而异，纠错级别越高，可用于存储用户数据的空间越少。

## 构建

```bash
npm run build
```

## 开发

```bash
npm run dev
```

## 来源声明

### 代码来源

[lib/core](https://github.com/xiangheng08/xh-qrcode/tree/HEAD/lib/core) 目录下的代码来源于 [node-qrcode](https://github.com/soldair/node-qrcode.git)，由 [lingma](https://lingma.aliyun.com/) 转换为 TypeScript 并将其中的注释翻译为中文。

The code in the [lib/core](https://github.com/xiangheng08/xh-qrcode/tree/HEAD/lib/core) directory originates from [node-qrcode](https://github.com/soldair/node-qrcode.git), converted to TypeScript and translated comments into Chinese by [lingma](https://lingma.aliyun.com/).

### Avatars

[src/assets/avatars](https://github.com/xiangheng08/xh-qrcode/tree/HEAD/src/assets/avatars) 目录下的头像来源于[头像库](https://www.tuxiangyan.com/)。

[src/assets/avatars](https://github.com/xiangheng08/xh-qrcode/tree/HEAD/src/assets/avatars) 目录下的头像仅用于学习/展示，本项目不将其用于商业用途。其他使用者请注意：从本仓库获取的这些头像请勿随意使用，若因此造成任何法律风险与本项目和[本项目作者](https://github.com/xiangheng08)无关。
