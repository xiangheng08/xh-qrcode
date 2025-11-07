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
- 支持群二维码（xh-group-qrcode）
- 支持个人名片二维码（xh-vcard-qrcode）

## 使用方法

### 标准二维码

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

### 群二维码

```html
<xh-group-qrcode
  value="群聊邀请链接"
  width="400"
  groupavatarmode="grid"
  groupavatar="group-avatar.jpg"
  groupname="技术交流群"
  tips="扫描二维码加入群聊"
>
</xh-group-qrcode>
```

### 个人名片二维码

```html
<xh-vcard-qrcode
  value="联系方式"
  width="400"
  avatar="avatar.jpg"
  name="张三"
  description="前端工程师"
  tips="扫描二维码查看联系方式"
>
</xh-vcard-qrcode>
```

### 属性说明

#### xh-qrcode 属性

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
| maskcolor            | `string`  | `'rgba(255, 255, 255, 0.9)'` | 遮罩层颜色                            |

#### xh-group-qrcode 属性

| 属性名                | 类型       | 默认值                                                                                                                                                      | 描述                                                          |
| --------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| value                 | `string`   | `''`                                                                                                                                                        | 二维码内容                                                    |
| width                 | `number`   | `400`                                                                                                                                                       | 群二维码宽度                                                  |
| paddingTop            | `number`   | `0.146`                                                                                                                                                     | 上内边距（0-1，相对于宽度）                                   |
| paddingBottom         | `number`   | `0.125`                                                                                                                                                     | 下内边距（0-1，相对于宽度）                                   |
| groupAvatar           | `string`   | `undefined`                                                                                                                                                 | 群头像                                                        |
| groupAvatars          | `string[]` | `undefined`                                                                                                                                                 | 群头像数组（会被[groupAvatar]覆盖）                           |
| groupAvatarSize       | `number`   | `0.16`                                                                                                                                                      | 群头像大小（0-1，相对于宽度）                                 |
| defaultGroupAvatar    | `string`   | `undefined`                                                                                                                                                 | 默认群头像（仅对[groupAvatars]生效）                          |
| groupAvatarBackground | `string`   | `'#dddddd'`                                                                                                                                                 | 群头像背景色（仅对[groupAvatars]生效）                        |
| groupAvatarFit        | `Fit`      | `'cover'`                                                                                                                                                   | 群头像的每个头像如何适应容器（仅对[groupAvatars]生效）        |
| groupAvatarRadius     | `number`   | `0.072`                                                                                                                                                     | 群头像圆角（0-1，相对于头像大小）                             |
| groupAvatarGap        | `number`   | `0.035`                                                                                                                                                     | 群头像的每个头像的间隔（0-1，相对于头像大小）                 |
| groupAvatarPadding    | `number`   | `0.04`                                                                                                                                                      | 群头像的内边距（0-1，相对于头像大小）                         |
| groupName             | `string`   | `''`                                                                                                                                                        | 群名称                                                        |
| groupNameFont         | `string`   | `'{0.048}px "Punctuation SC", "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'` | 群名称字体，其中 `{0.048}` 为宽度占位符，表示 `width * 0.048` |
| groupNameColor        | `string`   | `'#000000'`                                                                                                                                                 | 群名称颜色                                                    |
| groupNameWidth        | `number`   | `0.63`                                                                                                                                                      | 群名称宽度（0-1，相对于宽度）                                 |
| tips                  | `string`   | `''`                                                                                                                                                        | 提示语                                                        |
| tipsWidth             | `number`   | `0.8`                                                                                                                                                       | 提示语宽度（0-1，相对于宽度）                                 |
| tipsColor             | `string`   | `'#b4b4b4'`                                                                                                                                                 | 提示语颜色                                                    |
| tipsFont              | `string`   | `'{0.03}px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", "Helvetica Neue", Helvetica, Arial, sans-serif'`                    | 提示语字体，其中 `{0.03}` 为宽度占位符，表示 `width * 0.03`   |
| qrcodeScale           | `number`   | `0.63`                                                                                                                                                      | 二维码所占比例（0-1，相对于宽度）                             |

#### xh-vcard-qrcode 属性

| 属性名           | 类型     | 默认值                                                                                                                                                      | 描述                                                        |
| ---------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| value            | `string` | `''`                                                                                                                                                        | 二维码内容                                                  |
| width            | `number` | `400`                                                                                                                                                       | 名片宽度                                                    |
| paddingTop       | `number` | `0.135`                                                                                                                                                     | 上内边距（0-1，相对于宽度）                                 |
| paddingBottom    | `number` | `0.125`                                                                                                                                                     | 下内边距（0-1，相对于宽度）                                 |
| avatar           | `string` | `undefined`                                                                                                                                                 | 头像                                                        |
| defaultAvatar    | `string` | `undefined`                                                                                                                                                 | 默认头像                                                    |
| avatarSize       | `number` | `0.135`                                                                                                                                                     | 头像大小（0-1，相对于宽度）                                 |
| avatarGap        | `number` | `0.03`                                                                                                                                                      | 头像与名字的间隔（0-1，相对于宽度）                         |
| avatarRadius     | `number` | `0.1`                                                                                                                                                       | 头像圆角（0-1，相对于头像大小）                             |
| name             | `string` | `''`                                                                                                                                                        | 名字                                                        |
| nameFont         | `string` | `'{0.048}px "Punctuation SC", "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'` | 名字字体，其中 `{0.048}` 为宽度占位符，表示 `width * 0.048` |
| nameColor        | `string` | `'#000000'`                                                                                                                                                 | 名字颜色                                                    |
| nameGap          | `number` | `0.015`                                                                                                                                                     | 名字与下方描述的间隔                                        |
| description      | `string` | `undefined`                                                                                                                                                 | 描述                                                        |
| descriptionFont  | `string` | `'{0.03}px "Punctuation SC", "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'`  | 描述字体，其中 `{0.03}` 为宽度占位符，表示 `width * 0.03`   |
| descriptionColor | `string` | `'#b4b4b4'`                                                                                                                                                 | 描述颜色                                                    |
| tips             | `string` | `''`                                                                                                                                                        | 提示语                                                      |
| tipsWidth        | `number` | `0.8`                                                                                                                                                       | 提示语宽度（0-1，相对于宽度）                               |
| tipsColor        | `string` | `'#b4b4b4'`                                                                                                                                                 | 提示语颜色                                                  |
| tipsFont         | `string` | `'{0.03}px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", "Helvetica Neue", Helvetica, Arial, sans-serif'`                    | 提示语字体，其中 `{0.03}` 为宽度占位符，表示 `width * 0.03` |
| qrcodeScale      | `number` | `0.725`                                                                                                                                                     | 二维码所占比例（0-1，相对于宽度）                           |

### 方法介绍

所有二维码组件都提供了以下方法用于获取二维码图像：

#### `toDataURL()`

返回二维码的 dataURL，可以直接用于 img 标签的 src 属性。

```javascript
const qrcode = document.querySelector('xh-qrcode')
const dataURL = qrcode.toDataURL()
// 或指定格式
const pngDataURL = qrcode.toDataURL('image/png')
const jpegDataURL = qrcode.toDataURL('image/jpeg')
```

#### `toBlob(type, quality)`

返回二维码的 Blob 对象，可用于文件上传或下载。

参数:

- `type` (可选): MIME类型，默认为 'image/png'
- `quality` (可选): 图像质量，0-1之间的数字，仅对 'image/jpeg' 或 'image/webp' 有效

```javascript
const qrcode = document.querySelector('xh-qrcode')
qrcode.toBlob().then((blob) => {
  // 使用 blob 对象
  const url = URL.createObjectURL(blob)
  // ...
})

// 指定格式和质量
qrcode.toBlob('image/jpeg', 0.8).then((blob) => {
  // 使用 JPEG 格式的 blob 对象
})
```

#### `toFile(filename, type, quality)`

返回二维码的 File 对象，可用于文件上传。

参数:

- `filename` (可选): 文件名，默认为 'qrcode.png'
- `type` (可选): MIME类型
- `quality` (可选): 图像质量，0-1之间的数字

```javascript
const qrcode = document.querySelector('xh-qrcode')
qrcode.toFile().then((file) => {
  // 使用 file 对象
  console.log(file.name) // qrcode.png
})

// 自定义文件名
qrcode.toFile('my-qrcode.jpg', 'image/jpeg', 0.9).then((file) => {
  console.log(file.name) // my-qrcode.jpg
})
```

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

[lib/core](https://github.com/xiangheng08/xh-qrcode/tree/HEAD/lib/core) 目录下的代码来源于 [node-qrcode](https://github.com/soldair/node-qrcode.git)（[获取时的提交版本](https://github.com/soldair/node-qrcode/commit/3848ed2c17de5bcdead487417dbf14c5dd017f8d)），由 [lingma](https://lingma.aliyun.com/) 转换为 TypeScript 并将其中的注释翻译为中文。

The code in the [lib/core](https://github.com/xiangheng08/xh-qrcode/tree/HEAD/lib/core) directory originates from [node-qrcode](https://github.com/soldair/node-qrcode.git) ([commit at the time of acquisition](https://github.com/soldair/node-qrcode/commit/3848ed2c17de5bcdead487417dbf14c5dd017f8d)), converted to TypeScript and translated comments into Chinese by [lingma](https://lingma.aliyun.com/).

### Avatars

[src/assets/avatars](https://github.com/xiangheng08/xh-qrcode/tree/HEAD/src/assets/avatars)、[docs/public/images/avatars](https://github.com/xiangheng08/xh-qrcode/tree/HEAD/docs/public/images/avatars) 目录下的头像来源于[头像库](https://www.tuxiangyan.com/)。

[src/assets/avatars](https://github.com/xiangheng08/xh-qrcode/tree/HEAD/src/assets/avatars)、[docs/public/images/avatars](https://github.com/xiangheng08/xh-qrcode/tree/HEAD/docs/public/images/avatars) 目录下的头像仅用于学习/展示，本项目不将其用于商业用途。其他使用者请注意：从本仓库获取的这些头像请勿随意使用，若因此造成任何法律风险与本项目和[本项目作者](https://github.com/xiangheng08)无关。
