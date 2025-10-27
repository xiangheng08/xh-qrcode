import { LitElement, css } from 'lit'
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
   * Logo 大小比例 (相对于二维码大小)
   */
  @property({ type: Number })
  logoscale?: number

  /**
   * Logo 内边距
   */
  @property({ type: Number })
  logopadding = 0.1

  /**
   * 内部状态
   */
  declare protected [INNER]: InnerState

  get qrcodeSize() {
    return this[INNER].qrcodeArea?.s
  }

  constructor() {
    super()

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to create canvas context')
    }

    this[INNER] = { canvas, ctx }
    this.__loadLogo()
  }

  render() {
    return this[INNER].canvas
  }

  firstUpdated() {
    this.__draw()
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
   * 加载 logo
   */
  private async __loadLogo() {
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
  private __createQRCodeSymbol() {
    this[INNER].symbol = QRCode.create(this.value, {
      errorCorrectionLevel: this.errorcorrectionlevel,
      version: this.version,
    })
  }

  /**
   * 绘制二维码
   */
  private __drawQRCode() {
    const area = this[INNER].qrcodeArea

    if (!area) {
      throw new Error('QRCodeArea is not defined')
    }

    if (!this[INNER].symbol) {
      this.__createQRCodeSymbol()
    }

    const symbol = this[INNER].symbol!
    const matrixSize = symbol.modules.size

    // 绘制二维码
    this[INNER].ctx.fillStyle = this.color
    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        if (symbol.modules.get(row, col)) {
          const x = area.x + col * area.pixelsize
          const y = area.y + row * area.pixelsize
          this[INNER].ctx.fillRect(x, y, area.pixelsize, area.pixelsize)
        }
      }
    }

    if (this.logo) {
      this.__drawLogo()
    }
  }

  /**
   * 获取默认的 logo 比例
   */
  private __getDefaultLogoScale() {
    if (!this[INNER].symbol) {
      return 0.2
    }

    const matrixSize = this[INNER].symbol.modules.size

    let n = Math.round(matrixSize * 0.2)

    if ((matrixSize % 2 !== 0 && n % 2 === 0) || (matrixSize % 2 === 0 && n % 2 !== 0)) {
      n += 1
    }

    return n / matrixSize
  }

  /**
   * 绘制 logo
   */
  private __drawLogo() {
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
  private __calculateQRCodeDimensions() {
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
  private __draw() {
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
      display: block;
    }

    canvas {
      image-rendering: pixelated;
      display: block;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-qrcode': XHQRCodeElement
  }
}
