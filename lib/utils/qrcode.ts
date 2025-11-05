/**
 * 判断是否为定位图形区域
 */
export function isFinderPatternArea(row: number, col: number, size: number): boolean {
  return (
    (row < 8 && col < 8) ||
    (row >= size - 8 && row < size && col < 8) ||
    (row < 8 && col >= size - 8 && col < size)
  )
}
