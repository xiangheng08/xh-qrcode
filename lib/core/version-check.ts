/**
 * 检查QR码版本是否有效
 *
 * @param  version QR码版本
 * @return         如果版本有效返回true，否则返回false
 */
export function isValid(version: number): boolean {
  return !isNaN(version) && version >= 1 && version <= 40
}
