import * as VersionCheck from './version-check'
import * as Regex from './regex'

export interface Mode {
  id?: string
  bit: number
  ccBits?: number[]
}

/**
 * 数字模式从十进制数字集(0 - 9)编码数据
 * (字节值为30HEX到39HEX)。
 * 通常，3个数据字符用10位表示。
 */
export const NUMERIC: Mode = {
  id: 'Numeric',
  bit: 1 << 0,
  ccBits: [10, 12, 14],
}

/**
 * 字母数字模式从45个字符集合编码数据，
 * 即10个数字(0 - 9)，
 *    26个字母字符(A - Z)，
 *    和9个符号(SP, $, %, *, +, -, ., /, :)。
 * 通常，两个输入字符用11位表示。
 */
export const ALPHANUMERIC: Mode = {
  id: 'Alphanumeric',
  bit: 1 << 1,
  ccBits: [9, 11, 13],
}

/**
 * 在字节模式下，数据以每个字符8位编码。
 */
export const BYTE: Mode = {
  id: 'Byte',
  bit: 1 << 2,
  ccBits: [8, 16, 16],
}

/**
 * 汉字模式根据基于JIS X 0208的Shift JIS系统高效编码汉字字符。
 * Shift JIS值从JIS X 0208值移位。
 * JIS X 0208给出了移位编码表示的详细信息。
 * 每个双字节字符值被压缩为13位二进制码字。
 */
export const KANJI: Mode = {
  id: 'Kanji',
  bit: 1 << 3,
  ccBits: [8, 10, 12],
}

/**
 * 混合模式将包含上述任何模式组合的数据序列
 */
export const MIXED: Mode = {
  bit: -1,
}

/**
 * 根据QR码规范返回存储数据长度所需的位数。
 *
 * @param  mode    数据模式
 * @param  version QR码版本
 * @return         所需位数
 */
export function getCharCountIndicator(mode: Mode, version: number): number {
  if (!mode.ccBits) throw new Error('Invalid mode: ' + mode)

  if (!VersionCheck.isValid(version)) {
    throw new Error('Invalid version: ' + version)
  }

  if (version >= 1 && version < 10) return mode.ccBits[0]
  else if (version < 27) return mode.ccBits[1]
  return mode.ccBits[2]
}

/**
 * 返回存储指定数据的最有效模式
 *
 * @param  dataStr 输入数据字符串
 * @return         最佳模式
 */
export function getBestModeForData(dataStr: string): Mode {
  if (Regex.testNumeric(dataStr)) return NUMERIC
  else if (Regex.testAlphanumeric(dataStr)) return ALPHANUMERIC
  else if (Regex.testKanji(dataStr)) return KANJI
  else return BYTE
}

/**
 * 将模式名称作为字符串返回
 *
 * @param mode 模式对象
 * @returns    模式名称
 */
export function toString(mode: Mode): string {
  if (mode && mode.id) return mode.id
  throw new Error('Invalid mode')
}

/**
 * 检查输入参数是否为有效的模式对象
 *
 * @param   mode 模式对象
 * @returns      如果是有效模式返回true，否则返回false
 */
export function isValid(mode: Mode): boolean {
  return mode && mode.bit !== undefined && mode.ccBits !== undefined
}

/**
 * 从名称获取模式对象
 *
 * @param   string 模式名称
 * @returns        模式对象
 */
function fromString(string: string): Mode {
  if (typeof string !== 'string') {
    throw new Error('Param is not a string')
  }

  const lcStr = string.toLowerCase()

  switch (lcStr) {
    case 'numeric':
      return NUMERIC
    case 'alphanumeric':
      return ALPHANUMERIC
    case 'kanji':
      return KANJI
    case 'byte':
      return BYTE
    default:
      throw new Error('Unknown mode: ' + string)
  }
}

/**
 * 从值返回模式。
 * 如果值不是有效模式，返回defaultValue
 *
 * @param  value        编码模式
 * @param  defaultValue 备用值
 * @return              编码模式
 */
export function from(value: any, defaultValue: Mode): Mode {
  if (isValid(value)) {
    return value
  }

  try {
    return fromString(value)
  } catch (e) {
    return defaultValue
  }
}

export default {
  NUMERIC,
  ALPHANUMERIC,
  BYTE,
  KANJI,
  MIXED,
  getCharCountIndicator,
  getBestModeForData,
  toString,
  isValid,
  from,
}
