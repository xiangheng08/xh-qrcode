/**
 * 处理QR码符号模块的辅助类
 *
 * @param size 符号大小
 */
export default class BitMatrix {
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

  /**
   * 在指定位置设置位值
   * 如果设置了保留标志，则在掩码处理过程中将忽略此位
   *
   * @param row 行
   * @param col 列
   * @param value 值
   * @param reserved 是否保留
   */
  set(row: number, col: number, value: number, reserved?: boolean): void {
    const index = row * this.size + col
    this.data[index] = value
    if (reserved) this.reservedBit[index] = 1
  }

  /**
   * 返回指定位置的位值
   *
   * @param row 行
   * @param col 列
   * @returns 位值
   */
  get(row: number, col: number): number {
    return this.data[row * this.size + col]
  }

  /**
   * 在指定位置应用异或运算符
   * (在掩码处理过程中使用)
   *
   * @param row 行
   * @param col 列
   * @param value 值
   */
  xor(row: number, col: number, value: number): void {
    this.data[row * this.size + col] ^= value
  }

  /**
   * 检查指定位置的位是否被保留
   *
   * @param row 行
   * @param col 列
   * @returns 是否保留
   */
  isReserved(row: number, col: number): boolean {
    return this.reservedBit[row * this.size + col] === 1
  }
}
