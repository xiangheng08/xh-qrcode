<script setup>
import GroupAvatarExample from './group-avatar-example.vue'
</script>

# 群头像生成工具

群头像生成工具是一个独立的工具函数，用于生成包含多个头像的群组头像图片。这个工具被 [xh-group-qrcode](/components/group) 组件内部使用，但也可以独立使用。

<GroupAvatarExample />

## 使用方法

```js
import { generateGroupAvatar } from '@xiangheng08/qrcode/utils'

const avatarUrls = ['avatar1.jpg', 'avatar2.jpg', 'avatar3.jpg', 'avatar4.jpg']

generateGroupAvatar(avatarUrls, 200, { type: 'canvas' })
  .then((canvas) => {
    // 使用生成的 canvas
    document.body.appendChild(canvas)
  })
  .catch((error) => {
    console.error('生成群头像失败:', error)
  })
```

## 参数说明

### avatarUrls

类型: `string[]`

头像图片的 URL 数组。支持最多 9 个头像。

### options

| 属性          | 类型                                 | 默认值      | 描述                                  |
| ------------- | ------------------------------------ | ----------- | ------------------------------------- |
| type          | `canvas/dataURL/blob/file`           | `'file'`    | 生成的头像图片类型。                  |
| defaultAvatar | `string/HTMLImageElement`            |             | 默认头像                              |
| background    | `string`                             | `'#dddddd'` | 背景颜色                              |
| fit           | `cover/contain/fill/none/scale-down` | `'cover'`   | 图片适应方式                          |
| radius        | `number`                             | `0.072`     | 头像圆角半径（0-1，相对于头像大小）   |
| gap           | `number`                             | `0.035`     | 头像之间的间隔（0-1，相对于头像大小） |
| padding       | `number`                             | `0.04`      | 内边距（0-1，相对于头像大小）         |
| defaultAvatar | `string`                             | `undefined` | 默认头像 URL                          |

## 图片适应方式

- `cover`: 保持宽高比，缩放图片以完全覆盖容器
- `contain`: 保持宽高比，缩放图片以完整显示在容器内
- `fill`: 拉伸图片以完全填充容器

与 [`object-fit`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference/Properties/object-fit) 行为一致

## 示例

### 基本使用

```js
import { generateGroupAvatar } from '@xiangheng08/qrcode/utils'

const avatarUrls = ['avatar1.jpg', 'avatar2.jpg', 'avatar3.jpg']

const file = await generateGroupAvatar(avatarUrls, 100)

console.log(file)
```

### 在 React 中使用

```jsx
import { useState, useEffect } from 'react'
import { generateGroupAvatar } from '@xiangheng08/qrcode/utils'

function GroupAvatar({ avatarUrls }) {
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    generateGroupAvatar(avatarUrls, 100, { type: 'dataURL' })
      .then((dataURL) => {
        setAvatarUrl(dataURL)
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
import { generateGroupAvatar } from '@xiangheng08/qrcode/utils'

const props = defineProps({
  avatarUrls: Array,
})

const avatarUrl = ref('')

watch(
  () => props.avatarUrls,
  (newUrls) => {
    if (newUrls && newUrls.length > 0) {
      generateGroupAvatar(newUrls, 100, { type: 'blob' })
        .then((blob) => {
          if (avatarUrl.value) {
            // 释放内存
            URL.revokeObjectURL(avatarUrl.value)
          }
          avatarUrl.value = URL.createObjectURL(blob)
        })
        .catch((error) => {
          console.error('生成群头像失败:', error)
        })
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  // 释放内存
  URL.revokeObjectURL(avatarUrl.value)
})
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
  const canvas = await generateGroupAvatar(avatarUrls, options)
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
