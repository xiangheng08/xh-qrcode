export interface ErrorCorrectionLevel {
  bit: number
}

export const L: ErrorCorrectionLevel = { bit: 1 }
export const M: ErrorCorrectionLevel = { bit: 0 }
export const Q: ErrorCorrectionLevel = { bit: 3 }
export const H: ErrorCorrectionLevel = { bit: 2 }

/**
 * 根据字符串获取纠错级别
 * @param string 纠错级别字符串
 * @returns 纠错级别对象
 */
function fromString(string: string): ErrorCorrectionLevel {
  if (typeof string !== 'string') {
    throw new Error('Param is not a string')
  }

  const lcStr = string.toLowerCase()

  switch (lcStr) {
    case 'l':
    case 'low':
      return L

    case 'm':
    case 'medium':
      return M

    case 'q':
    case 'quartile':
      return Q

    case 'h':
    case 'high':
      return H

    default:
      throw new Error('Unknown EC Level: ' + string)
  }
}

/**
 * 检查纠错级别是否有效
 * @param level 纠错级别
 * @returns 是否有效
 */
export function isValid(level: any): boolean {
  return level && typeof level.bit !== 'undefined' && level.bit >= 0 && level.bit < 4
}

/**
 * 从值获取纠错级别
 * @param value 值
 * @param defaultValue 默认值
 * @returns 纠错级别
 */
export function from(value: any, defaultValue: ErrorCorrectionLevel): ErrorCorrectionLevel {
  if (isValid(value)) {
    return value
  }

  try {
    return fromString(value)
  } catch (e) {
    return defaultValue
  }
}
