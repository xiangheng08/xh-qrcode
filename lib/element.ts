import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import * as QRCode from './core/qrcode'
import { INNER, type InnerState } from './inner'

/**
 * a simple qrcode component
 */
@customElement('xh-qrcode')
export class XHQRCodeElement extends LitElement {
  static loadImage(url: string, width?: number, height?: number): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.style.width = width ? width + 'px' : ''
      img.style.height = height ? height + 'px' : ''
      img.src = url
      img.onload = () => resolve(img)
      img.onerror = reject
    })
  }

  /**
   * 二维码内容
   */
  @property()
  value = ''

  /**
   * 二维码版本 (1-40)
   */
  @property({ type: Number })
  version?: number

  /**
   * 纠错码级别 (L, M, Q, H)
   */
  @property()
  errorcorrectionlevel = 'M'

  /**
   * 二维码像素大小
   */
  @property({ type: Number })
  pixelsize = 4

  /**
   * 二维码像素颜色
   */
  @property()
  color = '#000000'

  /**
   * 背景色
   */
  @property()
  background = '#ffffff'

  /**
   * 内边距
   */
  @property({ type: Number })
  padding?: number

  /**
   * 二维码大小
   */
  @property({ type: Number })
  size?: number

  /**
   * Logo 图像 URL
   */
  @property()
  logo?: string

  /**
   * Logo 大小比例 (0-1，相对于二维码大小)
   */
  @property({ type: Number })
  logoscale?: number

  /**
   * Logo 内边距（0-1，相对于 Logo 大小）
   */
  @property({ type: Number })
  logopadding = 0.1

  /**
   * 是否有遮罩层
   */
  @property({ type: Boolean })
  mask = false

  /**
   * 遮罩层颜色
   */
  @property()
  maskcolor = 'rgba(255, 255, 255, 0.9)'

  /**
   * 内部状态
   */
  declare protected [INNER]: InnerState

  /**
   * 二维码大小
   */
  get qrcodeSize() {
    return this[INNER].qrcodeArea?.s
  }

  render() {
    return html`
      <canvas></canvas>
      <div
        class="mask"
        style="--mask-color: ${this.maskcolor}; display: ${this.mask ? 'flex' : 'none'};"
      >
        <slot></slot>
      </div>
    `
  }

  firstUpdated() {
    const canvas = this.shadowRoot!.querySelector('canvas')
    if (!canvas) {
      throw new Error('Canvas is not defined')
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to create canvas context')
    }

    this[INNER] = { canvas, ctx }

    this.__loadLogo()
  }

  updated(changedProperties: Map<string, unknown>) {
    if (
      changedProperties.has('value') ||
      changedProperties.has('version') ||
      changedProperties.has('errorcorrectionlevel') ||
      changedProperties.has('pixelsize') ||
      changedProperties.has('color') ||
      changedProperties.has('background') ||
      changedProperties.has('padding') ||
      changedProperties.has('logo') ||
      changedProperties.has('logoscale') ||
      changedProperties.has('logopadding')
    ) {
      this.__draw()
    }
  }

  /**
   * 返回二维码的 dataURL
   */
  toDataURL(): string {
    if (!this[INNER].canvas) {
      throw new Error('canvas is not ready')
    }
    return this[INNER].canvas.toDataURL()
  }

  /**
   * 返回二维码的 Blob 对象
   * @param type 输出的格式
   * @param quality 压缩质量
   */
  toBlob(type: string = 'image/png', quality?: number): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      if (!this[INNER].canvas) {
        return reject(new Error('canvas is not ready'))
      }
      this[INNER].canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('canvas to blob error'))
          }
        },
        type,
        quality,
      )
    })
  }

  /**
   * 返回二维码的 File 对象
   */
  async toFile(filename: string = 'qrcode.png', type?: string, quality?: number): Promise<File> {
    const blob = await this.toBlob(type, quality)
    return new File([blob], filename, { type: blob.type }) as File
  }

  /**
   * 加载 logo
   */
  protected async __loadLogo() {
    if (this.logo) {
      this[INNER].logoImage = await XHQRCodeElement.loadImage(this.logo)
      if (this[INNER].qrcodeArea) {
        this.__drawLogo()
      }
    }
  }

  /**
   * 创建二维码 Symbol
   */
  protected __createQRCodeSymbol() {
    this[INNER].symbol = QRCode.create(this.value, {
      errorCorrectionLevel: this.errorcorrectionlevel,
      version: this.version,
    })
  }

  /**
   * 绘制二维码
   */
  protected __drawQRCode() {
    const area = this[INNER].qrcodeArea

    if (!area) {
      throw new Error('QRCodeArea is not defined')
    }

    if (!this[INNER].symbol) {
      this.__createQRCodeSymbol()
    }

    const symbol = this[INNER].symbol!
    const matrixSize = symbol.modules.size

    // 创建一个二维数组来标记已处理的模块
    const processed: boolean[][] = Array(matrixSize)
    for (let i = 0; i < matrixSize; i++) {
      processed[i] = Array(matrixSize).fill(false)
    }

    // 绘制二维码
    this[INNER].ctx.fillStyle = this.color
    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        // 如果模块为黑色且未被处理过
        if (symbol.modules.get(row, col) && !processed[row][col]) {
          // 使用 flood fill 算法找到所有相连的模块
          const connectedModules = this.__findConnectedModules(
            symbol.modules,
            processed,
            row,
            col,
            matrixSize,
          )

          // 为这些连接的模块创建路径并绘制
          this.__drawConnectedModules(connectedModules, area)
        }
      }
    }

    if (this.logo) {
      this.__drawLogo()
    }
  }

  /**
   * 使用 flood fill 算法查找连接的模块
   */
  private __findConnectedModules(
    modules: any,
    processed: boolean[][],
    startRow: number,
    startCol: number,
    matrixSize: number,
  ): Array<{ row: number; col: number }> {
    const connected: Array<{ row: number; col: number }> = []
    const queue: Array<{ row: number; col: number }> = [{ row: startRow, col: startCol }]
    processed[startRow][startCol] = true

    // 四个方向：上、右、下、左
    const directions = [
      [-1, 0],
      [0, 1],
      [1, 0],
      [0, -1],
    ]

    while (queue.length > 0) {
      const { row, col } = queue.shift()!
      connected.push({ row, col })

      // 检查四个方向的邻居
      for (const [dr, dc] of directions) {
        const newRow = row + dr
        const newCol = col + dc

        // 检查边界和条件
        if (
          newRow >= 0 &&
          newRow < matrixSize &&
          newCol >= 0 &&
          newCol < matrixSize &&
          modules.get(newRow, newCol) &&
          !processed[newRow][newCol]
        ) {
          processed[newRow][newCol] = true
          queue.push({ row: newRow, col: newCol })
        }
      }
    }

    return connected
  }

  /**
   * 绘制连接的模块组
   */
  private __drawConnectedModules(modules: Array<{ row: number; col: number }>, area: any): void {
    // 创建路径
    this[INNER].ctx.beginPath()

    // 为每个模块创建矩形路径
    for (const module of modules) {
      const x = area.x + module.col * area.pixelsize
      const y = area.y + module.row * area.pixelsize
      this[INNER].ctx.rect(x, y, area.pixelsize, area.pixelsize)
    }

    // 填充路径
    this[INNER].ctx.fill()
  }

  /**
   * 获取默认的 logo 比例
   */
  protected __getDefaultLogoScale() {
    if (!this[INNER].symbol) {
      return 0.25
    }

    const matrixSize = this[INNER].symbol.modules.size

    let n = Math.round(matrixSize * 0.25)

    if ((matrixSize % 2 !== 0 && n % 2 === 0) || (matrixSize % 2 === 0 && n % 2 !== 0)) {
      n += 1
    }

    return n / matrixSize
  }

  /**
   * 绘制 logo
   */
  protected __drawLogo() {
    const img = this[INNER].logoImage

    if (!img) {
      return this.__loadLogo()
    }

    const area = this[INNER].qrcodeArea

    if (!area) {
      throw new Error('QRCodeArea is not defined')
    }

    const qrcodeSize = this.qrcodeSize!
    // 限制最大为二维码的 30%，以免影响识别率
    const logoscale = Math.min(this.logoscale ?? this.__getDefaultLogoScale(), 0.3)
    const logoAreaSize = qrcodeSize * logoscale
    const logoAreaX = area.x + (qrcodeSize - logoAreaSize) / 2
    const logoAreaY = area.y + (qrcodeSize - logoAreaSize) / 2
    const logopadding = logoAreaSize * this.logopadding
    const logoSize = logoAreaSize - logopadding * 2

    // 绘制背景（防止透明logo与二维码图案混合）
    this[INNER].ctx.fillStyle = this.background
    this[INNER].ctx.fillRect(logoAreaX, logoAreaY, logoAreaSize, logoAreaSize)

    // 绘制 logo
    this[INNER].ctx.drawImage(
      img,
      logoAreaX + logopadding,
      logoAreaY + logopadding,
      logoSize,
      logoSize,
    )
  }

  /**
   * 计算二维码尺寸
   */
  protected __calculateQRCodeDimensions() {
    const dpr = window.devicePixelRatio
    const matrixSize = this[INNER].symbol!.modules.size
    let pixelsize = 0
    let padding = 0
    let canvasSize = 0
    let canvasDisplaySize = 0

    if (this.size !== void 0) {
      const size = this.size * dpr
      if (this.padding === void 0) {
        padding = (size / (matrixSize + 4)) * 2
      } else {
        padding = this.padding * dpr
      }
      const qrcodeSize = size - padding * 2
      pixelsize = qrcodeSize / matrixSize
      canvasSize = matrixSize * pixelsize + padding * 2
      canvasDisplaySize = canvasSize / dpr
    } else {
      pixelsize = this.pixelsize * dpr
      if (this.padding === void 0) {
        padding = pixelsize * 2
      } else {
        padding = this.padding * dpr
      }
      canvasSize = matrixSize * pixelsize + padding * 2
      canvasDisplaySize = canvasSize / dpr
    }
    return { matrixSize, pixelsize, padding, canvasSize, canvasDisplaySize }
  }

  /**
   * 绘制
   */
  protected __draw() {
    this.__createQRCodeSymbol()

    const { matrixSize, pixelsize, padding, canvasSize, canvasDisplaySize } =
      this.__calculateQRCodeDimensions()

    this[INNER].qrcodeArea = {
      x: padding,
      y: padding,
      s: matrixSize * pixelsize,
      pixelsize,
    }

    this[INNER].canvas.width = canvasSize
    this[INNER].canvas.height = canvasSize
    this[INNER].canvas.style.width = canvasDisplaySize + 'px'
    this[INNER].canvas.style.height = canvasDisplaySize + 'px'

    this[INNER].ctx.clearRect(0, 0, canvasSize, canvasSize)

    // 绘制背景
    this[INNER].ctx.fillStyle = this.background
    this[INNER].ctx.fillRect(0, 0, canvasSize, canvasSize)

    this.__drawQRCode()
  }

  static styles = css`
    :host {
      position: relative;
    }

    canvas {
      image-rendering: pixelated;
      display: block;
    }

    .mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--mask-color, rgba(255, 255, 255, 0.9));
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-qrcode': XHQRCodeElement
  }
}
