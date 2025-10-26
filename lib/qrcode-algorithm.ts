/**
 * QR Code生成算法核心模块
 * 从 node-qrcode 项目提取并适配
 *
 * @from https://github.com/soldair/node-qrcode
 */

// 纠错码级别
export const ErrorCorrectionLevel = {
  L: { bit: 1 },
  M: { bit: 0 },
  Q: { bit: 3 },
  H: { bit: 2 },
}

function fromString(string: string) {
  if (typeof string !== 'string') {
    throw new Error('Param is not a string')
  }

  const lcStr = string.toLowerCase()

  switch (lcStr) {
    case 'l':
    case 'low':
      return ErrorCorrectionLevel.L

    case 'm':
    case 'medium':
      return ErrorCorrectionLevel.M

    case 'q':
    case 'quartile':
      return ErrorCorrectionLevel.Q

    case 'h':
    case 'high':
      return ErrorCorrectionLevel.H

    default:
      throw new Error('Unknown EC Level: ' + string)
  }
}

export function getErrorCorrectionLevel(value: any, defaultValue: any) {
  if (value && typeof value.bit !== 'undefined' && value.bit >= 0 && value.bit < 4) {
    return value
  }

  try {
    return fromString(value)
  } catch (e) {
    return defaultValue
  }
}

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

// 伽罗瓦域数学运算
const GF = {
  EXP_TABLE: new Uint8Array(512),
  LOG_TABLE: new Uint8Array(256),

  initTables: function () {
    let x = 1
    for (let i = 0; i < 255; i++) {
      this.EXP_TABLE[i] = x
      this.LOG_TABLE[x] = i

      x <<= 1 // multiply by 2

      // The QR code specification says to use byte-wise modulo 100011101 arithmetic.
      // This means that when a number is 256 or larger, it should be XORed with 0x11D.
      if (x & 0x100) {
        // similar to x >= 256, but a lot faster (because 0x100 == 256)
        x ^= 0x11d
      }
    }

    // Optimization: double the size of the anti-log table so that we don't need to mod 255 to
    // stay inside the bounds (because we will mainly use this table for the multiplication of
    // two GF numbers, no more).
    for (let i = 255; i < 512; i++) {
      this.EXP_TABLE[i] = this.EXP_TABLE[i - 255]
    }
  },

  log: function (n: number) {
    if (n < 1) throw new Error('log(' + n + ')')
    return this.LOG_TABLE[n]
  },

  exp: function (n: number) {
    return this.EXP_TABLE[n]
  },

  mul: function (x: number, y: number) {
    if (x === 0 || y === 0) return 0

    // should be EXP_TABLE[(LOG_TABLE[x] + LOG_TABLE[y]) % 255] if EXP_TABLE wasn't oversized
    // @see {@link initTables}
    return this.EXP_TABLE[this.LOG_TABLE[x] + this.LOG_TABLE[y]]
  },
}

// 初始化伽罗瓦域表
GF.initTables()

// 多项式运算
const Polynomial = {
  mul: function (p1: Uint8Array, p2: Uint8Array) {
    const coeff = new Uint8Array(p1.length + p2.length - 1)

    for (let i = 0; i < p1.length; i++) {
      for (let j = 0; j < p2.length; j++) {
        coeff[i + j] ^= GF.mul(p1[i], p2[j])
      }
    }

    return coeff
  },

  mod: function (divident: Uint8Array, divisor: Uint8Array) {
    let result = new Uint8Array(divident)

    while (result.length - divisor.length >= 0) {
      const coeff = result[0]

      for (let i = 0; i < divisor.length; i++) {
        result[i] ^= GF.mul(divisor[i], coeff)
      }

      // remove all zeros from buffer head
      let offset = 0
      while (offset < result.length && result[offset] === 0) offset++
      result = result.slice(offset)
    }

    return result
  },

  generateECPolynomial: function (degree: number) {
    let poly = new Uint8Array([1])
    for (let i = 0; i < degree; i++) {
      poly = this.mul(poly, new Uint8Array([1, GF.exp(i)]))
    }

    return poly
  },
}

// Reed-Solomon 编码器
class ReedSolomonEncoder {
  genPoly: Uint8Array | undefined
  degree: number

  constructor(degree: number) {
    this.genPoly = undefined
    this.degree = degree

    if (this.degree) this.initialize(this.degree)
  }

  /**
   * Initialize the encoder.
   * The input param should correspond to the number of error correction codewords.
   *
   * @param  {Number} degree
   */
  initialize(degree: number) {
    // create an irreducible generator polynomial
    this.degree = degree
    this.genPoly = Polynomial.generateECPolynomial(this.degree)
  }

  /**
   * Encodes a chunk of data
   *
   * @param  {Uint8Array} data Buffer containing input data
   * @return {Uint8Array}      Buffer containing encoded data
   */
  encode(data: Uint8Array) {
    if (!this.genPoly) {
      throw new Error('Encoder not initialized')
    }

    // Calculate EC for this data block
    // extends data size to data+genPoly size
    const paddedData = new Uint8Array(data.length + this.degree)
    paddedData.set(data)

    // The error correction codewords are the remainder after dividing the data codewords
    // by a generator polynomial
    const remainder = Polynomial.mod(paddedData, this.genPoly)

    // return EC data blocks (last n byte, where n is the degree of genPoly)
    // If coefficients number in remainder are less than genPoly degree,
    // pad with 0s to the left to reach the needed number of coefficients
    const start = this.degree - remainder.length
    if (start > 0) {
      const buff = new Uint8Array(this.degree)
      buff.set(remainder, start)

      return buff
    }

    return remainder
  }
}

// 纠错码数据表
const EC_BLOCKS_TABLE = [
  // L  M  Q  H
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 2, 2, 4, 1, 2, 4, 4, 2, 4, 4, 4, 2, 4, 6, 5, 2, 4, 6, 6, 2,
  5, 8, 8, 4, 5, 8, 8, 4, 5, 8, 11, 4, 8, 10, 11, 4, 9, 12, 16, 4, 9, 16, 16, 6, 10, 12, 18, 6, 10,
  17, 16, 6, 11, 16, 19, 6, 13, 18, 21, 7, 14, 21, 25, 8, 16, 20, 25, 8, 17, 23, 25, 9, 17, 23, 34,
  9, 18, 25, 30, 10, 20, 27, 32, 12, 21, 29, 35, 12, 23, 34, 37, 12, 25, 34, 40, 13, 26, 35, 42, 14,
  28, 38, 45, 15, 29, 40, 48, 16, 31, 43, 51, 17, 33, 45, 54, 18, 35, 48, 57, 19, 37, 51, 60, 19,
  38, 53, 63, 20, 40, 56, 66, 21, 43, 59, 70, 22, 45, 62, 74, 24, 47, 65, 77, 25, 49, 68, 81,
]

const EC_CODEWORDS_TABLE = [
  // L  M  Q  H
  7, 10, 13, 17, 10, 16, 22, 28, 15, 26, 36, 44, 20, 36, 52, 64, 26, 48, 72, 88, 36, 64, 96, 112,
  40, 72, 108, 130, 48, 88, 132, 156, 60, 110, 160, 192, 72, 130, 192, 224, 80, 150, 224, 264, 96,
  176, 260, 308, 104, 198, 288, 352, 120, 216, 320, 384, 132, 240, 360, 432, 144, 280, 408, 480,
  168, 308, 448, 532, 180, 338, 504, 588, 196, 364, 546, 650, 224, 416, 600, 700, 224, 442, 644,
  750, 252, 476, 690, 816, 270, 504, 750, 900, 300, 560, 810, 960, 312, 588, 870, 1050, 336, 644,
  952, 1110, 360, 700, 1020, 1200, 390, 728, 1050, 1260, 420, 784, 1140, 1350, 450, 812, 1200, 1440,
  480, 868, 1290, 1530, 510, 924, 1350, 1620, 540, 980, 1440, 1710, 570, 1036, 1530, 1800, 570,
  1064, 1590, 1890, 600, 1120, 1680, 1980, 630, 1204, 1770, 2100, 660, 1260, 1860, 2220, 720, 1316,
  1950, 2310, 750, 1372, 2040, 2430,
]

const ECCode = {
  /**
   * Returns the number of error correction block that the QR Code should contain
   * for the specified version and error correction level.
   *
   * @param  {Number} version              QR Code version
   * @param  {Number} errorCorrectionLevel Error correction level
   * @return {Number}                      Number of error correction blocks
   */
  getBlocksCount: function (version: number, errorCorrectionLevel: any) {
    switch (errorCorrectionLevel) {
      case ErrorCorrectionLevel.L:
        return EC_BLOCKS_TABLE[(version - 1) * 4 + 0]
      case ErrorCorrectionLevel.M:
        return EC_BLOCKS_TABLE[(version - 1) * 4 + 1]
      case ErrorCorrectionLevel.Q:
        return EC_BLOCKS_TABLE[(version - 1) * 4 + 2]
      case ErrorCorrectionLevel.H:
        return EC_BLOCKS_TABLE[(version - 1) * 4 + 3]
      default:
        return undefined
    }
  },

  /**
   * Returns the number of error correction codewords to use for the specified
   * version and error correction level.
   *
   * @param  {Number} version              QR Code version
   * @param  {Number} errorCorrectionLevel Error correction level
   * @return {Number}                      Number of error correction codewords
   */
  getTotalCodewordsCount: function (version: number, errorCorrectionLevel: any) {
    switch (errorCorrectionLevel) {
      case ErrorCorrectionLevel.L:
        return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0]
      case ErrorCorrectionLevel.M:
        return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1]
      case ErrorCorrectionLevel.Q:
        return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2]
      case ErrorCorrectionLevel.H:
        return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3]
      default:
        return undefined
    }
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
function createData(version: number, errorCorrectionLevel: any, _segments: any[]): Uint8Array {
  // 简化实现，仅用于演示目的
  // 实际实现应该包含完整的编码和纠错算法

  // 计算总数据量
  const size = Utils.getSymbolSize(version)
  const totalModules = size * size

  // 获取纠错码总数
  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel) || 0
  const totalCodewords = Math.floor(totalModules / 8)
  const dataTotalCodewords = Math.max(1, totalCodewords - ecTotalCodewords)

  // 创建随机数据作为示例
  const data = new Uint8Array(dataTotalCodewords)

  // 填充一些示例数据
  for (let i = 0; i < dataTotalCodewords; i++) {
    data[i] = Math.floor(Math.random() * 256)
  }

  // 创建纠错码
  if (ecTotalCodewords > 0) {
    const ecCount = ecTotalCodewords
    const rs = new ReedSolomonEncoder(ecCount)
    const ecData = rs.encode(data)

    // 合并数据和纠错码
    const result = new Uint8Array(data.length + ecData.length)
    result.set(data)
    result.set(ecData, data.length)
    return result
  }

  return data
}

// 创建符号
function createSymbol(
  data: string,
  version: number = 1,
  errorCorrectionLevel: any = ErrorCorrectionLevel.M,
): any {
  // 创建矩阵
  const moduleCount = Utils.getSymbolSize(version)
  const modules = new BitMatrix(moduleCount)

  // 添加功能模块
  setupFinderPattern(modules, version)
  setupTimingPattern(modules)
  setupAlignmentPattern(modules, version)

  // 创建数据（简化版）
  const segments = [{ data: data }]
  const dataBits = createData(version, errorCorrectionLevel, segments)

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
export function generateQRMatrix(
  data: string,
  version: number = 1,
  errorCorrectionLevel: any = ErrorCorrectionLevel.M,
): BitMatrix {
  const symbol = createSymbol(data, version, errorCorrectionLevel)
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
