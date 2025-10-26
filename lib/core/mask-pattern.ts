import BitMatrix from './bit-matrix'

/**
 * 数据掩码图案参考
 */
export const Patterns = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7,
}

/**
 * 不良特征的加权惩罚分数
 */
const PenaltyScores = {
  N1: 3,
  N2: 3,
  N3: 40,
  N4: 10,
}

/**
 * 检查掩码图案值是否有效
 *
 * @param  mask    掩码图案
 * @return         如果有效返回true，否则返回false
 */
export function isValid(mask: any): boolean {
  return mask != null && mask !== '' && !isNaN(mask) && mask >= 0 && mask <= 7
}

/**
 * 从值返回掩码图案。
 * 如果值无效，返回undefined
 *
 * @param  value        掩码图案值
 * @return             有效的掩码图案或undefined
 */
export function from(value: any): number | undefined {
  return isValid(value) ? parseInt(value, 10) : undefined
}

/**
 * 查找行/列中相邻的同色模块
 * 并分配惩罚值。
 *
 * 分数: N1 + i
 * i是同色相邻模块数超过5的数量
 */
export function getPenaltyN1(data: BitMatrix): number {
  const size = data.size
  let points = 0
  let sameCountCol = 0
  let sameCountRow = 0
  let lastCol: number | null = null
  let lastRow: number | null = null

  for (let row = 0; row < size; row++) {
    sameCountCol = sameCountRow = 0
    lastCol = lastRow = null

    for (let col = 0; col < size; col++) {
      let module = data.get(row, col)
      if (module === lastCol) {
        sameCountCol++
      } else {
        if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5)
        lastCol = module
        sameCountCol = 1
      }

      module = data.get(col, row)
      if (module === lastRow) {
        sameCountRow++
      } else {
        if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5)
        lastRow = module
        sameCountRow = 1
      }
    }

    if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5)
    if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5)
  }

  return points
}

/**
 * 查找同色的2x2块并分配惩罚值
 *
 * 分数: N2 * (m - 1) * (n - 1)
 */
export function getPenaltyN2(data: BitMatrix): number {
  const size = data.size
  let points = 0

  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 1; col++) {
      const last =
        data.get(row, col) +
        data.get(row, col + 1) +
        data.get(row + 1, col) +
        data.get(row + 1, col + 1)

      if (last === 4 || last === 0) points++
    }
  }

  return points * PenaltyScores.N2
}

/**
 * 在行/列中查找1:1:3:1:1比率(暗:亮:暗:亮:暗)的图案，
 * 前面或后面有4个模块宽的亮区
 *
 * 分数: N3 * 找到的图案数量
 */
export function getPenaltyN3(data: BitMatrix): number {
  const size = data.size
  let points = 0
  let bitsCol = 0
  let bitsRow = 0

  for (let row = 0; row < size; row++) {
    bitsCol = bitsRow = 0
    for (let col = 0; col < size; col++) {
      bitsCol = ((bitsCol << 1) & 0x7ff) | data.get(row, col)
      if (col >= 10 && (bitsCol === 0x5d0 || bitsCol === 0x05d)) points++

      bitsRow = ((bitsRow << 1) & 0x7ff) | data.get(col, row)
      if (col >= 10 && (bitsRow === 0x5d0 || bitsRow === 0x05d)) points++
    }
  }

  return points * PenaltyScores.N3
}

/**
 * 计算整个符号中暗模块的比例
 *
 * 分数: N4 * k
 *
 * k是暗模块比例相对于50%的偏差评级，以5%为步长
 */
export function getPenaltyN4(data: BitMatrix): number {
  let darkCount = 0
  const modulesCount = data.data.length

  for (let i = 0; i < modulesCount; i++) darkCount += data.data[i]

  const k = Math.abs(Math.ceil((darkCount * 100) / modulesCount / 5) - 10)

  return k * PenaltyScores.N4
}

/**
 * 返回给定位置的掩码值
 *
 * @param  maskPattern 图案参考值
 * @param  i           行
 * @param  j           列
 * @return             掩码值
 */
function getMaskAt(maskPattern: number, i: number, j: number): boolean {
  switch (maskPattern) {
    case Patterns.PATTERN000:
      return (i + j) % 2 === 0
    case Patterns.PATTERN001:
      return i % 2 === 0
    case Patterns.PATTERN010:
      return j % 3 === 0
    case Patterns.PATTERN011:
      return (i + j) % 3 === 0
    case Patterns.PATTERN100:
      return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0
    case Patterns.PATTERN101:
      return ((i * j) % 2) + ((i * j) % 3) === 0
    case Patterns.PATTERN110:
      return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0
    case Patterns.PATTERN111:
      return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0

    default:
      throw new Error('bad maskPattern:' + maskPattern)
  }
}

/**
 * 将掩码图案应用于位矩阵
 *
 * @param  pattern 图案参考号
 * @param  data    位矩阵数据
 */
export function applyMask(pattern: number, data: BitMatrix): void {
  const size = data.size

  for (let col = 0; col < size; col++) {
    for (let row = 0; row < size; row++) {
      if (data.isReserved(row, col)) continue
      data.xor(row, col, Number(getMaskAt(pattern, row, col)))
    }
  }
}

/**
 * 返回数据的最佳掩码图案
 *
 * @param  data
 * @return 掩码图案参考号
 */
export function getBestMask(data: BitMatrix, setupFormatFunc: (pattern: number) => void): number {
  const numPatterns = Object.keys(Patterns).length
  let bestPattern = 0
  let lowerPenalty = Infinity

  for (let p = 0; p < numPatterns; p++) {
    setupFormatFunc(p)
    applyMask(p, data)

    // 计算惩罚分数
    const penalty =
      getPenaltyN1(data) + getPenaltyN2(data) + getPenaltyN3(data) + getPenaltyN4(data)

    // 撤销之前应用的掩码
    applyMask(p, data)

    if (penalty < lowerPenalty) {
      lowerPenalty = penalty
      bestPattern = p
    }
  }

  return bestPattern
}
