import Mode from './mode'
import BitBuffer from './bit-buffer'

export default class NumericData {
  mode: any
  data: string

  constructor(data: string | number) {
    this.mode = Mode.NUMERIC
    this.data = data.toString()
  }

  /**
   * 获取指定长度数据所需的位长度
   * @param length 数据长度
   * @returns 位长度
   */
  static getBitsLength(length: number): number {
    return 10 * Math.floor(length / 3) + (length % 3 ? (length % 3) * 3 + 1 : 0)
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
    return NumericData.getBitsLength(this.data.length)
  }

  /**
   * 将数据写入位缓冲区
   * @param bitBuffer 位缓冲区
   */
  write(bitBuffer: BitBuffer): void {
    let i: number, group: string, value: number

    // 输入数据字符串被分为三数字一组，
    // 每组转换为其10位二进制等价值。
    for (i = 0; i + 3 <= this.data.length; i += 3) {
      group = this.data.substr(i, 3)
      value = parseInt(group, 10)

      bitBuffer.put(value, 10)
    }

    // 如果输入数字的数量不是3的整数倍，
    // 最后一个或两个数字分别转换为4位或7位。
    const remainingNum = this.data.length - i
    if (remainingNum > 0) {
      group = this.data.substr(i)
      value = parseInt(group, 10)

      bitBuffer.put(value, remainingNum * 3 + 1)
    }
  }
}
