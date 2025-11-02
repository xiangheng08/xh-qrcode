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
 * @param images 群头像图片
 * @param options 绘制选项
 */
export async function drawGroupAvatar(
  canvas: HTMLCanvasElement,
  images: (string | HTMLImageElement)[],
  options?: DrawGroupAvatarOptions,
) {
  const {
    x = 0,
    y = 0,
    size = canvas.width,
    defaultAvatar,
    background = '#dddddd',
    radius = 0.072,
    gap = 0.035,
    padding = 0.04,
  } = options || {}

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas context not found')
  }

  if (images.length === 0) {
    throw new Error('No images provided')
  }

  let defaultAvatarImage: HTMLImageElement | undefined
  if (typeof defaultAvatar === 'string') {
    defaultAvatarImage = await loadImage(defaultAvatar, { crossOrigin: 'anonymous' })
  } else if (defaultAvatar instanceof HTMLImageElement) {
    // 克隆节点，避免影响原节点
    defaultAvatarImage = defaultAvatar.cloneNode(false) as HTMLImageElement
  }

  const _images: HTMLImageElement[] = []

  for (let i = 0; i < images.length; i++) {
    const item = images[i]
    if (typeof item === 'string') {
      _images[i] = await loadImage(item, { crossOrigin: 'anonymous' })
    } else if (item instanceof HTMLImageElement) {
      // 克隆节点，避免影响原节点
      _images[i] = item.cloneNode(false) as HTMLImageElement
    } else if (defaultAvatarImage) {
      _images[i] = defaultAvatarImage
    } else {
      throw new Error(`Invalid image at index ${i}: ${String(item)}`)
    }
  }

  const _radius = radius * size
  const _gap = gap * size
  const _padding = padding * size

  // 等计算出每个图片的大小后，设置样式
  // for (const image of _images) {
  //   image.style.cssText = `
  //     width: ${imageSize}px;
  //     height: ${imageSize}px;
  //     border-radius: ${_radius}px;
  //     object-fit: cover;
  //   `
  // }
}
