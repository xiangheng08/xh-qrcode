import * as Utils from './utils'
import * as ECLevel from './error-correction-level'
import BitBuffer from './bit-buffer'
import BitMatrix from './bit-matrix'
import * as AlignmentPattern from './alignment-pattern'
import * as FinderPattern from './finder-pattern'
import * as MaskPattern from './mask-pattern'
import * as ECCode from './error-correction-code'
import ReedSolomonEncoder from './reed-solomon-encoder'
import * as Version from './version'
import * as FormatInfo from './format-info'
import * as Mode from './mode'
import * as Segments from './segments'
import type { ErrorCorrectionLevel } from './error-correction-level'

export interface QRCodeSymbol {
  modules: BitMatrix
  version: number
  errorCorrectionLevel: ErrorCorrectionLevel
  maskPattern: number
  segments: any[]
}

interface QRCodeOptions {
  version?: number
  errorCorrectionLevel?: string
  maskPattern?: number
  toSJISFunc?: (str: string) => number
}

/**
 * QR码JavaScript实现
 *
 * 由Ryan Day修改以支持nodejs
 * 版权所有 (c) 2011 Ryan Day
 *
 * 根据MIT许可证授权：
 *   http://www.opensource.org/licenses/mit-license.php
 *
//---------------------------------------------------------------------
// QR码JavaScript实现
//
// 版权所有 (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// 根据MIT许可证授权：
//   http://www.opensource.org/licenses/mit-license.php
//
// "QR码"是DENSO WAVE INCORPORATED的注册商标
//   http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------
*/

/**
 * 将定位图案位添加到矩阵中
 *
 * @param  matrix  模块矩阵
 * @param  version QR码版本
 */
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
          matrix.set(row + r, col + c, 1, true)
        } else {
          matrix.set(row + r, col + c, 0, true)
        }
      }
    }
  }
}

/**
 * 将时序图案位添加到矩阵中
 *
 * 注意：此函数必须在 {@link setupAlignmentPattern} 之前调用
 *
 * @param  matrix 模块矩阵
 */
function setupTimingPattern(matrix: BitMatrix): void {
  const size = matrix.size

  for (let r = 8; r < size - 8; r++) {
    const value = r % 2 === 0 ? 1 : 0
    matrix.set(r, 6, value, true)
    matrix.set(6, r, value, true)
  }
}

/**
 * 将对齐图案位添加到矩阵中
 *
 * 注意：此函数必须在 {@link setupTimingPattern} 之后调用
 *
 * @param  matrix  模块矩阵
 * @param  version QR码版本
 */
function setupAlignmentPattern(matrix: BitMatrix, version: number): void {
  const pos = AlignmentPattern.getPositions(version)

  for (let i = 0; i < pos.length; i++) {
    const row = pos[i][0]
    const col = pos[i][1]

    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
          matrix.set(row + r, col + c, 1, true)
        } else {
          matrix.set(row + r, col + c, 0, true)
        }
      }
    }
  }
}

/**
 * 将版本信息位添加到矩阵中
 *
 * @param  matrix  模块矩阵
 * @param  version QR码版本
 */
function setupVersionInfo(matrix: BitMatrix, version: number): void {
  const size = matrix.size
  const bits = Version.getEncodedBits(version)
  let row, col, mod

  for (let i = 0; i < 18; i++) {
    row = Math.floor(i / 3)
    col = (i % 3) + size - 8 - 3
    mod = ((bits >> i) & 1) === 1 ? 1 : 0

    matrix.set(row, col, mod, true)
    matrix.set(col, row, mod, true)
  }
}

/**
 * 将格式信息位添加到矩阵中
 *
 * @param  matrix               模块矩阵
 * @param  errorCorrectionLevel 错误纠正级别
 * @param  maskPattern          掩码图案参考值
 */
function setupFormatInfo(
  matrix: BitMatrix,
  errorCorrectionLevel: ErrorCorrectionLevel,
  maskPattern: number,
): void {
  const size = matrix.size
  const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern)
  let i, mod

  for (i = 0; i < 15; i++) {
    mod = ((bits >> i) & 1) === 1 ? 1 : 0

    // 垂直
    if (i < 6) {
      matrix.set(i, 8, mod, true)
    } else if (i < 8) {
      matrix.set(i + 1, 8, mod, true)
    } else {
      matrix.set(size - 15 + i, 8, mod, true)
    }

    // 水平
    if (i < 8) {
      matrix.set(8, size - i - 1, mod, true)
    } else if (i < 9) {
      matrix.set(8, 15 - i - 1 + 1, mod, true)
    } else {
      matrix.set(8, 15 - i - 1, mod, true)
    }
  }

  // 固定位
  matrix.set(size - 8, 8, 1, true)
}

/**
 * 将编码数据位添加到矩阵中
 *
 * @param  matrix 模块矩阵
 * @param  data   数据码字
 */
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
          let dark = 0

          if (byteIndex < data.length) {
            dark = ((data[byteIndex] >>> bitIndex) & 1) === 1 ? 1 : 0
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

/**
 * 从数据输入创建编码码字
 *
 * @param  version              QR码版本
 * @param  errorCorrectionLevel 错误纠正级别
 * @param  segments             数据输入
 * @return                      包含编码码字的缓冲区
 */
function createData(
  version: number,
  errorCorrectionLevel: ErrorCorrectionLevel,
  segments: any[],
): Uint8Array {
  // 准备数据缓冲区
  const buffer = new BitBuffer()

  segments.forEach(function (data) {
    // 用模式指示符(4位)作为前缀
    buffer.put(data.mode.bit, 4)

    // 用字符计数指示符作为前缀。
    // 字符计数指示符是一个位字符串，表示正在编码的字符数。
    // 字符计数指示符必须放在模式指示符之后，
    // 并且必须是特定数量的位，取决于QR版本和数据模式
    // @see {@link Mode.getCharCountIndicator}。
    buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version))

    // 将二进制数据序列添加到缓冲区
    data.write(buffer)
  })

  // 计算所需的位数
  const totalCodewords = Utils.getSymbolTotalCodewords(version)
  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel)
  const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords!) * 8

  // 添加终止符。
  // 如果位字符串短于所需的总位数，
  // 必须在字符串右侧添加最多四个0作为终止符。
  // 如果位字符串比所需的位数短多于四位，
  // 则在末尾添加四个0。
  if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
    buffer.put(0, 4)
  }

  // 如果位字符串短于四比特，只添加达到所需位数所需的0。

  // 添加终止符后，如果字符串中的位数不是8的倍数，
  // 在右侧用0填充字符串，使其长度成为8的倍数。
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(false)
  }

  // 如果字符串仍然短于所需的总位数，则添加填充字节。
  // 通过交替添加填充码字11101100 (0xEC)和00010001 (0x11)，
  // 扩展缓冲区以填充与版本和错误纠正级别对应的符号的数据容量。
  const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8
  for (let i = 0; i < remainingByte; i++) {
    buffer.put(i % 2 ? 0x11 : 0xec, 8)
  }

  return createCodewords(buffer, version, errorCorrectionLevel)
}

/**
 * 使用Reed-Solomon编码输入数据并返回带有相关纠错位的码字
 *
 * @param  bitBuffer            要编码的数据
 * @param  version              QR码版本
 * @param  errorCorrectionLevel 错误纠正级别
 * @return                      包含编码码字的缓冲区
 */
function createCodewords(
  bitBuffer: BitBuffer,
  version: number,
  errorCorrectionLevel: ErrorCorrectionLevel,
): Uint8Array {
  // 此QR码版本的总码字数(数据+错误纠正)
  const totalCodewords = Utils.getSymbolTotalCodewords(version)

  // 错误纠正码字的总数
  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel)

  // 数据码字的总数
  const dataTotalCodewords = totalCodewords - ecTotalCodewords!

  // 块的总数
  const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel)

  // 计算每组应包含多少块
  const blocksInGroup2 = totalCodewords % ecTotalBlocks!
  const blocksInGroup1 = ecTotalBlocks! - blocksInGroup2

  const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks!)

  const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks!)
  const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1

  // 两组的EC码字数相同
  const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1

  // 使用ecCount度的生成多项式初始化Reed-Solomon编码器
  const rs = new ReedSolomonEncoder(ecCount)

  let offset = 0
  const dcData: Uint8Array[] = new Array(ecTotalBlocks)
  const ecData: Uint8Array[] = new Array(ecTotalBlocks)
  let maxDataSize = 0
  const buffer = new Uint8Array(bitBuffer.buffer)

  // 将缓冲区分割为所需数量的块
  for (let b = 0; b < ecTotalBlocks!; b++) {
    const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2

    // 从缓冲区中提取数据块
    dcData[b] = buffer.slice(offset, offset + dataSize)

    // 计算此数据块的EC码字
    ecData[b] = rs.encode(dcData[b])

    offset += dataSize
    maxDataSize = Math.max(maxDataSize, dataSize)
  }

  // 创建最终数据
  // 交错来自每个块的数据和错误纠正码字
  const data = new Uint8Array(totalCodewords)
  let index = 0
  let i, r

  // 添加数据码字
  for (i = 0; i < maxDataSize; i++) {
    for (r = 0; r < ecTotalBlocks!; r++) {
      if (i < dcData[r].length) {
        data[index++] = dcData[r][i]
      }
    }
  }

  // 添加EC码字
  for (i = 0; i < ecCount; i++) {
    for (r = 0; r < ecTotalBlocks!; r++) {
      data[index++] = ecData[r][i]
    }
  }

  return data
}

/**
 * 构建QR码符号
 *
 * @param  data                 输入字符串
 * @param  version              QR码版本
 * @param  errorCorrectionLevel 错误纠正级别
 * @param  maskPattern          掩码图案
 * @return                      包含符号数据的对象
 */
function createSymbol(
  data: string | any[],
  version: number,
  errorCorrectionLevel: ErrorCorrectionLevel,
  maskPattern: number,
): QRCodeSymbol {
  let segments: any[]

  if (Array.isArray(data)) {
    segments = Segments.fromArray(data)
  } else if (typeof data === 'string') {
    let estimatedVersion = version

    if (!estimatedVersion) {
      const rawSegments = Segments.rawSplit(data)

      // 估算能够包含原始分割段的最佳版本
      estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel)!
    }

    // 构建优化的段
    // 如果估算版本未定义，则尝试使用最高版本
    segments = Segments.fromString(data, estimatedVersion || 40)
  } else {
    throw new Error('Invalid data')
  }

  // 获取能够包含数据的最小版本
  const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel)

  // 如果未找到版本，则无法存储数据
  if (!bestVersion) {
    throw new Error('The amount of data is too big to be stored in a QR Code')
  }

  // 如果未指定，则使用最小版本作为默认值
  if (!version) {
    version = bestVersion

    // 检查指定版本是否能够包含数据
  } else if (version < bestVersion) {
    throw new Error(
      '\n' +
        'The chosen QR Code version cannot contain this amount of data.\n' +
        'Minimum version required to store current data is: ' +
        bestVersion +
        '.\n',
    )
  }

  const dataBits = createData(version, errorCorrectionLevel, segments)

  // 分配矩阵缓冲区
  const moduleCount = Utils.getSymbolSize(version)
  const modules = new BitMatrix(moduleCount)

  // 添加功能模块
  setupFinderPattern(modules, version)
  setupTimingPattern(modules)
  setupAlignmentPattern(modules, version)

  // 为格式信息添加临时虚拟位，仅用于将其设置为保留。
  // 这是为了防止这些位被 {@link MaskPattern.applyMask} 掩码，
  // 因为掩码操作只能在编码区域执行。
  // 这些块将在代码中稍后替换为正确的值。
  setupFormatInfo(modules, errorCorrectionLevel, 0)

  if (version >= 7) {
    setupVersionInfo(modules, version)
  }

  // 添加数据码字
  setupData(modules, dataBits)

  if (isNaN(maskPattern)) {
    // 查找最佳掩码图案
    maskPattern = MaskPattern.getBestMask(
      modules,
      setupFormatInfo.bind(null, modules, errorCorrectionLevel),
    )
  }

  // 应用掩码图案
  MaskPattern.applyMask(maskPattern, modules)

  // 用正确的值替换格式信息位
  setupFormatInfo(modules, errorCorrectionLevel, maskPattern)

  return {
    modules: modules,
    version: version,
    errorCorrectionLevel: errorCorrectionLevel,
    maskPattern: maskPattern,
    segments: segments,
  }
}

/**
 * QR码
 *
 * @param data                 输入数据
 * @param options              可选配置
 * @param options.version              QR码版本
 * @param options.errorCorrectionLevel 错误纠正级别
 * @param options.toSJISFunc         将utf8转换为sjis的辅助函数
 */
export function create(data: string | any[], options?: QRCodeOptions): QRCodeSymbol {
  if (typeof data === 'undefined' || data === '') {
    throw new Error('No input text')
  }

  let errorCorrectionLevel = ECLevel.M
  let version
  let mask

  if (typeof options !== 'undefined') {
    // 使用更高的错误纠正级别作为默认值
    errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M)
    version = Version.from(options.version, undefined)
    mask = MaskPattern.from(options.maskPattern)

    if (options.toSJISFunc) {
      Utils.setToSJISFunction(options.toSJISFunc)
    }
  }

  return createSymbol(data, version!, errorCorrectionLevel, mask as number)
}
