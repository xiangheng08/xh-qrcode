import * as Utils from './utils'
import * as ECCode from './error-correction-code'
import * as ECLevel from './error-correction-level'
import * as Mode from './mode'
import * as VersionCheck from './version-check'
import type { ErrorCorrectionLevel } from './error-correction-level'

// 用于编码版本信息的生成多项式
const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0)
const G18_BCH = Utils.getBCHDigit(G18)

function getBestVersionForDataLength(
  mode: any,
  length: number,
  errorCorrectionLevel: ErrorCorrectionLevel,
): number | undefined {
  for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
    if (length <= getCapacity(currentVersion, errorCorrectionLevel, mode)) {
      return currentVersion
    }
  }

  return undefined
}

function getReservedBitsCount(mode: any, version: number): number {
  // 字符计数指示符 + 模式指示符位
  return Mode.getCharCountIndicator(mode, version) + 4
}

function getTotalBitsFromDataArray(segments: any[], version: number): number {
  let totalBits = 0

  segments.forEach(function (data) {
    const reservedBits = getReservedBitsCount(data.mode, version)
    totalBits += reservedBits + data.getBitsLength()
  })

  return totalBits
}

function getBestVersionForMixedData(
  segments: any[],
  errorCorrectionLevel: ErrorCorrectionLevel,
): number | undefined {
  for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
    const length = getTotalBitsFromDataArray(segments, currentVersion)
    if (length <= getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
      return currentVersion
    }
  }

  return undefined
}

/**
 * 从值返回版本号。
 * 如果值不是有效版本，返回defaultValue
 *
 * @param  value        QR码版本
 * @param  defaultValue 备用值
 * @return              QR码版本号
 */
export function from(value: any, defaultValue?: number): number | undefined {
  if (VersionCheck.isValid(value)) {
    return parseInt(value, 10)
  }

  return defaultValue
}

/**
 * 返回使用指定的QR码版本和错误纠正级别可以存储的数据量
 *
 * @param  version              QR码版本(1-40)
 * @param  errorCorrectionLevel 错误纠正级别
 * @param  mode                 数据模式
 * @return                      可存储数据量
 */
export function getCapacity(
  version: number,
  errorCorrectionLevel: ErrorCorrectionLevel,
  mode?: any,
): number {
  if (!VersionCheck.isValid(version)) {
    throw new Error('Invalid QR Code version')
  }

  // 默认使用字节模式
  if (typeof mode === 'undefined') mode = Mode.BYTE

  // 此QR码版本的总码字数(数据+错误纠正)
  const totalCodewords = Utils.getSymbolTotalCodewords(version)

  // 错误纠正码字的总数
  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel)

  // 数据码字的总数
  const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords!) * 8

  if (mode === Mode.MIXED) return dataTotalCodewordsBits

  const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version)

  // 返回可存储码字的最大数量
  switch (mode) {
    case Mode.NUMERIC:
      return Math.floor((usableBits / 10) * 3)

    case Mode.ALPHANUMERIC:
      return Math.floor((usableBits / 11) * 2)

    case Mode.KANJI:
      return Math.floor(usableBits / 13)

    case Mode.BYTE:
    default:
      return Math.floor(usableBits / 8)
  }
}

/**
 * 返回包含数据量所需的最小版本
 *
 * @param  data                    数据段
 * @param  errorCorrectionLevel    错误纠正级别
 * @param  mode                    数据模式
 * @return                         QR码版本
 */
export function getBestVersionForData(
  data: any | any[],
  errorCorrectionLevel?: any,
): number | undefined {
  let seg: any

  const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M)

  if (Array.isArray(data)) {
    if (data.length > 1) {
      return getBestVersionForMixedData(data, ecl)
    }

    if (data.length === 0) {
      return 1
    }

    seg = data[0]
  } else {
    seg = data
  }

  return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl)
}

/**
 * 返回包含相关纠错位的版本信息
 *
 * 版本信息包含在版本7或更高版本的QR码符号中。
 * 它由一个18位序列组成，包含6个数据位，
 * 以及使用(18, 6)Golay码计算的12个错误纠正位。
 *
 * @param  version QR码版本
 * @return         编码后的版本信息位
 */
export function getEncodedBits(version: number): number {
  if (!VersionCheck.isValid(version) || version < 7) {
    throw new Error('Invalid QR Code version')
  }

  let d = version << 12

  while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
    d ^= G18 << (Utils.getBCHDigit(d) - G18_BCH)
  }

  return (version << 12) | d
}
