import { drawRoundedRectPath } from '../utils/canvas'
import { isFinderPatternArea } from '../utils/qrcode'
import type { DrawQRCodeConfig } from './types'

function drawQRCode(config: DrawQRCodeConfig) {
  const { symbol, x, y, pixelSize, style, ctx } = config
  const MS = symbol.modules.size
  const SIZE = pixelSize * MS
  const FPS_OUTER = pixelSize * 7
  const FPS_INNER = pixelSize * 3
  const FPS_CENTERS = [
    [x, y],
    [x + SIZE - FPS_OUTER, y],
    [x, y + SIZE - FPS_OUTER],
  ]

  // 设置填充样式
  ctx.fillStyle = style
  ctx.strokeStyle = style

  const HPS = pixelSize / 2
  const PS = pixelSize * 0.05

  // 绘制三个定位点
  for (const [cx, cy] of FPS_CENTERS) {
    drawRoundedRectPath(
      ctx,
      cx + HPS,
      cy + HPS,
      FPS_OUTER - HPS * 2,
      FPS_OUTER - HPS * 2,
      pixelSize * 0.6,
    )
    ctx.lineWidth = pixelSize
    ctx.stroke()
    drawRoundedRectPath(
      ctx,
      cx + pixelSize * 2,
      cy + pixelSize * 2,
      FPS_INNER,
      FPS_INNER,
      pixelSize * 0.4,
    )
    ctx.fill()
  }

  for (let row = 0; row < MS; row++) {
    for (let col = 0; col < MS; col++) {
      if (symbol.modules.get(row, col) && !isFinderPatternArea(row, col, MS)) {
        const px = x + col * pixelSize + PS
        const py = y + row * pixelSize + PS
        drawRoundedRectPath(ctx, px, py, pixelSize - PS * 2, pixelSize - PS * 2, pixelSize * 0.2)
        ctx.fill()
      }
    }
  }
}

export default drawQRCode
