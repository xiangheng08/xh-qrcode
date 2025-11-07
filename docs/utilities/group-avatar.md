# 群头像生成工具

群头像生成工具是一个独立的工具函数，用于生成包含多个头像的群组头像图片。这个工具被 [xh-group-qrcode](/components/group) 组件内部使用，但也可以独立使用。

## 安装

群头像生成工具包含在 [@xiangheng08/qrcode](https://github.com/xiangheng08/xh-qrcode) 包中：

```bash
npm install @xiangheng08/qrcode
```

## 使用方法

### 导入工具

```js
import { drawGroupAvatar } from '@xiangheng08/qrcode/utils'
```

### 基本用法

```js
import { drawGroupAvatar } from '@xiangheng08/qrcode/utils'

const avatarUrls = ['avatar1.jpg', 'avatar2.jpg', 'avatar3.jpg', 'avatar4.jpg']

const options = {
  size: 200,
  gap: 2,
  padding: 4,
  radius: 10,
  background: '#dddddd',
  fit: 'cover',
}

drawGroupAvatar(avatarUrls, options)
  .then((canvas) => {
    // 使用生成的 canvas
    document.body.appendChild(canvas)

    // 或者转换为 data URL
    const dataUrl = canvas.toDataURL()
    console.log(dataUrl)
  })
  .catch((error) => {
    console.error('生成群头像失败:', error)
  })
```

## 参数说明

### avatarUrls

类型: `string[]`

头像图片的 URL 数组。支持最多 4 个头像。

### options

| 属性          | 类型   | 默认值    | 描述                                      |
| ------------- | ------ | --------- | ----------------------------------------- |
| size          | number | 200       | 生成的头像画布大小（像素）                |
| gap           | number | 0         | 头像之间的间隔（像素）                    |
| padding       | number | 0         | 内边距（像素）                            |
| radius        | number | 0         | 头像圆角半径（像素）                      |
| background    | string | '#dddddd' | 背景颜色                                  |
| fit           | string | 'cover'   | 图片适应方式 ('cover', 'contain', 'fill') |
| defaultAvatar | string | undefined | 默认头像 URL                              |

## 图片适应方式

- `cover`: 保持宽高比，缩放图片以完全覆盖容器
- `contain`: 保持宽高比，缩放图片以完整显示在容器内
- `fill`: 拉伸图片以完全填充容器

## 组合规则

头像组合遵循以下规则：

1. **1个头像**：居中显示完整头像
2. **2个头像**：水平排列，各占50%空间
3. **3个头像**：上方一个，下方两个的三角形排列
4. **4个头像**：2x2网格排列
5. **更多头像**：只显示前4个，按2x2网格排列

## 示例

### 基本使用

```js
import { drawGroupAvatar } from '@xiangheng08/qrcode/utils'

const canvas = await drawGroupAvatar(['avatar1.jpg', 'avatar2.jpg', 'avatar3.jpg'], {
  size: 100,
  gap: 2,
  padding: 4,
  radius: 8,
  background: '#f0f0f0',
})
```

### 在 React 中使用

```jsx
import { useState, useEffect } from 'react'
import { drawGroupAvatar } from '@xiangheng08/qrcode/utils'

function GroupAvatar({ avatarUrls }) {
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    drawGroupAvatar(avatarUrls, { size: 100 })
      .then((canvas) => {
        setAvatarUrl(canvas.toDataURL())
      })
      .catch((error) => {
        console.error('生成群头像失败:', error)
      })
  }, [avatarUrls])

  return avatarUrl ? <img src={avatarUrl} alt="Group Avatar" /> : <div>加载中...</div>
}
```

### 在 Vue 中使用

```vue
<template>
  <img v-if="avatarUrl" :src="avatarUrl" alt="Group Avatar" />
  <div v-else>加载中...</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { drawGroupAvatar } from '@xiangheng08/qrcode/utils'

const props = defineProps({
  avatarUrls: Array,
})

const avatarUrl = ref('')

watch(
  () => props.avatarUrls,
  (newUrls) => {
    if (newUrls && newUrls.length > 0) {
      drawGroupAvatar(newUrls, { size: 100 })
        .then((canvas) => {
          avatarUrl.value = canvas.toDataURL()
        })
        .catch((error) => {
          console.error('生成群头像失败:', error)
        })
    }
  },
  { immediate: true },
)
</script>
```

## 错误处理

工具函数可能抛出以下错误：

1. 网络错误：头像图片加载失败
2. 图片解码错误：图片格式不支持或已损坏
3. 参数错误：传入的参数不符合要求

建议始终使用 try/catch 或 Promise.catch 处理可能的错误：

```js
try {
  const canvas = await drawGroupAvatar(avatarUrls, options)
  // 处理成功结果
} catch (error) {
  // 处理错误情况
  console.error('生成群头像失败:', error.message)
}
```

## 浏览器兼容性

工具使用了以下现代浏览器 API：

- Canvas API
- async/await
- Promise
- fetch API

确保目标浏览器支持这些特性，或使用相应的 polyfill。
