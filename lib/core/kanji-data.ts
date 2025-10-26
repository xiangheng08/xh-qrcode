import Mode from './mode'
import * as Utils from './utils'
import BitBuffer from './bit-buffer'

export default class KanjiData {
  mode: any
  data: string

  constructor(data: string) {
    this.mode = Mode.KANJI
    this.data = data
  }

  /**
   * 获取指定长度数据所需的位长度
   * @param length 数据长度
   * @returns 位长度
   */
  static getBitsLength(length: number): number {
    return length * 13
  }

  /**
   * 获取数据长度
   * @returns 数据长度
   */
  getLength(): number {
    return this.data.length
  }

  /**
   * 获取数据的位长度
   * @returns 位长度
   */
  getBitsLength(): number {
    return KanjiData.getBitsLength(this.data.length)
  }

  /**
   * 将数据写入位缓冲区
   * @param bitBuffer 位缓冲区
   */
  write(bitBuffer: BitBuffer): void {
    let i: number

    // 在Shift JIS系统中，汉字字符由两个字节的组合表示。
    // 这些字节值是从JIS X 0208值移位的。
    // JIS X 0208给出了移位编码表示的详细信息。
    for (i = 0; i < this.data.length; i++) {
      let value = Utils.toSJIS(this.data[i])

      // 对于Shift JIS值在0x8140到0x9FFC之间的字符：
      if (value >= 0x8140 && value <= 0x9ffc) {
        // 从Shift JIS值中减去0x8140
        value -= 0x8140

        // 对于Shift JIS值在0xE040到0xEBBF之间的字符
      } else if (value >= 0xe040 && value <= 0xebbf) {
        // 从Shift JIS值中减去0xC140
        value -= 0xc140
      } else {
        throw new Error(
          'Invalid SJIS character: ' + this.data[i] + '\n' + 'Make sure your charset is UTF-8',
        )
      }

      // 将结果的最高有效字节乘以0xC0
      // 并将最低有效字节加到乘积中
      value = ((value >>> 8) & 0xff) * 0xc0 + (value & 0xff)

      // 将结果转换为13位二进制字符串
      bitBuffer.put(value, 13)
    }
  }
}
