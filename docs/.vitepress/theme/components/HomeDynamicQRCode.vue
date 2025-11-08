<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const steps: Record<string, any>[] = [
  { errorcorrectionlevel: 'Q' },
  { errorcorrectionlevel: 'H' },
  { errorcorrectionlevel: 'H', shape: 'circle' },
  { errorcorrectionlevel: 'H', shape: 'round' },
  // { errorcorrectionlevel: 'H', mask: true },
  { errorcorrectionlevel: 'H', color: '#1E90FF', background: '#F0F8FF' },
  { errorcorrectionlevel: 'H', color: '#228B22', background: '#F5FFFA' },
  { errorcorrectionlevel: 'H', color: '#8A2BE2', background: '#F8F8FF' },
  { errorcorrectionlevel: 'H', color: '#DC143C', background: '#FFE4E1' },
  { errorcorrectionlevel: 'H', color: '#2F4F4F', background: '#F5F5F5' },
  { errorcorrectionlevel: 'H', color: '#008B8B', background: '#E0FFFF' },
  { errorcorrectionlevel: 'H', color: '#000000', background: '#ffffff', logo: './images/vite.svg' },
]

const index = ref(0)
let ms = 300
let timer: ReturnType<typeof setTimeout>

const next = () => {
  timer = setTimeout(() => {
    index.value++
    ms -= 15
    if (index.value < steps.length - 1) {
      next()
    }
  }, ms)
}

onMounted(() => {
  next()
})

onUnmounted(() => {
  clearTimeout(timer)
})
</script>

<template>
  <teleport to=".image .image-container" defer>
    <div class="VPImage image-src qrcode-container">
      <xh-qrcode value="https://github.com/xiangheng08" size="320" v-bind="steps[index]" />
    </div>
  </teleport>
</template>

<style scoped>
.qrcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
