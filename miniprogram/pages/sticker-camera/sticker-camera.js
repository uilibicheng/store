import {ROUTE} from '../../config/constants'
import device from '../../lib/device'

const footerHeight = device.rpx2px(330)
const coverHeight = device.rpx2px(26)
const app = getApp()

Page({
  data: {
    cameraHeight: 0,
    devicePosition: 'back',
    showCamera: true,
  },

  onLoad(options) {
    console.log('onLoad')
    const windowHeight = device.getWindowHeight()
    const cameraHeight = windowHeight - footerHeight + coverHeight
    this.setData({cameraHeight}, () => {
      this.cameraCtx = wx.createCameraContext()
    })

    // wx.BaaS.getWXACode(
    //   'wxacode',
    //   {
    //     path: '/pages/sticker-camera/sticker-camera?sticker_id=5d0b3c16711edc1193970db4&scan_qrcode=1',
    //     width: 250,
    //   },
    //   true
    // ).then(res => {
    //   console.log(res.download_url)
    // })
  },

  onShow() {
    this.selectComponent('#sticker-controller').init()
  },

  onSelect(e) {
    const {sticker} = e.detail
    this.setData({sticker})
  },

  onTakePhoto() {
    this.cameraCtx.takePhoto({
      success: res => {
        const photo = res.tempImagePath
        app.setStickerPhoto(photo)
        app.setStickerImage(this.data.sticker)
        wx.navigateTo({url: '/' + ROUTE.STICKER_CANVAS})
      },
    })
  },

  onChooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: res => {
        console.log('success', res)
        const photo = res.tempFiles[0].path
        app.setStickerPhoto(photo)
        app.setStickerImage(this.data.sticker)
        wx.navigateTo({url: '/' + ROUTE.STICKER_CANVAS + '?source=album'})
      },
      fail: err => {
        console.log('onChooseImage', err)
      },
      complete: () => {
        console.log('onChooseImage complete')
      },
    })
  },

  transDevicePosition() {
    let {devicePosition} = this.data
    devicePosition = devicePosition === 'back' ? 'front' : 'back'
    this.setData({devicePosition})
  },

  onCameraError(e) {
    console.log('onCameraError', e)
    this.setData({showCamera: false})
  },

  onOpenSetting(e) {
    console.log(e)
    if (e.detail.authSetting['scope.camera']) {
      this.setData({showCamera: true}, () => {
        this.cameraCtx = wx.createCameraContext()
      })
    }
  },
})

/**
 * 判断用户是否已经授权某种权限
 * @param {String} key 授权 scope 值
 * 包括 userInfo, userLocation, address, invoiceTitle, werun, record, writePhotosAlbum, camera
 */
function getSetting(key) {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success: res => {
        resolve(res.authSetting[`scope.${key}`])
      },
      fail: reject,
    })
  })
}
