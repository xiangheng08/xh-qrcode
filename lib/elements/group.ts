import { customElement, property } from 'lit/decorators.js'
import { XHQRCodeElement } from '../element'
import { INNER, type InnerState } from '../inner'

export interface InnerStateWithGroup extends InnerState {
  /**
   * 群头像
   */
  groupAvatarImage?: HTMLImageElement

  /**
   * 群头像 X 坐标
   */
  groupAvatarX?: number

  /**
   * 群头像 Y 坐标
   */
  groupAvatarY?: number

  /**
   * 群头像大小
   */
  groupAvatarSize?: number

  /**
   * 群名称 X 坐标
   */
  groupNameX?: number

  /**
   * 群名称 Y 坐标
   */
  groupNameY?: number

  /**
   * 群名称 parts
   */
  groupNameParts?: string[]

  /**
   * 群名称行高
   */
  groupNameLineHeight?: number

  tipsX?: number
  tipsY?: number
  tipsParts?: string[]
  tipsLineHeight?: number
}

@customElement('xh-group-qrcode')
export class XHQRCodeGroupElement extends XHQRCodeElement {
  /**
   * 群二维码宽度
   */
  @property()
  width = 400

  /**
   * 上内边距（0-1，相对于宽度）
   */
  @property({ type: Number })
  paddingTop = 0.146

  /**
   * 下内边距（0-1，相对于宽度）
   */
  @property({ type: Number })
  paddingBottom = 0.125

  /**
   * 群头像
   */
  @property()
  groupAvatar = ''

  /**
   * 群头像大小（0-1，相对于宽度）
   */
  @property({ type: Number })
  groupAvatarSize = 0.16

  /**
   * 群名称
   */
  @property()
  groupName = ''

  /**
   * 群头像字体
   */
  @property()
  groupNameFont =
    '{0.044}px "Punctuation SC", "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'

  /**
   * 群名称颜色
   */
  @property()
  groupNameColor = '#000000'

  /**
   * 群名称文本对齐方式
   */
  @property()
  groupNameTextAlign: CanvasTextAlign = 'center'

  /**
   * 群名称文本对齐方式
   */
  @property()
  groupNameDirection: CanvasDirection = 'inherit'

  /**
   * 群名称文本垂直位置
   */
  @property()
  groupNameTextBaseline: CanvasTextBaseline = 'alphabetic'

  /**
   * 群名称宽度（0-1，相对于宽度）
   */
  @property({ type: Number })
  groupNameWidth = 0.63

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
  tipsColor = '#b2b2b2'

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
  qrcodeScale = 0.63

  /**
   * padding 默认设置为 0
   */
  padding = 0

  /**
   * 内部状态
   */
  declare protected [INNER]: InnerStateWithGroup

  protected __xxx(value: string) {
    const dpr = window.devicePixelRatio
    const width = this.width * dpr
    return value.replace(/\{([^\}]+)\}/g, (_, p1) => {
      const num = parseFloat(p1)
      return String(Math.ceil(width * num))
    })
  }

  protected async __loadGroupAvatar() {
    if (this.groupAvatar) {
      this[INNER].groupAvatarImage = await XHQRCodeElement.loadImage(this.groupAvatar)
      this.__drawGroupAvatar()
    }
  }

  protected __drawGroupAvatar() {
    const img = this[INNER].groupAvatarImage
    if (!img) {
      return this.__loadGroupAvatar()
    }

    const size = this[INNER].groupAvatarSize!
    const x = this[INNER].groupAvatarX!
    const y = this[INNER].groupAvatarY!

    this[INNER].ctx.fillStyle = '#dce2e2'
    this[INNER].ctx.fillRect(x, y, size, size)

    this[INNER].ctx.drawImage(img, x, y, size, size)
  }

  protected __setupGroupNameStyle() {
    this[INNER].ctx.font = this.__xxx(this.groupNameFont)
    this[INNER].ctx.textAlign = this.groupNameTextAlign
    this[INNER].ctx.direction = this.groupNameDirection
    this[INNER].ctx.textBaseline = this.groupNameTextBaseline
    this[INNER].ctx.fillStyle = this.groupNameColor
  }

  protected __calculateGroupNameDimensions() {
    this.__setupGroupNameStyle()
    const dpr = window.devicePixelRatio

    const width = this.width * dpr * this.groupNameWidth
    const groupNameParts: string[] = []

    const metrics = this[INNER].ctx.measureText(this.groupName)
    const lineHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
    if (metrics.width > width) {
      let name = this.groupName // TODO: 这里可能有码元码点的问题
      let length = name.length - 1

      while (name.length > 0) {
        const metrics = this[INNER].ctx.measureText(name.slice(0, length))
        if (metrics.width <= width) {
          groupNameParts.push(name.slice(0, length))
          name = name.slice(length)
          length = name.length
        } else {
          length--
        }
      }
    } else {
      groupNameParts.push(this.groupName)
    }

    this[INNER].groupNameParts = groupNameParts
    this[INNER].groupNameLineHeight = lineHeight

    return groupNameParts.length * lineHeight
  }

  protected __drawGroupName() {
    const x = this[INNER].groupNameX!
    const y = this[INNER].groupNameY!
    const groupNameParts = this[INNER].groupNameParts!
    const lineHeight = this[INNER].groupNameLineHeight!

    this.__setupGroupNameStyle()

    for (let i = 0; i < groupNameParts.length; i++) {
      this[INNER].ctx.fillText(groupNameParts[i], x, y + i * lineHeight)
    }
  }

  protected __setupTipsStyle() {
    this[INNER].ctx.font = this.__xxx(this.tipsFont)
    this[INNER].ctx.textAlign = 'center'
    this[INNER].ctx.fillStyle = this.tipsColor
  }

  protected __calculateTipsDimensions() {
    if (!this.tips) {
      return 0
    }
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
    this.__createQRCodeSymbol()

    const dpr = window.devicePixelRatio

    const width = this.width * dpr

    let y = width * this.paddingTop
    this[INNER].groupAvatarSize = width * this.groupAvatarSize
    this[INNER].groupAvatarX = width / 2 - this[INNER].groupAvatarSize / 2
    this[INNER].groupAvatarY = y

    y += this[INNER].groupAvatarSize
    y += width * 0.1

    this[INNER].groupNameX = width / 2
    this[INNER].groupNameY = y

    y += this.__calculateGroupNameDimensions()
    y += width * 0.05

    const symbol = this[INNER].symbol!

    const qrcodeSize = width * this.qrcodeScale

    this[INNER].qrcodeArea = {
      x: width / 2 - qrcodeSize / 2,
      y: y,
      s: qrcodeSize,
      pixelsize: qrcodeSize / symbol.modules.size,
    }

    y += qrcodeSize

    if (this.tips) {
      y += width * 0.11
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

    this.__loadGroupAvatar()
    this.__drawGroupName()
    this.__drawQRCode()
    this.__drawLogo()
    if (this.tips) {
      this.__drawTips()
    }
  }
}
