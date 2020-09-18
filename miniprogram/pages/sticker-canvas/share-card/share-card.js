import Wxml2Canvas from '../../../lib/wxml2canvas/index'
import device from '../../../lib/device'

const pixelRatio = device.getPixelRatio()
const windowWidth = device.getWindowWidth()

const cardWidth = device.rpx2px(644)
const destZoom = (windowWidth / cardWidth) * pixelRatio

Component({
  properties: {
    currentUser: {
      type: Object,
      value: {},
    },
    poster: {
      type: String,
      value: '',
      observer: 'drawImage',
    },

    posterHeight: {
      type: Number,
      value: 0,
    },
  },

  data: {
    cardWidth,
    shareCardImg: null,
    disabled: true,
  },

  attached() {
    wx.showLoading({title: '正在生成卡片'})
    this.setSaveBtnEvent()
  },

  methods: {
    setSaveBtnEvent() {
      getSetting('writePhotosAlbum').then(res => {
        let saveBtnEvent = 'openSetting'
        if (res === undefined || res === true) {
          saveBtnEvent = 'saveImage'
        }
        this.setData({saveBtnEvent})
      })
    },
    openSetting() {
      wx.openSetting({
        success: res => {
          if (res.authSetting['scope.writePhotosAlbum']) {
            this.setData({saveBtnEvent: 'saveImage'})
          }
        },
      })
    },

    saveImage() {
      const {shareCardImg} = this.data
      if (!shareCardImg) return

      wx.saveImageToPhotosAlbum({
        filePath: shareCardImg,
        success: res => {
          wx.showToast({
            title: '保存成功',
            icon: 'success',
          })
        },
        fail: err => {
          wx.showToast({
            title: '保存失败',
            icon: 'none',
          })
          this.setSaveBtnEvent()
        },
      })
    },

    drawImage(poster) {
      if (!poster || this.drawing) return
      const {posterHeight} = this.data
      this.drawing = true

      this.drawImage = new Wxml2Canvas({
        width: cardWidth,
        height: device.rpx2px(posterHeight + 330),
        zoom: 1,
        destZoom,
        context: this,
        element: 'canvas',
        background: 'rgba(0, 0, 0, 0)',
        progress(percent) {},
        finish: url => {
          console.log('drawImage finish', url)
          this.setData({shareCardImg: url, disabled: false})
          this.drawing = false
          wx.hideLoading()
        },
        error(err) {
          this.drawing = false
          console.log(err)
          wx.showModal({
            content: '卡片生成失败',
            showCancel: false,
            success: res => {
              if (res.confirm) {
                this.closeShareCard()
              }
            },
          })
        },
      })

      let data = {
        list: [
          {
            type: 'wxml',
            class: '.container .draw',
            limit: '.container',
            x: 0,
            y: 0,
          },
        ],
      }

      this.drawImageTimer = clearTimeout(this.drawImageTimer)
      this.drawImageTimer = setTimeout(() => {
        this.drawImage.draw(data, this)
      }, 200)
    },

    closeShareCard() {
      wx.hideLoading()
      this.triggerEvent('cancel', {}, {})
    },

    noop() {},
  },
})

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
