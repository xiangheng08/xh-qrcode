import type * as QRCode from '../core/qrcode'

export interface DrawQRCodeConfig {
  symbol: QRCode.QRCodeSymbol
  x: number
  y: number
  pixelSize: number
  style: string | CanvasGradient | CanvasPattern
  ctx: CanvasRenderingContext2D
}

export type QRCodeShape = 'normal' | 'circle'
