# 个人名片二维码 (xh-vcard-qrcode)

个人名片二维码组件是在基础二维码的基础上增加了个人信息展示功能，常用于个人联系信息分享。

## 基本用法

```html
<xh-vcard-qrcode value="https://example.com/u/userid" name="张三" avatar="./avatar.jpg">
</xh-vcard-qrcode>
```

## 属性 (Attributes)

除了基础二维码的所有属性外，还支持以下特有属性：

| 属性名           | 类型   | 默认值          | 描述                          |
| ---------------- | ------ | --------------- | ----------------------------- |
| width            | number | 400             | 名片宽度                      |
| paddingTop       | number | 0.135           | 上内边距 (相对于宽度)         |
| paddingBottom    | number | 0.125           | 下内边距 (相对于宽度)         |
| avatar           | string | undefined       | 头像图片 URL                  |
| defaultAvatar    | string | undefined       | 默认头像图片 URL              |
| avatarSize       | number | 0.135           | 头像大小 (相对于宽度)         |
| avatarGap        | number | 0.03            | 头像与名字的间隔 (相对于宽度) |
| avatarRadius     | number | 0.1             | 头像圆角 (相对于头像大小)     |
| name             | string | ''              | 名字                          |
| nameFont         | string | '{0.048}px ...' | 名字字体                      |
| nameColor        | string | '#000000'       | 名字颜色                      |
| nameGap          | number | 0.015           | 名字与描述的间隔              |
| description      | string | undefined       | 描述                          |
| descriptionFont  | string | '{0.03}px ...'  | 描述字体                      |
| descriptionColor | string | '#b4b4b4'       | 描述颜色                      |
| tips             | string | ''              | 提示语                        |
| tipsWidth        | number | 0.8             | 提示语宽度 (相对于宽度)       |
| tipsColor        | string | '#b4b4b4'       | 提示语颜色                    |
| tipsFont         | string | '{0.03}px ...'  | 提示语字体                    |
| qrcodeScale      | number | 0.725           | 二维码所占比例 (相对于宽度)   |

## 示例

### 基本名片二维码

```html
<xh-vcard-qrcode
  value="https://example.com/u/zhangsan"
  name="张三"
  avatar="./avatar.jpg"
  description="前端工程师"
  tips="扫一扫上面的二维码图案，加我为朋友。"
>
</xh-vcard-qrcode>
```

### 自定义样式

```html
<xh-vcard-qrcode
  value="https://example.com/u/zhangsan"
  name="张三"
  avatar="./avatar.jpg"
  description="资深前端工程师"
  tips="欢迎扫描二维码交流合作"
  width="375"
  nameColor="#333333"
  descriptionColor="#666666"
  tipsColor="#999999"
  color="#1296db"
  errorcorrectionlevel="H"
>
</xh-vcard-qrcode>
```

### 不同头像样式

```html
<!-- 圆形头像 -->
<xh-vcard-qrcode
  value="https://example.com/u/zhangsan"
  name="张三"
  avatar="./avatar.jpg"
  avatarRadius="0.5"
>
</xh-vcard-qrcode>

<!-- 方形头像 -->
<xh-vcard-qrcode
  value="https://example.com/u/zhangsan"
  name="张三"
  avatar="./avatar.jpg"
  avatarRadius="0"
>
</xh-vcard-qrcode>
```

## 注意事项

1. 所有与宽度相关的属性都是相对值，实际像素值会根据 [width](#width) 属性计算得出
2. 字体属性中的 `{数字}` 会被替换为实际计算出的像素值
3. 如果设置了 [mask](/components/basic#mask) 属性，遮罩层会覆盖整个名片区域，而不仅仅是二维码区域
