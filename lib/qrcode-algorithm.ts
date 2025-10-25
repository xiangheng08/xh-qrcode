/**
 * QR Code生成算法核心模块
 * 从 node-qrcode 项目提取并适配
 *
 * @from https://github.com/soldair/node-qrcode
 */

// 工具函数
const Utils = {
  getSymbolSize: function (version: number): number {
    if (!version) throw new Error('Version is required')
    if (version < 1 || version > 40) throw new Error('Version should be in range from 1 to 40')
    return version * 4 + 17
  },

  getSymbolTotalCodewords: function (version: number): number {
    return Utils.getSymbolSize(version) * Utils.getSymbolSize(version)
  },
}

// BitMatrix类
class BitMatrix {
  size: number
  data: Uint8Array
  reservedBit: Uint8Array

  constructor(size: number) {
    if (!size || size < 1) {
      throw new Error('BitMatrix size must be defined and greater than 0')
    }

    this.size = size
    this.data = new Uint8Array(size * size)
    this.reservedBit = new Uint8Array(size * size)
  }

  set(row: number, col: number, value: boolean, reserved?: boolean): void {
    const index = row * this.size + col
    this.data[index] = value ? 1 : 0
    if (reserved) this.reservedBit[index] = 1
  }

  get(row: number, col: number): boolean {
    return this.data[row * this.size + col] === 1
  }

  xor(row: number, col: number, value: boolean): void {
    this.data[row * this.size + col] ^= value ? 1 : 0
  }

  isReserved(row: number, col: number): boolean {
    return this.reservedBit[row * this.size + col] === 1
  }
}

// 查找模式
const FinderPattern = {
  getPositions: function (version: number): number[][] {
    const size = Utils.getSymbolSize(version)
    return [
      [0, 0],
      [size - 7, 0],
      [0, size - 7],
    ]
  },
}

// 对齐模式
const AlignmentPattern = {
  getPositionCount: function (version: number): number {
    if (version === 1) return 0
    return Math.floor(version / 7) + 2
  },

  getPositions: function (version: number): number[][] {
    const numAlign = AlignmentPattern.getPositionCount(version)
    if (numAlign === 0) return []

    const positions: number[][] = []
    const size = Utils.getSymbolSize(version)
    const step = version === 1 ? 0 : Math.ceil((size - 13) / (2 * numAlign - 2)) * 2
    const pos = []
    pos.push(6)

    for (let i = numAlign - 1; i > 0; i--) {
      pos.push(size - 7 - (i - 1) * step)
    }

    for (let i = 0; i < numAlign; i++) {
      for (let j = 0; j < numAlign; j++) {
        // Skip the finder pattern positions
        if (
          (i === 0 && j === 0) ||
          (i === 0 && j === numAlign - 1) ||
          (i === numAlign - 1 && j === 0)
        ) {
          continue
        }

        positions.push([pos[i], pos[j]])
      }
    }

    return positions
  },
}

// 掩码模式
const MaskPattern = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7,

  getBestMask: function (_matrix: BitMatrix, _setupFormatFunc: Function): number {
    // For simplicity, we'll just return a fixed mask pattern
    // In a full implementation, this would evaluate all 8 patterns
    return MaskPattern.PATTERN000
  },

  applyMask: function (pattern: number, matrix: BitMatrix): void {
    const size = matrix.size

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        let mask = false

        switch (pattern) {
          case MaskPattern.PATTERN000:
            mask = (row + col) % 2 === 0
            break
          case MaskPattern.PATTERN001:
            mask = row % 2 === 0
            break
          case MaskPattern.PATTERN010:
            mask = col % 3 === 0
            break
          case MaskPattern.PATTERN011:
            mask = (row + col) % 3 === 0
            break
          case MaskPattern.PATTERN100:
            mask = (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0
            break
          case MaskPattern.PATTERN101:
            mask = ((row * col) % 2) + ((row * col) % 3) === 0
            break
          case MaskPattern.PATTERN110:
            mask = (((row * col) % 2) + ((row * col) % 3)) % 2 === 0
            break
          case MaskPattern.PATTERN111:
            mask = (((row + col) % 2) + ((row * col) % 3)) % 2 === 0
            break
        }

        if (mask && !matrix.isReserved(row, col)) {
          matrix.xor(row, col, true)
        }
      }
    }
  },
}

// 添加定位图案到矩阵
function setupFinderPattern(matrix: BitMatrix, version: number): void {
  const size = matrix.size
  const pos = FinderPattern.getPositions(version)

  for (let i = 0; i < pos.length; i++) {
    const row = pos[i][0]
    const col = pos[i][1]

    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || size <= row + r) continue

      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || size <= col + c) continue

        if (
          (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix.set(row + r, col + c, true, true)
        } else {
          matrix.set(row + r, col + c, false, true)
        }
      }
    }
  }
}

// 添加时序图案到矩阵
function setupTimingPattern(matrix: BitMatrix): void {
  const size = matrix.size

  for (let r = 8; r < size - 8; r++) {
    const value = r % 2 === 0
    matrix.set(r, 6, value, true)
    matrix.set(6, r, value, true)
  }
}

// 添加对齐图案到矩阵
function setupAlignmentPattern(matrix: BitMatrix, version: number): void {
  const pos = AlignmentPattern.getPositions(version)

  for (let i = 0; i < pos.length; i++) {
    const row = pos[i][0]
    const col = pos[i][1]

    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
          matrix.set(row + r, col + c, true, true)
        } else {
          matrix.set(row + r, col + c, false, true)
        }
      }
    }
  }
}

// 添加数据到矩阵
function setupData(matrix: BitMatrix, data: Uint8Array): void {
  const size = matrix.size
  let inc = -1
  let row = size - 1
  let bitIndex = 7
  let byteIndex = 0

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--

    while (true) {
      for (let c = 0; c < 2; c++) {
        if (!matrix.isReserved(row, col - c)) {
          let dark = false

          if (byteIndex < data.length) {
            dark = ((data[byteIndex] >>> bitIndex) & 1) === 1
          }

          matrix.set(row, col - c, dark)
          bitIndex--

          if (bitIndex === -1) {
            byteIndex++
            bitIndex = 7
          }
        }
      }

      row += inc

      if (row < 0 || size <= row) {
        row -= inc
        inc = -inc
        break
      }
    }
  }
}

// 创建模拟数据（用于演示）
function createData(version: number, _segments: any[]): Uint8Array {
  // 简化实现，仅用于演示目的
  // 实际实现应该包含完整的编码和纠错算法

  // 计算总数据量
  const size = Utils.getSymbolSize(version)
  const totalModules = size * size

  // 创建随机数据作为示例
  const dataLength = Math.floor(totalModules / 8)
  const data = new Uint8Array(dataLength)

  // 填充一些示例数据
  for (let i = 0; i < dataLength; i++) {
    data[i] = Math.floor(Math.random() * 256)
  }

  return data
}

// 创建符号
function createSymbol(data: string, version: number = 1): any {
  // 创建矩阵
  const moduleCount = Utils.getSymbolSize(version)
  const modules = new BitMatrix(moduleCount)

  // 添加功能模块
  setupFinderPattern(modules, version)
  setupTimingPattern(modules)
  setupAlignmentPattern(modules, version)

  // 创建数据（简化版）
  const segments = [{ data: data }]
  const dataBits = createData(version, segments)

  // 添加数据模块
  setupData(modules, dataBits)

  // 应用掩码模式
  MaskPattern.applyMask(MaskPattern.PATTERN000, modules)

  return {
    modules: modules,
    version: version,
  }
}

// 主要导出函数
export function generateQRMatrix(data: string, version: number = 1): BitMatrix {
  const symbol = createSymbol(data, version)
  return symbol.modules
}

export function getMatrixData(matrix: BitMatrix): boolean[][] {
  const size = matrix.size
  const result: boolean[][] = []

  for (let row = 0; row < size; row++) {
    const rowData: boolean[] = []
    for (let col = 0; col < size; col++) {
      rowData.push(matrix.get(row, col))
    }
    result.push(rowData)
  }

  return result
}
