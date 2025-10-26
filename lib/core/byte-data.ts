import Mode from './mode'
import BitBuffer from './bit-buffer'

export default class ByteData {
  mode: any
  data: Uint8Array

  constructor(data: string | Uint8Array) {
    this.mode = Mode.BYTE
    if (typeof data === 'string') {
      this.data = new TextEncoder().encode(data)
    } else {
      this.data = new Uint8Array(data)
    }
  }

  /**
   * 获取指定长度数据所需的位长度
   * @param length 数据长度
   * @returns 位长度
   */
  static getBitsLength(length: number): number {
    return length * 8
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
    return ByteData.getBitsLength(this.data.length)
  }

  /**
   * 将数据写入位缓冲区
   * @param bitBuffer 位缓冲区
   */
  write(bitBuffer: BitBuffer): void {
    for (let i = 0, l = this.data.length; i < l; i++) {
      bitBuffer.put(this.data[i], 8)
    }
  }
}
