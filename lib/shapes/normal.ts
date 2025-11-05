import type BitMatrix from '../core/bit-matrix'
import type { DrawQRCodeConfig } from './types'

type Modules = { row: number; col: number }[]

function drawQRCode(config: DrawQRCodeConfig) {
  const { symbol, x, y, pixelSize, style, ctx } = config
  const MS = symbol.modules.size

  // 创建一个二维数组来标记已处理的模块
  const processed: boolean[][] = Array(MS)
  for (let i = 0; i < MS; i++) {
    processed[i] = Array(MS).fill(false)
  }

  // 绘制二维码
  ctx.fillStyle = style
  for (let row = 0; row < MS; row++) {
    for (let col = 0; col < MS; col++) {
      // 如果模块为黑色且未被处理过
      if (symbol.modules.get(row, col) && !processed[row][col]) {
        // 使用 flood fill 算法找到所有相连的模块
        const connectedModules = findConnectedModules(symbol.modules, processed, row, col, MS)

        // 为这些连接的模块创建路径并绘制
        drawConnectedModules(connectedModules, x, y, pixelSize, ctx)
      }
    }
  }
}

/**
 * 使用 flood fill 算法查找连接的模块
 */
function findConnectedModules(
  modules: BitMatrix,
  processed: boolean[][],
  startRow: number,
  startCol: number,
  matrixSize: number,
): Modules {
  const connected: Array<{ row: number; col: number }> = []
  const queue: Array<{ row: number; col: number }> = [{ row: startRow, col: startCol }]
  processed[startRow][startCol] = true

  // 四个方向：上、右、下、左
  const directions = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ]

  while (queue.length > 0) {
    const { row, col } = queue.shift()!
    connected.push({ row, col })

    // 检查四个方向的邻居
    for (const [dr, dc] of directions) {
      const newRow = row + dr
      const newCol = col + dc

      // 检查边界和条件
      if (
        newRow >= 0 &&
        newRow < matrixSize &&
        newCol >= 0 &&
        newCol < matrixSize &&
        modules.get(newRow, newCol) &&
        !processed[newRow][newCol]
      ) {
        processed[newRow][newCol] = true
        queue.push({ row: newRow, col: newCol })
      }
    }
  }

  return connected
}

/**
 * 绘制连接的模块组
 */
function drawConnectedModules(
  modules: Modules,
  x: number,
  y: number,
  pixelSize: number,
  ctx: CanvasRenderingContext2D,
) {
  // 创建路径
  ctx.beginPath()

  // 为每个模块创建矩形路径
  for (const module of modules) {
    ctx.rect(x + module.col * pixelSize, y + module.row * pixelSize, pixelSize, pixelSize)
  }

  // 填充路径
  ctx.fill()
}

export default drawQRCode
