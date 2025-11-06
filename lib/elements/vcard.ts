import { customElement, property } from 'lit/decorators.js'
import { XHQRCodeElement } from '../element'
import { INNER, type InnerState } from '../inner'
import { loadImage } from '../utils/image'
import { drawRoundedRectPath } from '../utils/canvas'

export interface InnerStateWithVCard extends InnerState {
  avatarImage?: HTMLImageElement
  avatarX?: number
  avatarY?: number
  avatarSize?: number
  nameWidth?: number
  name?: string
  nameX?: number
  nameY?: number
  nameLineHeight?: number
  description?: string
  descriptionY?: number
  descriptionLineHeight?: number
  tipsX?: number
  tipsY?: number
  tipsParts?: string[]
  tipsLineHeight?: number
}

/**
 * 个人名片二维码
 */
@customElement('xh-vcard-qrcode')
export class XHQRCodeVCardElement extends XHQRCodeElement {
  protected static readonly redrawProperties = [
    ...XHQRCodeElement.redrawProperties,
    'width',
    'paddingTop',
    'paddingBottom',
    'avatarSize',
    'avatarGap',
    'avatarRadius',
    'name',
    'nameFont',
    'nameColor',
    'description',
    'descriptionFont',
    'descriptionColor',
    'tips',
    'tipsWidth',
    'tipsColor',
    'tipsFont',
    'qrcodeScale',
  ]

  /**
   * 名片宽度
   */
  @property()
  width = 400

  /**
   * 上内边距（0-1，相对于宽度）
   */
  @property({ type: Number })
  paddingTop = 0.135

  /**
   * 下内边距（0-1，相对于宽度）
   */
  @property({ type: Number })
  paddingBottom = 0.125

  /**
   * 头像
   */
  @property()
  avatar?: string

  /**
   * 默认头像
   */
  @property()
  defaultAvatar?: string

  /**
   * 头像大小（0-1，相对于宽度）
   */
  @property({ type: Number })
  avatarSize = 0.135

  /**
   * 头像与名字的间隔（0-1，相对于宽度）
   */
  @property({ type: Number })
  avatarGap = 0.03

  /**
   * 头像圆角（0-1，相对于头像大小）
   */
  @property({ type: Number })
  avatarRadius = 0.1

  /**
   * 名字
   */
  @property()
  name = ''

  /**
   * 名字字体
   */
  @property()
  nameFont =
    '{0.048}px "Punctuation SC", "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'

  /**
   * 名字颜色
   */
  @property()
  nameColor = '#000000'

  /**
   * 名字与下方描述的间隔
   */
  @property({ type: Number })
  nameGap = 0.015

  /**
   * 描述
   */
  @property()
  description?: string

  /**
   * 名字字体
   */
  @property()
  descriptionFont =
    '{0.03}px "Punctuation SC", "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'

  /**
   * 名字颜色
   */
  @property()
  descriptionColor = '#b4b4b4'

  /**
   * 提示语
   */
  @property()
  tips = ''

  /**
   * 提示语宽度（0-1，相对于宽度）
   */
  @property({ type: Number })
  tipsWidth = 0.8

  /**
   * 提示语颜色
   */
  @property()
  tipsColor = '#b4b4b4'

  /**
   * 提示语字体
   */
  @property()
  tipsFont =
    '{0.03}px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", "Helvetica Neue", Helvetica, Arial, sans-serif'

  /**
   * 二维码所占比例（0-1，相对于宽度）
   */
  @property({ type: Number })
  qrcodeScale = 0.725

  /**
   * 内部状态
   */
  declare protected [INNER]: InnerStateWithVCard

  firstUpdated() {
    super.firstUpdated()
    this.__loadAvatar().catch((err) => {
      this.__emitError(err)
    })
  }

  updated(changedProperties: Map<string, unknown>) {
    if (XHQRCodeVCardElement.redrawProperties.some((property) => changedProperties.has(property))) {
      try {
        this.__draw()
      } catch (error) {
        this.__emitError(error)
      }
    }

    if (changedProperties.has('avatar')) {
      this.__loadAvatar().catch((err) => {
        this.__emitError(err)
      })
    }
  }

  protected async __loadAvatar() {
    if (this.avatar) {
      this[INNER].avatarImage = await loadImage(this.avatar, { crossOrigin: 'anonymous' })
      this.__drawAvatar()
    }
  }

  protected __drawAvatar() {
    const x = this[INNER].avatarX!
    const y = this[INNER].avatarY!
    const size = this[INNER].avatarSize!

    if (this[INNER].avatarImage) {
      this[INNER].ctx.save()
      drawRoundedRectPath(this[INNER].ctx, x, y, size, size, size * this.avatarRadius)
      this[INNER].ctx.clip() // 设置裁剪区域
      this[INNER].ctx.drawImage(this[INNER].avatarImage, x, y, size, size)
      this[INNER].ctx.restore() // 恢复画布状态
    } else {
      this.__loadAvatar().catch((err) => {
        this.__emitError(err)
      })
    }
  }

  protected __replacePlaceholders(value: string) {
    const dpr = window.devicePixelRatio
    const width = this.width * dpr
    return value.replace(/\{([^\}]+)\}/g, (_, p1) => {
      const num = parseFloat(p1)
      return String(Math.ceil(width * num))
    })
  }

  protected __setupNameStyle() {
    this[INNER].ctx.font = this.__replacePlaceholders(this.nameFont)
    this[INNER].ctx.textAlign = 'start'
    this[INNER].ctx.textBaseline = 'top'
    this[INNER].ctx.fillStyle = this.nameColor
  }

  protected __calculateNameDimensions() {
    this.__setupNameStyle()
    const dpr = window.devicePixelRatio
    const width = this.width * dpr
    const qrcodeWidth = width * this.qrcodeScale
    const avatarSize = width * this.avatarSize
    const avatarGap = width * this.avatarGap
    const nameWidth = qrcodeWidth - avatarSize - avatarGap

    let name = this.name

    let metrics = this[INNER].ctx.measureText(name)
    let index = name.length - 1
    let bool = false
    const lineHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
    while (metrics.width > nameWidth && index > 0) {
      metrics = this[INNER].ctx.measureText(name.slice(0, index--) + '...')
      bool = true
    }

    this[INNER].nameLineHeight = lineHeight
    this[INNER].name = bool ? name.slice(0, index + 1) + '...' : name
    this[INNER].nameX = (width - qrcodeWidth) / 2 + avatarSize + avatarGap
    this[INNER].nameWidth = nameWidth
    return lineHeight
  }

  protected __drawName() {
    const x = this[INNER].nameX!
    const y = this[INNER].nameY!
    const name = this[INNER].name!
    this.__setupNameStyle()
    this[INNER].ctx.fillText(name, x, y)
  }

  protected __setupDescriptionStyle() {
    this[INNER].ctx.font = this.__replacePlaceholders(this.descriptionFont)
    this[INNER].ctx.textAlign = 'start'
    this[INNER].ctx.textBaseline = 'top'
    this[INNER].ctx.fillStyle = this.descriptionColor
  }

  protected __calculateDescriptionDimensions() {
    this.__setupDescriptionStyle()

    const nameWidth = this[INNER].nameWidth!
    const description = this.description!

    let metrics = this[INNER].ctx.measureText(description)
    let index = description.length - 1
    let bool = false
    const lineHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
    while (metrics.width > nameWidth && index > 0) {
      metrics = this[INNER].ctx.measureText(description.slice(0, index--) + '...')
      bool = true
    }

    this[INNER].descriptionLineHeight = lineHeight
    this[INNER].description = bool ? description.slice(0, index) + '...' : description
    return lineHeight
  }

  protected __drawDescription() {
    const x = this[INNER].nameX!
    const y = this[INNER].descriptionY!
    const description = this[INNER].description!
    this.__setupDescriptionStyle()
    this[INNER].ctx.fillText(description, x, y)
  }

  protected __setupTipsStyle() {
    this[INNER].ctx.font = this.__replacePlaceholders(this.tipsFont)
    this[INNER].ctx.textAlign = 'center'
    this[INNER].ctx.fillStyle = this.tipsColor
  }

  protected __calculateTipsDimensions() {
    this.__setupTipsStyle()
    const dpr = window.devicePixelRatio
    const width = this.width * dpr * this.tipsWidth
    const tipsParts: string[] = []

    const metrics = this[INNER].ctx.measureText(this.tips)
    const lineHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
    if (metrics.width > width) {
      let text = this.tips // TODO: 这里可能有码元码点的问题
      let length = text.length - 1

      while (text.length > 0) {
        const metrics = this[INNER].ctx.measureText(text.slice(0, length))
        if (metrics.width <= width) {
          tipsParts.push(text.slice(0, length))
          text = text.slice(length)
          length = text.length
        } else {
          length--
        }
      }
    } else {
      tipsParts.push(this.tips)
    }

    this[INNER].tipsParts = tipsParts
    this[INNER].tipsLineHeight = lineHeight

    return tipsParts.length * lineHeight
  }

  protected __drawTips() {
    const x = this[INNER].tipsX!
    const y = this[INNER].tipsY!
    const tipsParts = this[INNER].tipsParts!
    const lineHeight = this[INNER].tipsLineHeight!

    this.__setupTipsStyle()
    for (let i = 0; i < tipsParts.length; i++) {
      this[INNER].ctx.fillText(tipsParts[i], x, y + i * lineHeight)
    }
  }

  /**
   * 绘制
   */
  protected __draw() {
    const symbol = this.__createQRCodeSymbol()
    const dpr = window.devicePixelRatio
    const width = this.width * dpr
    const qrcodeSize = width * this.qrcodeScale
    const avatarSize = width * this.avatarSize

    let y = width * this.paddingTop

    this[INNER].avatarSize = avatarSize
    this[INNER].avatarX = (width - qrcodeSize) / 2
    this[INNER].avatarY = y

    const nameLintHeight = this.__calculateNameDimensions()
    if (this.description) {
      const descriptionLineHeight = this.__calculateDescriptionDimensions()
      const nameGap = width * this.nameGap
      this[INNER].nameY = y + (avatarSize - (nameLintHeight + descriptionLineHeight)) / 2
      this[INNER].descriptionY = this[INNER].nameY + nameLintHeight + nameGap
    } else {
      this[INNER].nameY = y + (avatarSize - nameLintHeight) / 2
    }

    y += avatarSize
    y += width * 0.0925

    this[INNER].qrcodeArea = {
      x: (width - qrcodeSize) / 2,
      y: y,
      s: qrcodeSize,
      pixelsize: qrcodeSize / symbol.modules.size,
    }

    y += qrcodeSize

    if (this.tips) {
      y += width * 0.1
      this[INNER].tipsY = y
      this[INNER].tipsX = width / 2
      y += this.__calculateTipsDimensions()
    }

    y += width * this.paddingBottom

    this[INNER].canvas.width = width
    this[INNER].canvas.height = y
    this[INNER].canvas.style.width = this[INNER].canvas.width / dpr + 'px'
    this[INNER].canvas.style.height = this[INNER].canvas.height / dpr + 'px'

    this[INNER].ctx.fillStyle = this.background
    this[INNER].ctx.fillRect(0, 0, this[INNER].canvas.width, this[INNER].canvas.height)

    this.__drawAvatar()
    this.__drawName()
    if (this.description) this.__drawDescription()
    this.__drawQRCode()
    this.__drawLogo()
    if (this.tips) this.__drawTips()
  }
}
