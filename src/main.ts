import '../lib/main'
import '../lib/elements/group'
import { drawGroupAvatar } from '../lib/utils/group-avatar'

function test() {
  const el = document.getElementById('test') as HTMLCanvasElement
  el.width = 128 * window.devicePixelRatio
  el.height = 128 * window.devicePixelRatio
  el.style.width = '128px'
  el.style.height = '128px'
  drawGroupAvatar(el, [
    '/src/assets/avatars/1.jpg',
    '/src/assets/avatars/2.jpg',
    '/src/assets/avatars/3.jpg',
    '/src/assets/avatars/4.jpg',
    '/src/assets/avatars/5.jpg',
    '/src/assets/avatars/6.jpg',
    '/src/assets/avatars/7.jpg',
    '/src/assets/avatars/8.jpg',
    '/src/assets/avatars/9.jpg',
  ])
}

setTimeout(test, 100)
