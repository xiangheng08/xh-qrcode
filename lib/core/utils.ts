let toSJISFunction: ((kanji: string) => number) | undefined
const CODEWORDS_COUNT = [
  0, // 未使用
  26,
  44,
  70,
  100,
  134,
  172,
  196,
  242,
  292,
  346,
  404,
  466,
  532,
  581,
  655,
  733,
  815,
  901,
  991,
  1085,
  1156,
  1258,
  1364,
  1474,
  1588,
  1706,
  1828,
  1921,
  2051,
  2185,
  2323,
  2465,
  2611,
  2761,
  2876,
  3034,
  3196,
  3362,
  3532,
  3706,
]

/**
 * 返回指定版本的QR码大小
 *
 * @param  version QR码版本
 * @return         QR码大小
 */
export function getSymbolSize(version: number): number {
  if (!version) throw new Error('"version" cannot be null or undefined')
  if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40')
  return version * 4 + 17
}

/**
 * 返回用于存储数据和EC信息的码字总数。
 *
 * @param  version QR码版本
 * @return         以位为单位的数据长度
 */
export function getSymbolTotalCodewords(version: number): number {
  return CODEWORDS_COUNT[version]
}

/**
 * 使用Bose-Chaudhuri-Hocquenghem编码数据
 *
 * @param  data 要编码的值
 * @return      编码后的值
 */
export function getBCHDigit(data: number): number {
  let digit = 0

  while (data !== 0) {
    digit++
    data >>>= 1
  }

  return digit
}

/**
 * 设置SJIS函数
 * @param f 函数
 */
export function setToSJISFunction(f: (kanji: string) => number): void {
  if (typeof f !== 'function') {
    throw new Error('"toSJISFunc" is not a valid function.')
  }

  toSJISFunction = f
}

/**
 * 检查是否启用汉字模式
 * @returns 是否启用汉字模式
 */
export function isKanjiModeEnabled(): boolean {
  return typeof toSJISFunction !== 'undefined'
}

/**
 * 将汉字转换为SJIS
 * @param kanji 汉字
 * @returns SJIS值
 */
export function toSJIS(kanji: string): number {
  if (toSJISFunction) {
    return toSJISFunction(kanji)
  }
  throw new Error('toSJISFunction is not defined')
}
