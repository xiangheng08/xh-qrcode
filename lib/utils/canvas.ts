/**
 * 绘制圆角矩形
 */
export function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.arcTo(x + width, y, x + width, y + radius, radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
  ctx.lineTo(x + radius, y + height)
  ctx.arcTo(x, y + height, x, y + height - radius, radius)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
}

/**
 * Canvas 转 Blob
 * @param canvas 需要转换的 HTMLCanvasElement 元素
 * @param type MIME 类型（如 'image/png', 'image/jpeg' 等）
 * @param quality 图像质量，取值范围 0-1
 * @example
 * const blob = await canvasToBlob(canvas, 'image/png', 0.8)
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type?: string,
  quality?: number,
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('canvas to blob error'))
        }
      },
      type,
      quality,
    )
  })
}
