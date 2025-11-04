import '../lib/main'
import '../lib/elements/group'
import { generateGroupAvatar } from '../lib/utils/group-avatar'

async function appendGroupAvatars() {
  const container = document.querySelector('.example-group-avatar') as HTMLElement
  const size = 80

  const avatars = Array(15)
    .fill('')
    .map((_, i) => `/src/assets/avatars/${i + 1}.jpg`)

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
    container.appendChild(canvas)
  }
}

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

appendGroupAvatars()
