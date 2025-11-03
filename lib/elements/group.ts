import { customElement, property } from 'lit/decorators.js'
import { XHQRCodeElement } from '../element'
import { INNER, type InnerState } from '../inner'
import { loadImage } from '../utils/image'
import { drawGroupAvatar, type Fit } from '../utils/group-avatar'

export interface InnerStateWithGroup extends InnerState {
  /**
   * 群头像
   */
  groupAvatarImage?: HTMLImageElement

  /**
   * 群头像
   */
  groupAvatarImages?: HTMLImageElement[]

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
  protected static readonly redrawProperties = [
    ...XHQRCodeElement.redrawProperties,
    'width',
    'paddingTop',
    'paddingBottom',
    'groupAvatarSize',
    'defaultGroupAvatar',
    'groupAvatarBackground',
    'groupAvatarFit',
    'groupAvatarRadius',
    'groupAvatarGap',
    'groupAvatarPadding',
    'groupName',
    'groupNameFont',
    'groupNameColor',
    'groupNameWidth',
    'tips',
    'tipsWidth',
    'tipsColor',
    'tipsFont',
    'qrcodeScale',
  ]
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
  groupAvatar?: string

  /**
   * 群头像
   * @description 会被 `groupAvatar` 覆盖
   */
  @property({ type: Array })
  groupAvatars?: string[]

  /**
   * 群头像大小（0-1，相对于宽度）
   */
  @property({ type: Number })
  groupAvatarSize = 0.16

  /**
   * 默认群头像
   * @description 仅对 `groupAvatars` 生效
   */
  @property()
  defaultGroupAvatar?: string

  /**
   * 群头像背景色
   * @description 仅对 `groupAvatars` 生效
   * @default '#dddddd'
   */
  @property()
  groupAvatarBackground?: string

  /**
   * 群头像的每个头像如何适应容器
   * @description 仅对 `groupAvatars` 生效
   * @default 'cover'
   */
  @property()
  groupAvatarFit?: Fit

  /**
   * 群头像圆角（0-1，相对于头像大小）
   * @description 仅对 `groupAvatars` 生效
   * @default 0.072
   */
  @property({ type: Number })
  groupAvatarRadius?: number

  /**
   * 群头像的每个头像的间隔（0-1，相对于头像大小）
   * @description 仅对 `groupAvatars` 生效
   * @default 0.035
   */
  @property({ type: Number })
  groupAvatarGap?: number

  /**
   * 群头像的内边距（0-1，相对于头像大小）
   * @description 仅对 `groupAvatars` 生效
   * @default 0.04
   */
  @property({ type: Number })
  groupAvatarPadding?: number

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
  qrcodeScale = 0.63

  /**
   * padding 默认设置为 0
   */
  padding = 0

  /**
   * 内部状态
   */
  declare protected [INNER]: InnerStateWithGroup

  firstUpdated() {
    super.firstUpdated()
    this.__loadGroupAvatar().catch((err) => {
      this.__emitError(err)
    })
  }

  updated(changedProperties: Map<string, unknown>) {
    if (XHQRCodeGroupElement.redrawProperties.some((property) => changedProperties.has(property))) {
      try {
        this.__draw()
      } catch (error) {
        this.__emitError(error)
      }
    }

    if (changedProperties.has('groupAvatar') || changedProperties.has('groupAvatars')) {
      this.__loadGroupAvatar().catch((err) => {
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

  protected async __loadGroupAvatar() {
    if (this.groupAvatar) {
      this[INNER].groupAvatarImage = await loadImage(this.groupAvatar, { crossOrigin: 'anonymous' })
      this[INNER].groupAvatarImages = void 0
      this.__drawGroupAvatar()
    } else if (this.groupAvatars && this.groupAvatars.length > 0) {
      this[INNER].groupAvatarImages = []
      for (let i = 0; i < this.groupAvatars.length; i++) {
        this[INNER].groupAvatarImages[i] = await loadImage(this.groupAvatars[i], {
          crossOrigin: 'anonymous',
        })
      }
      this[INNER].groupAvatarImage = void 0
      this.__drawGroupAvatar()
    }
  }

  protected __drawGroupAvatar() {
    const size = this[INNER].groupAvatarSize!
    const x = this[INNER].groupAvatarX!
    const y = this[INNER].groupAvatarY!

    this[INNER].ctx.fillStyle = this.background
    this[INNER].ctx.fillRect(x, y, size, size)

    if (this[INNER].groupAvatarImage) {
      this[INNER].ctx.drawImage(this[INNER].groupAvatarImage, x, y, size, size)
    } else if (this[INNER].groupAvatarImages) {
      drawGroupAvatar(this[INNER].canvas, this[INNER].groupAvatarImages, {
        x,
        y,
        size,
        defaultAvatar: this.defaultGroupAvatar,
        background: this.groupAvatarBackground,
        fit: this.groupAvatarFit,
        radius: this.groupAvatarRadius,
        gap: this.groupAvatarGap,
        padding: this.groupAvatarPadding,
      }).catch((err) => {
        this.__emitError(err)
      })
    } else {
      this.__loadGroupAvatar().catch((err) => {
        this.__emitError(err)
      })
    }
  }

  protected __setupGroupNameStyle() {
    this[INNER].ctx.font = this.__replacePlaceholders(this.groupNameFont)
    this[INNER].ctx.textAlign = 'center'
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
    this[INNER].ctx.font = this.__replacePlaceholders(this.tipsFont)
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

    this.__drawGroupName()
    this.__drawGroupAvatar()
    this.__drawQRCode()
    this.__drawLogo()
    if (this.tips) {
      this.__drawTips()
    }
  }
}
