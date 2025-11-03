import { canvasToBlob, drawRoundedRectPath } from './canvas'
import { loadImage } from './image'

export interface DrawGroupAvatarOptions {
  /**
   * 绘制 X 坐标
   * @default 0
   */
  x?: number

  /**
   * 绘制 Y 坐标
   * @default 0
   */
  y?: number

  /**
   * 群头像大小
   * @default canvas.width
   */
  size?: number

  /**
   * 默认头像图片
   * @description 当某个头像图片加载失败或者 `if(typeof x !== 'string' && !(x instanceof HTMLImageElement))` 成立时，会使用 `defaultAvatar` 作为默认头像。
   * 注意：如果某个头像图片加载失败或者 `if(typeof x !== 'string' && !(x instanceof HTMLImageElement))` 成立时，若没有设置 `defaultAvatar`，会抛出错误
   */
  defaultAvatar?: string | HTMLImageElement

  /**
   * 背景色
   * @default '#dddddd'
   */
  background?: string

  /**
   * 每个头像如何适应容器
   * @default 'cover'
   */
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'

  /**
   * 圆角（0-1，相对于头像大小）
   * @default 0.072
   */
  radius?: number

  /**
   * 每个头像的间隔（0-1，相对于头像大小）
   * @default 0.035
   */
  gap?: number

  /**
   * 内边距（0-1，相对于头像大小）
   * @default 0.04
   */
  padding?: number
}

/**
 * 绘制群头像
 * @param canvas 画布
 * @param avatars 群头像图片
 * @param options 绘制选项
 */
export async function drawGroupAvatar(
  canvas: HTMLCanvasElement,
  avatars: (string | HTMLImageElement)[],
  options?: DrawGroupAvatarOptions,
) {
  const {
    x = 0,
    y = 0,
    size = canvas.width,
    defaultAvatar,
    background = '#dddddd',
    fit = 'cover',
    radius = 0.072,
    gap = 0.035,
    padding = 0.04,
  } = options || {}

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas context not found')
  }

  if (avatars.length === 0) {
    throw new Error('No images provided')
  }

  let defaultAvatarImage: HTMLImageElement | undefined
  if (typeof defaultAvatar === 'string') {
    defaultAvatarImage = await loadImage(defaultAvatar, { crossOrigin: 'anonymous' })
  } else if (defaultAvatar instanceof HTMLImageElement) {
    // 克隆节点，避免影响原节点
    defaultAvatarImage = defaultAvatar.cloneNode(false) as HTMLImageElement
  }

  const images: HTMLImageElement[] = []
  const length = Math.min(avatars.length, 9) // 最多取9个头像
  for (let i = 0; i < length; i++) {
    const item = avatars[i]
    if (typeof item === 'string') {
      images[i] = await loadImage(item, { crossOrigin: 'anonymous' })
    } else if (item instanceof HTMLImageElement) {
      // 克隆节点，避免影响原节点
      images[i] = item.cloneNode(false) as HTMLImageElement
    } else if (defaultAvatarImage) {
      images[i] = defaultAvatarImage
    } else {
      throw new Error(`Invalid image at index ${i}: ${String(item)}`)
    }
  }

  const _radius = radius * size
  const _gap = gap * size
  const _padding = padding * size
  const { itemSize, positions } = calculateGroupAvatarPosition(images.length, size, _gap, _padding)

  for (const image of images) {
    // 给每个图片设置样式
    image.style.cssText = `
      width: ${itemSize}px;
      height: ${itemSize}px;
      border-radius: ${_radius}px;
      object-fit: ${fit};
    `
  }

  ctx.clearRect(x, y, size, size)
  ctx.fillStyle = background
  drawRoundedRectPath(ctx, x, y, size, size, _radius)
  ctx.fill()

  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    const pos = positions[i]
    ctx.drawImage(image, pos.x, pos.y, itemSize, itemSize)
  }
}

/**
 * 计算群头像位置
 */
export function calculateGroupAvatarPosition(
  count: number,
  size: number,
  gap: number,
  padding: number,
): { itemSize: number; positions: { x: number; y: number }[] } {
  let itemSize = 0
  const positions: { x: number; y: number }[] = []
  if (count === 1) {
    itemSize = size - padding * 2
    positions.push({ x: padding, y: padding })
  } else if (count === 2) {
    itemSize = (size - padding * 2 - gap) / 2
    const y = padding + itemSize / 2
    positions.push({ x: padding, y }, { x: padding + itemSize + gap, y })
  } else if (count === 3) {
    itemSize = (size - padding * 2 - gap) / 2
    positions.push(
      { x: padding + itemSize / 2 + gap / 2, y: padding },
      { x: padding, y: padding + gap + itemSize },
      { x: padding + gap + itemSize, y: padding + gap + itemSize },
    )
  } else if (count === 4) {
    itemSize = (size - padding * 2 - gap) / 2
    positions.push(
      { x: padding, y: padding },
      { x: padding + gap + itemSize, y: padding },
      { x: padding, y: padding + gap + itemSize },
      { x: padding + gap + itemSize, y: padding + gap + itemSize },
    )
  } else if (count === 5) {
    itemSize = (size - padding * 2 - gap * 2) / 3
    const line1Y = padding + itemSize / 2
    const line2Y = padding + itemSize / 2 + itemSize + gap
    positions.push(
      { x: padding + itemSize / 2 + gap / 2, y: line1Y },
      { x: padding + itemSize * 1.5 + gap * 1.5, y: line1Y },
      { x: padding, y: line2Y },
      { x: padding + itemSize + gap, y: line2Y },
      { x: padding + itemSize * 2 + gap * 2, y: line2Y },
    )
  } else if (count === 6) {
    itemSize = (size - padding * 2 - gap * 2) / 3
    const line1X = padding
    const line2X = padding + itemSize + gap
    const line3X = padding + itemSize * 2 + gap * 2
    const line1Y = padding + itemSize / 2
    const line2Y = padding + itemSize / 2 + itemSize + gap
    positions.push(
      { x: line1X, y: line1Y },
      { x: line2X, y: line1Y },
      { x: line3X, y: line1Y },
      { x: line1X, y: line2Y },
      { x: line2X, y: line2Y },
      { x: line3X, y: line2Y },
    )
  } else if (count === 7) {
    itemSize = (size - padding * 2 - gap * 2) / 3
    const line1X = padding
    const line2X = padding + itemSize + gap
    const line3X = padding + itemSize * 2 + gap * 2
    const line1Y = padding
    const line2Y = padding + itemSize + gap
    const line3Y = padding + itemSize * 2 + gap * 2
    positions.push(
      { x: line2X, y: line1Y },
      { x: line1X, y: line2Y },
      { x: line2X, y: line2Y },
      { x: line3X, y: line2Y },
      { x: line1X, y: line3Y },
      { x: line2X, y: line3Y },
      { x: line3X, y: line3Y },
    )
  } else if (count === 8) {
    itemSize = (size - padding * 2 - gap * 2) / 3
    const line1X = padding
    const line2X = padding + itemSize + gap
    const line3X = padding + itemSize * 2 + gap * 2
    const line1Y = padding
    const line2Y = padding + itemSize + gap
    const line3Y = padding + itemSize * 2 + gap * 2
    positions.push(
      { x: line1X + itemSize / 2 + gap / 2, y: line1Y },
      { x: line1X + itemSize * 1.5 + gap * 1.5, y: line1Y },
      { x: line1X, y: line2Y },
      { x: line2X, y: line2Y },
      { x: line3X, y: line2Y },
      { x: line1X, y: line3Y },
      { x: line2X, y: line3Y },
      { x: line3X, y: line3Y },
    )
  } else if (count >= 9) {
    itemSize = (size - padding * 2 - gap * 2) / 3
    const line1X = padding
    const line2X = padding + itemSize + gap
    const line3X = padding + itemSize * 2 + gap * 2
    const line1Y = padding
    const line2Y = padding + itemSize + gap
    const line3Y = padding + itemSize * 2 + gap * 2
    positions.push(
      { x: line1X, y: line1Y },
      { x: line2X, y: line1Y },
      { x: line3X, y: line1Y },
      { x: line1X, y: line2Y },
      { x: line2X, y: line2Y },
      { x: line3X, y: line2Y },
      { x: line1X, y: line3Y },
      { x: line2X, y: line3Y },
      { x: line3X, y: line3Y },
    )
  }

  return { itemSize: itemSize, positions }
}

type GenerateGroupAvatarType = 'canvas' | 'dataURL' | 'blob' | 'file'

export interface GenerateGroupAvatarOptions<T extends GenerateGroupAvatarType>
  extends Omit<DrawGroupAvatarOptions, 'size'> {
  /**
   * 生成类型
   *
   * @default 'file'
   */
  type?: T

  /**
   * 输出文件名
   *
   * @default 'group-avatar.png'
   */
  filename?: string

  /**
   * 输出文件类型
   *
   * @default 'image/png'
   */
  mime?: string

  /**
   * 图像质量，取值范围 0-1
   *
   * @default 1
   */
  quality?: number
}

/**
 * 生成群头像
 */
export async function generateGroupAvatar(
  avatars: (string | HTMLImageElement)[],
  size: number,
  options?: GenerateGroupAvatarOptions<'canvas'>,
): Promise<HTMLCanvasElement>
export async function generateGroupAvatar(
  avatars: (string | HTMLImageElement)[],
  size: number,
  options?: GenerateGroupAvatarOptions<'dataURL'>,
): Promise<string>
export async function generateGroupAvatar(
  avatars: (string | HTMLImageElement)[],
  size: number,
  options?: GenerateGroupAvatarOptions<'blob'>,
): Promise<Blob>
export async function generateGroupAvatar(
  avatars: (string | HTMLImageElement)[],
  size: number,
  options?: GenerateGroupAvatarOptions<'file'>,
): Promise<File>
export async function generateGroupAvatar(
  avatars: (string | HTMLImageElement)[],
  size: number,
  options?: GenerateGroupAvatarOptions<GenerateGroupAvatarType>,
): Promise<HTMLCanvasElement | string | Blob | File> {
  const {
    type = 'file',
    filename = 'group-avatar.png',
    mime = 'image/png',
    quality = 1,
    ...rest
  } = options || {}

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  await drawGroupAvatar(canvas, avatars, { ...rest, size })

  if (type === 'canvas') {
    return canvas
  } else if (type === 'dataURL') {
    return canvas.toDataURL(mime, quality)
  } else if (type === 'blob') {
    return canvasToBlob(canvas, mime, quality)
  } else if (type === 'file') {
    return new File([await canvasToBlob(canvas, mime, quality)], filename, {
      type: mime,
    })
  } else {
    throw new Error('Invalid type')
  }
}
