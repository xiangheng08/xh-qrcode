/**
 * 对齐图案是矩阵符号学中固定位置的参考图案，使解码软件能够在图像发生
 * 适度失真时重新同步图像模块的坐标映射。
 *
 * 对齐图案仅存在于版本2或更高版本的QR码符号中，其数量取决于符号版本。
 */

import { getSymbolSize } from './utils'

/**
 * 计算指定QR码版本的每个对齐图案中心模块的行/列坐标。
 *
 * 对齐图案沿着从符号的左上角到右下角的对角线对称分布。
 *
 * 由于位置是对称的，所以只返回一半的坐标。
 * 数组中的每个元素依次代表x和y坐标。
 * @see {@link getPositions}
 *
 * @param  version QR码版本
 * @return         坐标数组
 */
export function getRowColCoords(version: number): number[] {
  if (version === 1) return []

  const posCount = Math.floor(version / 7) + 2
  const size = getSymbolSize(version)
  const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2
  const positions = [size - 7] // 最后一个坐标始终是 (size - 7)

  for (let i = 1; i < posCount - 1; i++) {
    positions[i] = positions[i - 1] - intervals
  }

  positions.push(6) // 第一个坐标始终是 6

  return positions.reverse()
}

/**
 * 返回包含每个对齐图案位置的数组。
 * 数组的每个元素表示图案的中心点作为 (x, y) 坐标
 *
 * 坐标是通过扩展 {@link getRowColCoords} 返回的行/列坐标并过滤掉
 * 与定位图案重叠的项目来计算的
 *
 * @example
 * 对于版本7的符号，{@link getRowColCoords} 返回值 6, 22 和 38。
 * 因此，对齐图案将居中于 (行, 列) 位置 (6,22), (22,6), (22,22), (22,38), (38,22), (38,38)。
 * 注意坐标 (6,6), (6,38), (38,6) 被定位图案占据，因此不用于对齐图案。
 *
 * let pos = getPositions(7)
 * // [[6,22], [22,6], [22,22], [22,38], [38,22], [38,38]]
 *
 * @param  version QR码版本
 * @return         坐标数组
 */
export function getPositions(version: number): number[][] {
  const coords: number[][] = []
  const pos = getRowColCoords(version)
  const posLength = pos.length

  for (let i = 0; i < posLength; i++) {
    for (let j = 0; j < posLength; j++) {
      // 如果位置被定位图案占据则跳过
      if (
        (i === 0 && j === 0) || // 左上角
        (i === 0 && j === posLength - 1) || // 左下角
        (i === posLength - 1 && j === 0)
      ) {
        // 右上角
        continue
      }

      coords.push([pos[i], pos[j]])
    }
  }

  return coords
}
