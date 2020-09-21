import device from '../../lib/device'
import Wxml2Canvas from './wxml2canvas/index'

const cardWidth = device.rpx2px(622)
const cardHeight = device.rpx2px(864)

Component({
  properties: {
    qrcode: {
      type: String,
      value: '',
    },
    shareCardContent: {
      type: Array,
      value: [],
    },
  },

  data: {
    cardWidth,
    cardHeight,
    shareCardImg: null,
    disabled: true,
  },

  attached() {
    wx.showLoading({title: '正在生成卡片'})
    this.drawImage()
  },

  methods: {
    saveImage() {
      const {shareCardImg} = this.data
      console.log('saveImage', shareCardImg)
      wx.showToast({
        title: '保存成功',
        icon: 'success',
      })
      this.hidePoster()

      // wx.saveImageToPhotosAlbum({
      //   filePath: shareCardImg,
      //   success(res) {
      //     wx.showToast({
      //       title: '保存成功',
      //       icon: 'success',
      //     })
      //   },
      //   fail() {
      //     wx.showToast({
      //       title: '保存失败',
      //       icon: 'none',
      //     })
      //   },
      // })
    },

    saveImageFail() {
      wx.showToast({
        title: '保存失败',
        icon: 'none',
      })
    },

    drawImage() {
      if (this.drawing) return
      this.drawing = true

      this.drawImage = new Wxml2Canvas({
        width: cardWidth,
        height: cardHeight,
        zoom: 1,
        context: this,
        element: 'canvas',
        background: '#F12922',
        progress(percent) {
          console.log('progress', percent)
        },
        finish: url => {
          console.log('drawImage finish', url)
          this.setData({
            saveImageParams: {
              filePath: url,
            },
            shareCardImg: url,
            disabled: false,
          })
          this.drawing = false
          wx.hideLoading()
          const drawEnd = +new Date()
          console.log('drawTime:', drawEnd - this.drawStart, 'ms')
        },
        error(err) {
          this.drawing = false
          wx.hideLoading()
          console.log(err)
          wx.showModal({
            content: '卡片生成失败',
            showCancel: false,
            success: res => {
              if (res.confirm) {
                this.hidePoster()
              }
            },
          })
        },
      })

      const data = {
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
        this.drawStart = +new Date()
        console.log('drawStart:', this.drawStart)
        this.drawImage.draw(data, this)
      }, 200)
    },

    hidePoster() {
      wx.hideLoading()
      this.triggerEvent('hide', {}, {})
    },

    noop() {},
  },
})
