import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import * as QRCode from './core/qrcode'

/**
 * a simple qrcode component
 */
@customElement('xh-qrcode')
export class XHQRCodeElement extends LitElement {
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

  private __canvas?: HTMLCanvasElement

  private __ctx: CanvasRenderingContext2D | null = null

  render() {
    return html`<canvas></canvas>`
  }

  firstUpdated() {
    this.__drawQRCode()
  }

  updated(changedProperties: Map<string, unknown>) {
    if (
      changedProperties.has('value') ||
      changedProperties.has('version') ||
      changedProperties.has('errorcorrectionlevel') ||
      changedProperties.has('pixelsize') ||
      changedProperties.has('color') ||
      changedProperties.has('background') ||
      changedProperties.has('padding')
    ) {
      this.__drawQRCode()
    }
  }

  private __setupCanvas(canvasSize: number) {
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

    canvas.width = canvasSize
    canvas.height = canvasSize

    ctx.clearRect(0, 0, canvasSize, canvasSize)

    return { canvas, ctx }
  }

  private __drawQRCode() {
    try {
      const symbol = QRCode.create(this.value, {
        errorCorrectionLevel: this.errorcorrectionlevel,
        version: this.version,
      })

      const size = symbol.modules.size
      const dpr = window.devicePixelRatio || 1
      const pixelsize = this.pixelsize * dpr
      const padding = (this.padding || pixelsize * 3) * dpr
      const canvasSize = size * pixelsize + padding * 2

      const { ctx } = this.__setupCanvas(canvasSize)

      ctx.clearRect(0, 0, canvasSize, canvasSize)

      // 绘制背景
      ctx.fillStyle = this.background
      ctx.fillRect(0, 0, canvasSize, canvasSize)

      // 绘制二维码
      ctx.fillStyle = this.color
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (symbol.modules.get(row, col)) {
            const x = col * pixelsize + padding
            const y = row * pixelsize + padding
            ctx.fillRect(x, y, pixelsize, pixelsize)
          }
        }
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
