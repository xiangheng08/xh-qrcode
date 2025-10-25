import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { generateQRMatrix, getMatrixData } from './qrcode-algorithm'

/**
 * a simple qrcode component
 */
@customElement('xh-qrcode')
export class XHQRCode extends LitElement {
  /**
   * 二维码内容
   */
  @property()
  value = ''

  /**
   * 二维码版本 (1-40)
   */
  @property({ type: Number })
  version = 1

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
      changedProperties.has('pixelSize') ||
      changedProperties.has('color') ||
      changedProperties.has('colorLight')
    ) {
      this.__drawQRCode()
    }
  }

  private __drawQRCode() {
    try {
      // 生成二维码矩阵
      const matrix = generateQRMatrix(this.value, this.version)

      const matrixData = getMatrixData(matrix)

      // 获取canvas元素
      const canvas = this.renderRoot?.querySelector('canvas') as HTMLCanvasElement
      if (!canvas) return

      const size = matrixData.length
      const canvasSize = size * this.pixelSize

      // 设置canvas尺寸
      canvas.width = canvasSize
      canvas.height = canvasSize

      // 获取2D上下文
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 绘制背景
      ctx.fillStyle = this.background
      ctx.fillRect(0, 0, canvasSize, canvasSize)

      // 绘制二维码
      ctx.fillStyle = this.color
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (matrixData[row][col]) {
            ctx.fillRect(col * this.pixelSize, row * this.pixelSize, this.pixelSize, this.pixelSize)
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
    'xh-qrcode': XHQRCode
  }
}
