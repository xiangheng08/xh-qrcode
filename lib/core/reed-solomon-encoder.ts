import * as Polynomial from './polynomial'

export default class ReedSolomonEncoder {
  genPoly: Uint8Array | undefined
  degree: number | undefined

  constructor(degree?: number) {
    this.genPoly = undefined
    this.degree = degree

    if (this.degree) this.initialize(this.degree)
  }

  /**
   * 初始化编码器。
   * 输入参数应对应于错误纠正码字的数量。
   *
   * @param  degree
   */
  initialize(degree: number): void {
    // 创建一个不可约生成多项式
    this.degree = degree
    this.genPoly = Polynomial.generateECPolynomial(this.degree)
  }

  /**
   * 编码数据块
   *
   * @param  data 包含输入数据的缓冲区
   * @return      包含编码数据的缓冲区
   */
  encode(data: Uint8Array): Uint8Array {
    if (!this.genPoly) {
      throw new Error('Encoder not initialized')
    }

    // 为此数据块计算EC
    // 将数据大小扩展到data+genPoly大小
    const paddedData = new Uint8Array(data.length + this.degree!)
    paddedData.set(data)

    // 错误纠正码字是数据码字除以生成多项式后的余数
    const remainder = Polynomial.mod(paddedData, this.genPoly)

    // 返回EC数据块(最后n字节，其中n是genPoly的度数)
    // 如果余数中的系数数量小于genPoly度数，
    // 则在左侧填充0以达到所需的系数数量
    const start = this.degree! - remainder.length
    if (start > 0) {
      const buff = new Uint8Array(this.degree!)
      buff.set(remainder, start)

      return buff
    }

    return remainder
  }
}
