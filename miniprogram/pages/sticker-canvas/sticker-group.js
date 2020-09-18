import {Group, Sprite} from '../../lib/sprite-wxapp'
import WxTouchEvent from '../../lib/wx-touch-event'
import math from '../../lib/math'
import device from '../../lib/device'
import Preload from '../../lib/preload'

const btnMap = {
  close: 'https://cloud-minapp-27037.cloud.ifanrusercontent.com/1hcWWAr2oxvDx9Ut.png',
  rotate: 'https://cloud-minapp-27037.cloud.ifanrusercontent.com/1hcWWAMybkfjygf7.png',
  scale: 'https://cloud-minapp-27037.cloud.ifanrusercontent.com/1hcWWAiYpjEKEZDL.png',
}

export default class StickerGroup {
  constructor(options) {
    this.layer = options.layer
    this.stickerImage = options.stickerImage
    this.zIndex = options.zIndex
    this.onDelete = options.onDelete || function() {}
    this.group = this.initGroup()
    this.initBtns()
  }

  initBtns() {
    const preload = new Preload()

    preload.init(Object.values(btnMap)).then(tempFilePaths => {
      this.tempFilePaths = tempFilePaths

      const closeIcon = tempFilePaths[btnMap.close]
      const rotateIcon = tempFilePaths[btnMap.rotate]
      const scaleIcon = tempFilePaths[btnMap.scale]

      this.closeBtn = this.initCloseBtn(closeIcon)
      this.rotateBtn = this.initRotateBtn(rotateIcon)
      this.scaleBtn = this.initScaleBtn(scaleIcon)

      this.group.append(this.rotateBtn, this.scaleBtn, this.closeBtn)

      this.border.attr({
        border: [2, '#ffdf01'],
      })

      this.initTouchEvent()
    })
  }

  showBtns() {
    this.group.append(this.rotateBtn, this.scaleBtn, this.closeBtn)
    const scale = this.group.attr('scale')[0]
    this.border.attr({
      border: [(2 / scale).toFixed(2), '#ffdf01'],
    })
  }

  hideBtns() {
    this.border.attr({
      border: [0, '#ffdf01'],
    })

    this.group.remove(this.rotateBtn, this.scaleBtn, this.closeBtn)
  }

  initGroup() {
    const group = new Group()
    group.attr({
      anchor: 0.5,
      pos: [290, 290],
      size: [600, 600],
      zIndex: this.zIndex,
    })

    this.sticker = this.initSticker()
    this.border = this.initBorder()

    group.append(this.border, this.sticker)
    return group
  }

  initSticker() {
    const sticker = new Sprite(this.stickerImage)
    sticker.attr({
      anchor: 0.5,
      pos: [300, 300],
      size: [400, 400],
      borderRadius: 1,
    })
    return sticker
  }

  initBorder() {
    const border = new Sprite(this.stickerImage)
    border.attr({
      anchor: 0.5,
      pos: [300, 300],
      size: [400, 400],
      borderRadius: 1,
    })
    return border
  }

  initCloseBtn(icon) {
    const closeBtn = new Sprite(icon)
    closeBtn.attr({
      anchor: 0.5,
      pos: [100, 100],
      size: [80, 80],
      borderRadius: 80,
    })
    return closeBtn
  }

  initRotateBtn(icon) {
    const rotateBtn = new Sprite(icon)
    rotateBtn.attr({
      anchor: 0.5,
      pos: [500, 100],
      size: [80, 80],
      borderRadius: 80,
    })
    return rotateBtn
  }

  initScaleBtn(icon) {
    const scaleBtn = new Sprite(icon)
    scaleBtn.attr({
      anchor: 0.5,
      pos: [500, 500],
      size: [80, 80],
      borderRadius: 80,
    })
    return scaleBtn
  }

  initTouchEvent() {
    const stickerTouchEvent = new WxTouchEvent()
    const closeBtnTouchEvent = new WxTouchEvent()
    const rotateBtnTouchEvent = new WxTouchEvent()
    const scaleBtnTouchEvent = new WxTouchEvent()

    const touchEventList = [stickerTouchEvent, closeBtnTouchEvent, rotateBtnTouchEvent, scaleBtnTouchEvent]

    touchEventList.forEach(touchEvent => {
      touchEvent.bind({
        touchStart: e => {
          console.log('touchEvent touchStart')
          this._prevPoint = e.touches[0]
          this._touchEvent = touchEvent
          this._groupPos = this.group.attr('pos')
        },

        touchMove: e => {
          if (!this._prevPoint) return
          console.log('touchEvent touchMove')
          const prevPoint = Object.assign({}, this._prevPoint)

          if (this._touchEvent === rotateBtnTouchEvent) {
            this.stickerGroupRotate(prevPoint, e.touches[0])
          } else if (this._touchEvent === scaleBtnTouchEvent) {
            this.stickerGroupScale(prevPoint, e.touches[0])
          } else if (this._touchEvent === stickerTouchEvent) {
            this.stickerGroupMove(prevPoint, e.touches[0])
          }

          this._prevPoint = e.touches[0]
        },

        touchEnd: e => {
          if (!this._prevPoint) return
          console.log('touchEvent touchEnd')
          const prevPoint = Object.assign({}, this._prevPoint)

          if (this._touchEvent === rotateBtnTouchEvent) {
            this.stickerGroupRotate(prevPoint, e.changedTouches[0])
          } else if (this._touchEvent === scaleBtnTouchEvent) {
            this.stickerGroupScale(prevPoint, e.changedTouches[0])
          } else if (this._touchEvent === stickerTouchEvent) {
            this.stickerGroupMove(prevPoint, e.changedTouches[0])
          }
          this._prevPoint = null
        },

        tap: e => {
          if (this._touchEvent === closeBtnTouchEvent) {
            this.onDelete()
            this.layer.removeChild(this.group)
            console.log('删除贴纸')
          }
        },
      })
    })

    this.bindTouchEvent(this.sticker, stickerTouchEvent)
    this.bindTouchEvent(this.closeBtn, closeBtnTouchEvent)
    this.bindTouchEvent(this.rotateBtn, rotateBtnTouchEvent)
    this.bindTouchEvent(this.scaleBtn, scaleBtnTouchEvent)
  }

  bindTouchEvent(target, touchEvent) {
    target.on('touchstart', e => {
      touchEvent.start(e.originEvent)
      e.stopDispatch()
    })
    target.on('touchmove', e => {
      touchEvent.move(e.originEvent)
      e.stopDispatch()
    })
    target.on('touchend', e => {
      touchEvent.end(e.originEvent)
      e.stopDispatch()
    })
  }

  stickerGroupMove(prevPoint, currentPoint) {
    const x = device.px2rpx(currentPoint.x - prevPoint.x)
    const y = device.px2rpx(currentPoint.y - prevPoint.y)
    const pos = this.group.attr('pos')
    this.group.attr({
      pos: [pos[0] + x, pos[1] + y],
    })
  }

  stickerGroupRotate(prevPoint, currentPoint) {
    const prevRotate = this.group.attr('rotate')
    const rotate = this.getRotateAngle(prevPoint, currentPoint)

    this.group.attr({
      rotate: prevRotate + rotate,
    })
  }

  stickerGroupScale(prevPoint, currentPoint) {
    const prevScale = this.group.attr('scale')
    const pos = this.group.attr('pos')

    const prevV = {
      x: prevPoint.x - device.rpx2px(pos[0]),
      y: prevPoint.y - device.rpx2px(pos[1]),
    }

    const currentV = {
      x: currentPoint.x - device.rpx2px(pos[0]),
      y: currentPoint.y - device.rpx2px(pos[1]),
    }

    const rotate = math.getRotateAngle(currentV, prevV)
    const prevVLen = math.getLen(prevV)
    const currentVLen = math.getLen(currentV)
    const transLen = (currentVLen * Math.cos((rotate * Math.PI) / 180) - prevVLen) / prevVLen
    let scale = prevScale[0] + transLen

    this.group.attr({scale})

    let borderWidth = (2 / scale).toFixed(2)
    this.border.attr({
      border: [borderWidth, '#FFDF01'],
    })

    this.closeBtn.attr({scale: 1 / scale})
    this.rotateBtn.attr({scale: 1 / scale})
    this.scaleBtn.attr({scale: 1 / scale})

    // console.log('this.sticker.originalRenderRect', this.sticker.originalRenderRect)
  }

  getRotateAngle(prevPoint, currentPoint) {
    const pos = this.group.attr('pos')

    const prevV = {
      x: prevPoint.x - device.rpx2px(pos[0]),
      y: prevPoint.y - device.rpx2px(pos[1]),
    }

    const currentV = {
      x: currentPoint.x - device.rpx2px(pos[0]),
      y: currentPoint.y - device.rpx2px(pos[1]),
    }

    return math.getRotateAngle(currentV, prevV)
  }
}
