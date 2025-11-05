import { isFinderPatternArea } from '../utils/qrcode'
import type { DrawQRCodeConfig } from './types'

function drawQRCode(config: DrawQRCodeConfig) {
  const { symbol, x, y, pixelSize, style, ctx } = config
  const MS = symbol.modules.size
  const SIZE = pixelSize * MS
  const FPS_OUTER = pixelSize * 7
  const FPS_INNER = pixelSize * 3
  const FPS_RADIUS = pixelSize * 3.5
  const FPS_CENTERS = [
    [x + FPS_RADIUS, y + FPS_RADIUS],
    [x + SIZE - FPS_RADIUS, y + FPS_RADIUS],
    [x + FPS_RADIUS, y + SIZE - FPS_RADIUS],
  ]

  // 设置填充样式
  ctx.fillStyle = style

  // 绘制三个定位点
  for (const [cx, cy] of FPS_CENTERS) {
    // 绘制外圈
    ctx.beginPath()
    ctx.arc(cx, cy, FPS_OUTER / 2, 0, Math.PI * 2)

    // 绘制内圈（形成圆环效果）
    ctx.arc(cx, cy, (FPS_OUTER - pixelSize * 2) / 2, 0, Math.PI * 2, true)

    ctx.fill()

    // 绘制内圆
    ctx.beginPath()
    ctx.arc(cx, cy, FPS_INNER / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  for (let row = 0; row < MS; row++) {
    for (let col = 0; col < MS; col++) {
      if (symbol.modules.get(row, col) && !isFinderPatternArea(row, col, MS)) {
        const px = x + col * pixelSize + pixelSize / 2
        const py = y + row * pixelSize + pixelSize / 2
        ctx.beginPath()
        ctx.arc(px, py, pixelSize / 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
}

export default drawQRCode
