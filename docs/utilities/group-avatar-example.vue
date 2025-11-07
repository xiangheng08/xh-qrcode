<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { generateGroupAvatar } from '@xiangheng08/qrcode/utils'

const containerRef = ref<HTMLDivElement>()
const size = 80
const avatars = Array(15)
  .fill('')
  .map((_, i) => `../images/avatars/${i + 1}.jpg`)

onMounted(async () => {
  if (!containerRef.value) return
  for (let i = 0; i < 9; i++) {
    const _avatars: string[] = []
    while (_avatars.length < i + 1) {
      const v = avatars[random(0, avatars.length - 1)]
      // 避免重复
      if (_avatars.includes(v)) continue
      _avatars.push(v)
    }

    const canvas = await generateGroupAvatar(_avatars, size * window.devicePixelRatio, {
      type: 'canvas',
    })
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    containerRef.value.appendChild(canvas)
  }
})

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
</script>

<template>
  <div class="container" style="display: flex; gap: 16px; flex-wrap: wrap" ref="containerRef"></div>
</template>
