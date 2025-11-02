export interface LoadImageOptions {
  /**
   * 是否撤销
   */
  revoke?: boolean

  /**
   * 图片宽度
   */
  width?: number

  /**
   * 图片高度
   */
  height?: number

  /**
   * 跨域
   */
  crossOrigin?: 'anonymous' | 'use-credentials' | ''
}

/**
 * 加载图片
 */
export async function loadImage(
  src: string,
  options?: LoadImageOptions,
): Promise<HTMLImageElement> {
  const { revoke = false, width, height, crossOrigin } = options || {}

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image(width, height)
    if (crossOrigin) img.crossOrigin = crossOrigin
    img.onload = () => {
      resolve(img)
      if (revoke) URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      reject(new Error('load image error'))
      if (revoke) URL.revokeObjectURL(img.src)
    }
    img.src = src
  })
}
