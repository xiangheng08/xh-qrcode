import Mode from './mode'
import NumericData from './numeric-data'
import AlphanumericData from './alphanumeric-data'
import ByteData from './byte-data'
import KanjiData from './kanji-data'
import * as Regex from './regex'
import * as Utils from './utils'
import dijkstra from 'dijkstrajs'

interface Segment {
  data: string
  mode: any
  length: number
  index: number
}

interface Node {
  data: string
  mode: any
  length: number
  index?: number
}

interface Graph {
  map: any
  table: any
}

/**
 * 返回UTF8字节长度
 *
 * @param  str 输入字符串
 * @return     字节数
 */
function getStringByteLength(str: string): number {
  return unescape(encodeURIComponent(str)).length
}

/**
 * 从字符串获取指定模式的段列表
 *
 * @param  regex 正则表达式
 * @param  mode  段模式
 * @param  str   要处理的字符串
 * @return       包含段数据的对象数组
 */
function getSegments(regex: RegExp, mode: any, str: string): Segment[] {
  const segments: Segment[] = []
  let result: RegExpExecArray | null

  while ((result = regex.exec(str)) !== null) {
    segments.push({
      data: result[0],
      index: result.index,
      mode: mode,
      length: result[0].length,
    })
  }

  return segments
}

/**
 * 从字符串中提取具有适当模式的系列段
 *
 * @param  dataStr 输入字符串
 * @return         包含段数据的对象数组
 */
function getSegmentsFromString(dataStr: string): Segment[] {
  const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr)
  const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr)
  let byteSegs: Segment[]
  let kanjiSegs: Segment[]

  if (Utils.isKanjiModeEnabled()) {
    byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr)
    kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr)
  } else {
    byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr)
    kanjiSegs = []
  }

  const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs)

  return segs
    .sort(function (s1, s2) {
      return s1.index - s2.index
    })
    .map(function (obj) {
      return {
        data: obj.data,
        mode: obj.mode,
        length: obj.length,
        index: obj.index,
      }
    })
}

/**
 * 返回用指定模式编码指定长度字符串所需的位数
 *
 * @param  length 字符串长度
 * @param  mode   段模式
 * @return        位长度
 */
function getSegmentBitsLength(length: number, mode: any): number {
  switch (mode) {
    case Mode.NUMERIC:
      return NumericData.getBitsLength(length)
    case Mode.ALPHANUMERIC:
      return AlphanumericData.getBitsLength(length)
    case Mode.KANJI:
      return KanjiData.getBitsLength(length)
    case Mode.BYTE:
      return ByteData.getBitsLength(length)
    default:
      return 0
  }
}

/**
 * 合并具有相同模式的相邻段
 *
 * @param  segs 包含段数据的对象数组
 * @return      包含段数据的对象数组
 */
function mergeSegments(segs: Segment[]): Segment[] {
  return segs.reduce(function (acc: Segment[], curr: Segment) {
    const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null
    if (prevSeg && prevSeg.mode === curr.mode) {
      acc[acc.length - 1].data += curr.data
      return acc
    }

    acc.push(curr)
    return acc
  }, [])
}

/**
 * 生成将用于构建段图的所有可能节点组合列表。
 *
 * 节点按组划分。每组将包含可用于编码给定文本的所有模式列表。
 *
 * 例如，文本'12345'可以编码为数字、字母数字或字节。
 * '12345'的组将包含3个对象，每个可能的编码模式一个。
 *
 * 每个节点代表一个可能的段。
 *
 * @param  segs 包含段数据的对象数组
 * @return      包含段数据的对象数组
 */
function buildNodes(segs: Segment[]): Node[][] {
  const nodes: Node[][] = []
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i]

    switch (seg.mode) {
      case Mode.NUMERIC:
        nodes.push([
          seg,
          { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length, index: seg.index },
          { data: seg.data, mode: Mode.BYTE, length: seg.length, index: seg.index },
        ])
        break
      case Mode.ALPHANUMERIC:
        nodes.push([seg, { data: seg.data, mode: Mode.BYTE, length: seg.length, index: seg.index }])
        break
      case Mode.KANJI:
        nodes.push([
          seg,
          {
            data: seg.data,
            mode: Mode.BYTE,
            length: getStringByteLength(seg.data),
            index: seg.index,
          },
        ])
        break
      case Mode.BYTE:
        nodes.push([
          {
            data: seg.data,
            mode: Mode.BYTE,
            length: getStringByteLength(seg.data),
            index: seg.index,
          },
        ])
    }
  }

  return nodes
}

/**
 * 从节点列表构建图。
 * 每个节点组中的所有段将与下一组的所有段连接，以此类推。
 *
 * 在每个连接处将根据段的字节长度分配权重。
 *
 * @param  nodes    包含段数据的对象数组
 * @param  version  QR码版本
 * @return          所有可能段的图
 */
function buildGraph(nodes: Node[][], version: number): Graph {
  const table: any = {}
  const graph: any = { start: {} }
  let prevNodeIds = ['start']

  for (let i = 0; i < nodes.length; i++) {
    const nodeGroup = nodes[i]
    const currentNodeIds: string[] = []

    for (let j = 0; j < nodeGroup.length; j++) {
      const node = nodeGroup[j]
      const key = '' + i + j

      currentNodeIds.push(key)
      table[key] = { node: node, lastCount: 0 }
      graph[key] = {}

      for (let n = 0; n < prevNodeIds.length; n++) {
        const prevNodeId = prevNodeIds[n]

        if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
          graph[prevNodeId][key] =
            getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) -
            getSegmentBitsLength(table[prevNodeId].lastCount, node.mode)

          table[prevNodeId].lastCount += node.length
        } else {
          if (table[prevNodeId]) table[prevNodeId].lastCount = node.length

          graph[prevNodeId][key] =
            getSegmentBitsLength(node.length, node.mode) +
            4 +
            Mode.getCharCountIndicator(node.mode, version) // 切换成本
        }
      }
    }

    prevNodeIds = currentNodeIds
  }

  for (let n = 0; n < prevNodeIds.length; n++) {
    graph[prevNodeIds[n]].end = 0
  }

  return { map: graph, table: table }
}

/**
 * 根据指定的数据和模式构建段。
 * 如果未指定模式，将使用更合适的模式。
 *
 * @param  data      输入数据
 * @param  modesHint 数据模式
 * @return           段
 */
function buildSingleSegment(data: string, modesHint: any): any {
  let mode: any
  const bestMode = Mode.getBestModeForData(data)

  mode = Mode.from(modesHint, bestMode)

  // 确保数据可以编码
  if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
    throw new Error(
      '"' +
        data +
        '"' +
        ' cannot be encoded with mode ' +
        Mode.toString(mode) +
        '.\n Suggested mode is: ' +
        Mode.toString(bestMode),
    )
  }

  // 如果禁用汉字支持，使用Mode.BYTE
  if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
    mode = Mode.BYTE
  }

  switch (mode) {
    case Mode.NUMERIC:
      return new NumericData(data)

    case Mode.ALPHANUMERIC:
      return new AlphanumericData(data)

    case Mode.KANJI:
      return new KanjiData(data)

    case Mode.BYTE:
      return new ByteData(data)
  }
}

/**
 * 从数组构建段列表。
 * 数组可以包含字符串或包含段信息的对象。
 *
 * 对于每个字符串项，将生成一个具有给定字符串和更合适编码模式的段。
 *
 * 对于每个对象项，将生成一个具有给定数据和模式的段。
 * 对象必须至少包含"data"属性。
 * 如果不存在"mode"属性，将使用更合适的模式。
 *
 * @param  array 包含段数据的对象数组
 * @return       段数组
 */
export function fromArray(array: any[]): any[] {
  return array.reduce(function (acc: any[], seg: any) {
    if (typeof seg === 'string') {
      acc.push(buildSingleSegment(seg, null))
    } else if (seg.data) {
      acc.push(buildSingleSegment(seg.data, seg.mode))
    }

    return acc
  }, [])
}

/**
 * 从字符串构建优化的段序列，
 * 这将产生最短的可能比特流。
 *
 * @param  data    输入字符串
 * @param  version QR码版本
 * @return         段数组
 */
export function fromString(data: string, version: number): any[] {
  const segs = getSegmentsFromString(data)

  const nodes = buildNodes(segs)
  const graph = buildGraph(nodes, version)
  const path = dijkstra.find_path(graph.map, 'start', 'end')

  const optimizedSegs: Segment[] = []
  for (let i = 1; i < path.length - 1; i++) {
    optimizedSegs.push(graph.table[path[i]].node as Segment)
  }

  return fromArray(mergeSegments(optimizedSegs))
}

/**
 * 将字符串拆分为各种段，这些段的模式最能代表其内容。
 * 生成的段远未优化。
 * 此函数的输出仅用于估计可能包含数据的QR码版本。
 *
 * @param  data 输入字符串
 * @return      段数组
 */
export function rawSplit(data: string): any[] {
  return fromArray(getSegmentsFromString(data))
}
