import router from '../../lib/router'
import device from '../../lib/device'
import baas from '../../lib/baas'
import format from '../../lib/format'
import io from '../../io/index'

const app = getApp()

Component({
  properties: {
  },

  data: {
    orderInfo: app.globalData.orderInfo,
    pageHeaderStyle: '',
  },

  methods: {
    onLoad() {
      this.setData({
        orderInfo: app.globalData.orderInfo,
      })
    },

    handlePhoneCall() {
      wx.makePhoneCall({
        phoneNumber: this.data.orderInfo.store_phone,
      })
    },

    onScrollerScroll(e) {
      this.setData({
        pageHeaderStyle: e.detail.scrollTop > 40 ? 'background-color: #E7E0D6;' : '',
      })
    },

    // onPageScroll(e) {
    //   this.setData({
    //     pageHeaderStyle: e.scrollTop > 40 ? 'background-color: #E7E0D6;' : '',
    //   })
    // },
  }
})
