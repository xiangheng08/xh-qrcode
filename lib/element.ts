import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import * as QRCode from './core/qrcode'

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
  logoscale = 0.2

  /**
   * Logo 内边距
   */
  @property({ type: Number })
  logopadding = 4

  private __canvas?: HTMLCanvasElement
  private __ctx: CanvasRenderingContext2D | null = null
  private __symbol?: QRCode.QRCodeSymbol
  private __logoImage?: HTMLImageElement

  render() {
    return html`<canvas></canvas>`
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
      changedProperties.has('logoscale')
    ) {
      this.__draw()
    }
  }

  private __getDPR() {
    return window.devicePixelRatio || 1
  }

  private __setupCanvas() {
    let canvas = this.__canvas
    let ctx = this.__ctx

    if (!canvas) {
      canvas = this.renderRoot?.querySelector('canvas') as HTMLCanvasElement
      if (!canvas) {
        throw new Error('Failed to find canvas element')
      }
      this.__canvas = canvas
    }

    if (!ctx) {
      ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get 2D context')
      }
      this.__ctx = ctx
    }

    return { canvas, ctx }
  }

  private __drawQRCode(startX: number, startY: number) {
    const { ctx } = this.__setupCanvas()

    const dpr = this.__getDPR()
    const pixelsize = this.pixelsize * dpr
    const symbol = this.__symbol!
    const matrixSize = symbol.modules.size

    // 绘制二维码
    ctx.fillStyle = this.color
    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        if (symbol.modules.get(row, col)) {
          const x = startX + col * pixelsize
          const y = startY + row * pixelsize
          ctx.fillRect(x, y, pixelsize, pixelsize)
        }
      }
    }
  }

  private async __drawLogo(canvasSize: number) {
    try {
      let img = this.__logoImage

      if (!img) {
        img = await XHQRCodeElement.loadImage(this.logo!)
        this.__logoImage = img
      }

      const { ctx } = this.__setupCanvas()

      // 计算 logo 尺寸和位置
      const logoSize = Math.min(canvasSize * this.logoscale, canvasSize * 0.3) // 限制最大为二维码的30%
      const logoX = (canvasSize - logoSize) / 2
      const logoY = (canvasSize - logoSize) / 2
      const imgSize = logoSize - this.logopadding * 2

      // 绘制白色背景（防止透明logo与二维码图案混合）
      ctx.fillStyle = this.background
      ctx.fillRect(logoX, logoY, logoSize, logoSize)

      // 绘制 logo
      ctx.drawImage(img, logoX + this.logopadding, logoY + this.logopadding, imgSize, imgSize)
    } catch (error) {
      console.error('Error drawing logo:', error)
    }
  }

  private __draw() {
    try {
      this.__symbol = QRCode.create(this.value, {
        errorCorrectionLevel: this.errorcorrectionlevel,
        version: this.version,
      })

      const dpr = this.__getDPR()
      const matrixSize = this.__symbol.modules.size
      const pixelsize = this.pixelsize * dpr
      const padding = (this.padding || pixelsize * 2) * dpr
      const canvasSize = matrixSize * pixelsize + padding * 2
      const canvasDisplaySize = canvasSize / dpr

      const { canvas, ctx } = this.__setupCanvas()

      canvas.width = canvasSize
      canvas.height = canvasSize
      canvas.style.width = canvasDisplaySize + 'px'
      canvas.style.height = canvasDisplaySize + 'px'

      ctx.clearRect(0, 0, canvasSize, canvasSize)

      // 绘制背景
      ctx.fillStyle = this.background
      ctx.fillRect(0, 0, canvasSize, canvasSize)

      // 绘制二维码
      this.__drawQRCode(padding, padding)

      // 绘制 logo
      if (this.logo) {
        this.__drawLogo(canvasSize)
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
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
