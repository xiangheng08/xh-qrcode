import Mode from './mode'
import BitBuffer from './bit-buffer'

/**
 * 字母数字模式下可用的字符数组
 *
 * 根据QR码规范，每个字符被分配一个从0到44的值，
 * 在这种情况下与数组索引一致
 */
const ALPHA_NUM_CHARS = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  ' ',
  '$',
  '%',
  '*',
  '+',
  '-',
  '.',
  '/',
  ':',
]

export default class AlphanumericData {
  mode: any
  data: string

  constructor(data: string) {
    this.mode = Mode.ALPHANUMERIC
    this.data = data
  }

  /**
   * 获取指定长度数据所需的位长度
   * @param length 数据长度
   * @returns 位长度
   */
  static getBitsLength(length: number): number {
    return 11 * Math.floor(length / 2) + 6 * (length % 2)
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
    return AlphanumericData.getBitsLength(this.data.length)
  }

  /**
   * 将数据写入位缓冲区
   * @param bitBuffer 位缓冲区
   */
  write(bitBuffer: BitBuffer): void {
    let i: number

    // 输入数据字符被分为两字符一组，并编码为11位二进制码
    for (i = 0; i + 2 <= this.data.length; i += 2) {
      // 第一个字符的字符值乘以45
      let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45

      // 第二个字符的字符值加到乘积上
      value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1])

      // 和值作为11位二进制数存储
      bitBuffer.put(value, 11)
    }

    // 如果输入数据字符数不是2的倍数，
    // 最后一个字符的字符值编码为6位二进制数
    if (this.data.length % 2) {
      bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6)
    }
  }
}
