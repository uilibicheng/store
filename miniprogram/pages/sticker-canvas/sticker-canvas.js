import {Scene, Group, Sprite} from '../../lib/sprite-wxapp'
import StickerGroup from './sticker-group'
import device from '../../lib/device'

const cameraFooterHeight = device.rpx2px(330)
const footerHeight = device.rpx2px(412)
const coverHeight = device.rpx2px(26)

const app = getApp()

Page({
  data: {},

  onLoad(options) {
    const {source} = options
    const windowHeight = device.getWindowHeight()
    const cameraHeight = windowHeight - cameraFooterHeight + coverHeight
    const canvasHeight = windowHeight - footerHeight + coverHeight
    const posterHeight = (device.px2rpx(canvasHeight) * 644) / 750
    this.setData({canvasHeight, posterHeight})

    const stickerPhoto = app.getStickerPhoto()
    const stickerImage = app.getStickerImage()

    this.stickerGroupList = []
    if (source === 'album') {
      wx.getImageInfo({
        src: stickerPhoto,
        success: res => {
          const {width, height} = res
          const photoHeight = (device.px2rpx(height) * 750) / device.px2rpx(width)
          this.initSence(stickerPhoto, stickerImage, photoHeight)
        },
      })
    } else {
      const photoHeight = device.px2rpx(cameraHeight)
      this.initSence(stickerPhoto, stickerImage, photoHeight)
    }

    wx.BaaS.auth.getCurrentUser().then(user => {
      this.setData({currentUser: user})
    })
  },

  onShow() {
    this.selectComponent('#sticker-controller').init()
  },

  initSence(stickerPhoto, stickerImage, photoHeight) {
    this.scene = new Scene(1)
    this.layer = this.scene.layer('canvas')

    this.photoGroup = new Group()
    const photo = new Sprite(stickerPhoto)
    photo.attr({
      pos: [0, 0],
      size: [750, photoHeight],
    })

    this.photoGroup.append(photo)

    const stickerGroup = this.createStickerGroup(this.layer, stickerImage)
    this.currentStickerGroup = stickerGroup

    this.layer.append(this.photoGroup, stickerGroup.group)
  },

  createStickerGroup(layer, stickerImage) {
    const sortedStickerGroupList = this.stickerGroupList.sort((a, b) => {
      return b.zIndex - a.zIndex
    })

    const maxZindexItem = sortedStickerGroupList[0] || {}
    const maxZIndex = maxZindexItem.zIndex || 0

    const stickerGroup = new StickerGroup({
      layer,
      stickerImage,
      zIndex: maxZIndex + 1,
      onDelete: () => {
        const index = this.stickerGroupList.findIndex(item => item.stickerGroup === stickerGroup)
        this.stickerGroupList.splice(index, 1)
        console.log(this.stickerGroupList)
      },
    })

    this.stickerGroupList.push({
      stickerGroup,
      zIndex: stickerGroup.group.attr('zIndex'),
    })

    return stickerGroup
  },

  onTouchstart(e) {
    const {x, y} = e.touches[0]
    const [layerX, layerY] = this.scene.toLocalPos(x, y)
    const event = {originEvent: e, layerX, layerY}

    this.touchedStickerGroup = this.getTouchedStickerGroup(event)
    this.currentStickerGroup.hideBtns()
    if (!this.touchedStickerGroup) return

    this.touchedStickerGroup.showBtns()
    this.currentStickerGroup = this.touchedStickerGroup

    this.touchedStickerGroup.group.dispatchEvent('touchstart', event)
  },

  onTouchmove(e) {
    if (!this.touchedStickerGroup) return

    const {x, y} = e.changedTouches[0]
    const [layerX, layerY] = this.scene.toLocalPos(x, y)
    const event = {originEvent: e, layerX, layerY}
    this.touchedStickerGroup.group.dispatchEvent('touchmove', event, true)
  },

  onTouchend(e) {
    if (!this.touchedStickerGroup) return

    const {x, y} = e.changedTouches[0]
    const [layerX, layerY] = this.scene.toLocalPos(x, y)
    const event = {originEvent: e, layerX, layerY}
    this.touchedStickerGroup.group.dispatchEvent('touchend', event, true)
  },

  getTouchedStickerGroup(event) {
    const sortedStickerGroupList = this.stickerGroupList.sort((a, b) => {
      return b.zIndex - a.zIndex
    })

    const target = sortedStickerGroupList.find(item => {
      return item.stickerGroup.group.pointCollision(event)
    })

    if (target) {
      const maxZIndex = sortedStickerGroupList[0].zIndex

      target.stickerGroup.group.attr({zIndex: maxZIndex + 1})
      target.zIndex = maxZIndex + 1
      return target.stickerGroup
    }

    return null
  },

  onSelect(e) {
    this.currentStickerGroup.hideBtns()
    const {sticker} = e.detail
    const stickerGroup = this.createStickerGroup(this.layer, sticker)
    this.layer.append(stickerGroup.group)

    this.currentStickerGroup = stickerGroup
  },

  onCreateSharePoster() {
    this.currentStickerGroup.hideBtns()
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvasId: 'canvas',
        fileType: 'jpg',
        quality: 1,
        success: res => {
          console.log(res.tempFilePath)
          this.setData({isShareCardVisible: true, poster: res.tempFilePath})
        },
      })
    }, 100)
  },

  hideShareCard() {
    this.setData({isShareCardVisible: false})
  },

  noop() {},
})
