import * as Utils from './utils'
import type { ErrorCorrectionLevel } from './error-correction-level'

const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0)
const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1)
const G15_BCH = Utils.getBCHDigit(G15)

/**
 * 返回包含相关纠错位的格式信息
 *
 * 格式信息是一个15位序列，包含5个数据位，
 * 以及使用(15, 5) BCH码计算的10个纠错位。
 *
 * @param  errorCorrectionLevel 纠错级别
 * @param  mask                 掩码图案
 * @return                      编码后的格式信息位
 */
export function getEncodedBits(errorCorrectionLevel: ErrorCorrectionLevel, mask: number): number {
  const data = (errorCorrectionLevel.bit << 3) | mask
  let d = data << 10

  while (Utils.getBCHDigit(d) - G15_BCH >= 0) {
    d ^= G15 << (Utils.getBCHDigit(d) - G15_BCH)
  }

  // 与掩码图案进行异或运算，以确保纠错级别和数据掩码图案的任何组合
  // 都不会导致全零数据字符串
  return ((data << 10) | d) ^ G15_MASK
}
