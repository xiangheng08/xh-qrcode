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

## 开发文档

[开发文档](https://xiangheng08.github.io/xh-qrcode/)

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
