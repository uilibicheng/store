import router from '../../lib/router'
import device from '../../lib/device'
import baas from '../../lib/baas'
import format from '../../lib/format'
import io from '../../io/index'
import * as constants from '../../config/constants'

const app = getApp()

const simpleClone = obj => JSON.parse(JSON.stringify(obj))

Component({
  properties: {
  },

  data: {
    isIpx: false,
    articleInfo: null,
    showModal: false,
  },

  methods: {
    onLoad() {
      let articleInfo = simpleClone(app.globalData.articleInfo)
      articleInfo.description = articleInfo.description.replace(/<img/g, '<img style="width: 100%; height: auto;"')
      articleInfo.description = articleInfo.description.replace(/rgb\(255, 255, 255\)/g, 'rgba(255, 255, 255, 0)')
      articleInfo.description = articleInfo.description.replace(/<p/g, '<p style="margin-bottom: 16px;"')
      console.log(articleInfo)
      this.setData({
        isIpx: device.isIpx(),
        articleInfo,
      })
    },

    showStoreDataModal() {
      this.setData({
        showModal: true,
      })
    },

    hideModal() {
      this.setData({
        showModal: false,
      })
    },

    handlePhoneCall() {
      wx.makePhoneCall({
        phoneNumber: this.data.articleInfo.store_data.phone,
      })
    },

    handleCopyLink(e) {
      const {url} = e.currentTarget.dataset
      wx.setClipboardData({
        data: url,
      })
    },

    handleNavToMiniapp(e) {
      console.log('handleNavToMiniapp')
      const {url} = e.currentTarget.dataset
      wx.navigateToMiniProgram({
        appId: url,
      })
    },
  }
})
