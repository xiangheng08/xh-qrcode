# 群二维码 (xh-group-qrcode)

群二维码组件用于为群聊生成带有群头像和群名称的二维码，支持单个头像和多个头像组合。

## 基本用法

### 单个群头像

```html
<xh-group-qrcode
  value="https://github.com/xiangheng08"
  groupName="技术交流群"
  groupAvatar="/images/avatars/2.jpg"
  tips="扫一扫二维码，加入群聊。"
  errorcorrectionlevel="H"
  shape="round"
  logo="/images/vite.svg"
/>
```

<xh-group-qrcode
  value="https://github.com/xiangheng08"
  groupName="技术交流群"
  groupAvatar="../images/avatars/2.jpg"
  tips="扫一扫二维码，加入群聊。"
  errorcorrectionlevel="H"
  shape="round"
  logo="/images/vite.svg"
/>

### 多个群头像

```html
<xh-group-qrcode
  value="https://github.com/xiangheng08"
  groupName="技术交流群"
  groupAvatars='["/images/avatars/1.jpg", "/images/avatars/2.jpg", "/images/avatars/3.jpg", "/images/avatars/4.jpg", "/images/avatars/5.jpg", "/images/avatars/6.jpg", "/images/avatars/7.jpg", "/images/avatars/8.jpg", "/images/avatars/9.jpg"]'
  tips="扫一扫二维码，加入群聊。"
  errorcorrectionlevel="H"
  shape="round"
  logo="/images/vite.svg"
/>
```

<xh-group-qrcode
  value="https://github.com/xiangheng08"
  groupName="技术交流群"
  groupAvatars='["../images/avatars/1.jpg", "../images/avatars/2.jpg", "../images/avatars/3.jpg", "../images/avatars/4.jpg", "../images/avatars/5.jpg", "../images/avatars/6.jpg", "../images/avatars/7.jpg", "../images/avatars/8.jpg", "../images/avatars/9.jpg"]'
  tips="扫一扫二维码，加入群聊。"
  errorcorrectionlevel="H"
  shape="round"
  logo="../images/vite.svg"
/>

## 属性 (Attributes)

除了基础二维码的所有属性外，还支持以下特有属性：

| 属性名                | 类型       | 默认值            | 描述                                    |
| --------------------- | ---------- | ----------------- | --------------------------------------- |
| width                 | `number`   | `400`             | 群二维码宽度                            |
| paddingTop            | `number`   | `0.146`           | 上内边距 (相对于宽度)                   |
| paddingBottom         | `number`   | `0.125`           | 下内边距 (相对于宽度)                   |
| groupAvatar           | `string`   | `undefined`       | 群头像图片 URL                          |
| groupAvatars          | `string[]` | `undefined`       | 群头像数组 (会被 groupAvatar 覆盖)      |
| groupAvatarSize       | `number`   | `0.16`            | 群头像大小 (相对于宽度)                 |
| defaultGroupAvatar    | `string`   | `undefined`       | 默认群头像 (仅对 groupAvatars 生效)     |
| groupAvatarBackground | `string`   | `'#dddddd'`       | 群头像背景色 (仅对 groupAvatars 生效)   |
| groupAvatarFit        | `string`   | `'cover'`         | 群头像适应方式 (仅对 groupAvatars 生效) |
| groupAvatarRadius     | `number`   | `0.072`           | 群头像圆角 (相对于头像大小)             |
| groupAvatarGap        | `number`   | `0.035`           | 群头像间隔 (相对于头像大小)             |
| groupAvatarPadding    | `number`   | `0.04`            | 群头像内边距 (相对于头像大小)           |
| groupName             | `string`   | `''`              | 群名称                                  |
| groupNameFont         | `string`   | `'{0.048}px ...'` | 群名称字体                              |
| groupNameColor        | `string`   | `'#000000'`       | 群名称颜色                              |
| groupNameWidth        | `number`   | `0.63`            | 群名称宽度 (相对于宽度)                 |
| tips                  | `string`   | `''`              | 提示语                                  |
| tipsWidth             | `number`   | `0.8`             | 提示语宽度 (相对于宽度)                 |
| tipsColor             | `string`   | `'#b4b4b4'`       | 提示语颜色                              |
| tipsFont              | `string`   | `'{0.03}px ...'`  | 提示语字体                              |
| qrcodeScale           | `number`   | `0.725`           | 二维码所占比例 (相对于宽度)             |

## 示例

### 基本群二维码

```html
<xh-group-qrcode
  value="https://github.com/xiangheng08"
  groupName="技术交流群"
  groupAvatar="/images/vite.svg"
  tips="扫一扫上面的二维码图案，加入群聊。"
/>
```

<xh-group-qrcode
  value="https://github.com/xiangheng08"
  groupName="技术交流群"
  groupAvatar="../images/vite.svg"
  tips="扫一扫上面的二维码图案，加入群聊。"
/>

### 多头像群二维码

```html
<xh-group-qrcode
  value="https://github.com/xiangheng08"
  groupName="技术交流群"
  .groupAvatars='["/images/avatars/1.jpg","/images/avatars/2.jpg","/images/avatars/3.jpg","/images/avatars/4.jpg"]'
  defaultGroupAvatar="/images/vite.svg"
  tips="扫一扫上面的二维码图案，加入群聊。"
/>
```

<xh-group-qrcode
value="https://github.com/xiangheng08"
groupName="技术交流群"
.groupAvatars='["../images/avatars/1.jpg","../images/avatars/2.jpg","../images/avatars/3.jpg","../images/avatars/4.jpg"]'
defaultGroupAvatar="../images/vite.svg"
tips="扫一扫上面的二维码图案，加入群聊。"
/>

### 自定义样式

```html
<xh-group-qrcode
  value="https://github.com/xiangheng08"
  groupName="技术交流群"
  groupAvatar="/images/vite.svg"
  tips="欢迎加入我们的技术交流群"
  width="375"
  groupNameColor="#333333"
  tipsColor="#999999"
  groupAvatarRadius="0.2"
  color="#1296db"
  errorcorrectionlevel="H"
/>
```

<xh-group-qrcode
  value="https://github.com/xiangheng08"
  groupName="技术交流群"
  groupAvatar="../images/vite.svg"
  tips="欢迎加入我们的技术交流群"
  width="375"
  groupNameColor="#333333"
  tipsColor="#999999"
  groupAvatarRadius="0.2"
  color="#1296db"
  errorcorrectionlevel="H"
/>

## 群头像组合规则

请查看 [groupAvatars](/utilities/group-avatar)

## 注意事项

1. 所有与宽度相关的属性都是相对值，实际像素值会根据 [width](#width) 属性计算得出
2. 字体属性中的 `{数字}` 会被替换为实际计算出的像素值
3. 如果同时设置了 [groupAvatar](#groupavatar) 和 [groupAvatars](#groupavatars)，[groupAvatar](#groupavatar) 优先级更高
4. 在 React 中使用 [groupAvatars](#groupavatars) 属性时，需要使用 `.groupAvatars` 语法传递数组
