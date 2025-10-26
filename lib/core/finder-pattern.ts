import { getSymbolSize } from './utils'

const FINDER_PATTERN_SIZE = 7

/**
 * 返回包含每个定位图案位置的数组。
 * 数组的每个元素表示图案的左上角点作为 (x, y) 坐标
 *
 * @param  version QR码版本
 * @return         坐标数组
 */
export function getPositions(version: number): number[][] {
  const size = getSymbolSize(version)

  return [
    // 左上角
    [0, 0],
    // 右上角
    [size - FINDER_PATTERN_SIZE, 0],
    // 左下角
    [0, size - FINDER_PATTERN_SIZE],
  ]
}
