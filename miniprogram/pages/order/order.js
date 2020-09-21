import router from '../../lib/router'
// import device from '../../lib/device'
// import baas from '../../lib/baas'
// import format from '../../lib/format'
// import io from '../../io/index'
import * as constants from '../../config/constants'

const app = getApp()

const simpleClone = obj => JSON.parse(JSON.stringify(obj))

Component({
  properties: {
  },

  data: {
    orderStatus: constants.ORDER_STATUS,
    clothesType: constants.CLOTHES_TYPE,
    orderInfo: app.globalData.orderInfo,
    pageHeaderStyle: '',
  },

  methods: {
    onLoad() {
      this.initOrder()
    },

    initOrder() {
      let orderInfo = simpleClone(app.globalData.orderInfo)
      const formattedProductList = orderInfo.product_list.map(item => {
        item.progress = this.calcProgress(item)
        return item
      })
      orderInfo.product_list = formattedProductList
      // console.log('orderInfo', orderInfo)
      this.setData({
        orderInfo,
      })
    },

    // onPageScroll(e) {
    //   this.setData({
    //     pageHeaderStyle: e.scrollTop > 40 ? 'background-color: #E7E0D6;' : '',
    //   })
    // },

    onScrollerScroll(e) {
      this.setData({
        pageHeaderStyle: e.detail.scrollTop > 40 ? 'background-color: #E7E0D6;' : '',
      })
    },

    calcProgress(product) {
      if (product.status === 'measured') return 15
      else if (product.status === 'booked') return 30
      else if (product.status === 'arrived') return 45
      else if (product.status === 'making') return 60
      else if (product.status === 'send_out' || product.status === 'send_back') {
        if (!product[`${product.status}_count`]) return 65
        else if (product[`${product.status}_count`] <= 5) return (60 + (product[`${product.status}_count`] * 5))
        else if (product[`${product.status}_count`] <= 10) return (85 + ((product[`${product.status}_count`] - 5) * 2))
        else return 95
      }
      else if (product.status === 'delivered') return 100
    },

    handlePhoneCall() {
      wx.makePhoneCall({
        phoneNumber: this.data.orderInfo.store_phone,
      })
    },

    navToTailored() {
      router.push({
        name: 'tailored-detail',
      })
    },
  }
})
