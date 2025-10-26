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

  private __drawQRCode() {
    try {
      const symbol = QRCode.create(this.value, {
        errorCorrectionLevel: this.errorcorrectionlevel,
        version: this.version,
      })

      // 获取canvas元素
      const canvas = this.renderRoot?.querySelector('canvas') as HTMLCanvasElement
      if (!canvas) return

      const size = symbol.modules.size
      const pixelsize = this.pixelsize
      const padding = this.padding || pixelsize * 4
      const canvasSize = size * pixelsize + padding * 2

      // 设置canvas尺寸
      canvas.width = canvasSize
      canvas.height = canvasSize

      // 获取2D上下文
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 绘制背景
      ctx.fillStyle = this.background
      ctx.fillRect(0, 0, canvasSize, canvasSize)

      symbol.modules.data

      // 绘制二维码
      ctx.fillStyle = this.color
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (symbol.modules.get(row, col)) {
            ctx.fillRect(col * pixelsize + padding, row * pixelsize + padding, pixelsize, pixelsize)
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
