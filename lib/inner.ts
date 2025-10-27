import type * as QRCode from './core/qrcode'

export const INNER = Symbol('inner')

export interface InnerState {
  readonly canvas: HTMLCanvasElement
  readonly ctx: CanvasRenderingContext2D
  qrcodeArea?: QRCodeArea
  symbol?: QRCode.QRCodeSymbol
  logoImage?: HTMLImageElement
}

export interface QRCodeArea {
  x: number
  y: number
  s: number
}
