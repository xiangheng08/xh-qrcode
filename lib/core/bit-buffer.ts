export default class BitBuffer {
  buffer: number[]
  length: number

  constructor() {
    this.buffer = []
    this.length = 0
  }

  /**
   * 获取指定索引位置的位值
   * @param index 索引
   * @returns 位值
   */
  get(index: number): boolean {
    const bufIndex = Math.floor(index / 8)
    return ((this.buffer[bufIndex] >>> (7 - (index % 8))) & 1) === 1
  }

  /**
   * 将指定数字以指定长度放入缓冲区
   * @param num 数字
   * @param length 长度
   */
  put(num: number, length: number): void {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1)
    }
  }

  /**
   * 获取缓冲区中的位数
   * @returns 位数
   */
  getLengthInBits(): number {
    return this.length
  }

  /**
   * 放入一个位值
   * @param bit 位值
   */
  putBit(bit: boolean): void {
    const bufIndex = Math.floor(this.length / 8)
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0)
    }

    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> this.length % 8
    }

    this.length++
  }
}
