import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import * as QRCode from './core/qrcode'
import { INNER, type InnerState } from './inner'
import { loadImage } from './utils/image'
import { drawQRCode } from './utils/qrcode'

/**
 * a simple qrcode component
 */
@customElement('xh-qrcode')
export class XHQRCodeElement extends LitElement {
  /**
   * 当这些属性发生变化时，将触发二维码重新绘制
   */
  protected static readonly redrawProperties = [
    'value',
    'version',
    'errorCorrectionLevel',
    'pixelSize',
    'color',
    'background',
    'padding',
    'logo',
    'logoScale',
    'logoPadding',
  ]

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
  errorCorrectionLevel = 'M'

  /**
   * 二维码像素大小
   */
  @property({ type: Number })
  pixelSize = 4

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
  logoScale?: number

  /**
   * Logo 内边距（0-1，相对于 Logo 大小）
   */
  @property({ type: Number })
  logoPadding = 0.1

  /**
   * 是否有遮罩层
   */
  @property({ type: Boolean })
  mask = false

  /**
   * 遮罩层颜色
   */
  @property()
  maskColor = 'rgba(255, 255, 255, 0.9)'

  /**
   * resize 事件触发后是否自动重绘
   */
  @property({ type: Boolean })
  resizeRedraw = true

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

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('resize', this.__resizeHandler.bind(this))
  }

  render() {
    return html`
      <canvas></canvas>
      <div
        class="mask"
        style="--mask-color: ${this.maskColor}; display: ${this.mask ? 'flex' : 'none'};"
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

    this.__loadLogo().catch((err) => {
      this.__emitError(err)
    })
  }

  updated(changedProperties: Map<string, unknown>) {
    if (XHQRCodeElement.redrawProperties.some((property) => changedProperties.has(property))) {
      try {
        this.__draw()
      } catch (error) {
        this.__emitError(error)
      }
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
   * 发出错误事件
   */
  protected __emitError(error: unknown) {
    const e = new ErrorEvent('error', { error })
    this.dispatchEvent(e)
  }

  /**
   * 加载 logo
   */
  protected async __loadLogo() {
    if (this.logo) {
      this[INNER].logoImage = await loadImage(this.logo, { crossOrigin: 'anonymous' })
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
      errorCorrectionLevel: this.errorCorrectionLevel,
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

    drawQRCode(symbol, area.x, area.y, area.pixelsize, this[INNER].ctx, this.color)

    if (this.logo) {
      this.__drawLogo()
    }
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
      this.__loadLogo().catch((err) => {
        this.__emitError(err)
      })
      return
    }

    const area = this[INNER].qrcodeArea

    if (!area) {
      throw new Error('QRCodeArea is not defined')
    }

    const qrcodeSize = this.qrcodeSize!
    // 限制最大为二维码的 30%，以免影响识别率
    const logoscale = Math.min(this.logoScale ?? this.__getDefaultLogoScale(), 0.3)
    const logoAreaSize = qrcodeSize * logoscale
    const logoAreaX = area.x + (qrcodeSize - logoAreaSize) / 2
    const logoAreaY = area.y + (qrcodeSize - logoAreaSize) / 2
    const logopadding = logoAreaSize * this.logoPadding
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
      pixelsize = this.pixelSize * dpr
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

  /**
   * resize 事件回调
   */
  protected __resizeHandler() {
    if (this.resizeRedraw) {
      try {
        this.__draw()
      } catch (error) {
        this.__emitError(error)
      }
    }
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
