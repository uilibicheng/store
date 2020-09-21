import router from '../../lib/router'
import device from '../../lib/device'
// import baas from '../../lib/baas'
import format from '../../lib/format'
import io from '../../io/index'
import * as constants from '../../config/constants'

const app = getApp()

let _getOrderListLocked = false

Component({
  properties: {
  },

  data: {
    statusBarHeight: device.getStatusBarHeight(),
    navBarHeight: device.getNavbarHeight(),
    orderStatus: constants.ORDER_STATUS,
    clothesType: constants.CLOTHES_TYPE,
    autoFocus: false,
    orderList: [],
    orderOffset: 0,
    searchText: '',
    refreshTriggered: false,
  },

  methods: {
    onLoad() {
      this.getOrderList()
    },

    onShow() {
      if (app.globalData.autoFocus) {
        this.setData({
          autoFocus: true,
        })
        app.globalData.autoFocus = false
      }
    },

    onHide() {
      this.setData({
        autoFocus: false,
      })
    },

    onRefresh() {
      console.log('onRefresh')
      this.setData({
        orderList: [],
        orderOffset: 0,
      }, this.getOrderList)
    },

    onScrollToLower() {
      console.log('order-list onScrollToLower')
      if (_getOrderListLocked) return
      _getOrderListLocked = true
      console.log('order-list onScrollToLower a')
      this.getOrderList()
    },

    getOrderList() {
      _getOrderListLocked = true
      wx.showLoading({mask: true})
      const {orderOffset, searchText} = this.data
      let params = {
        offset: orderOffset,
      }
      if (searchText) params.search_order_num = searchText
      return io.getUserOrderList(params).then(res => {
        const dataList = res.data.objects.map(item => {
          item.created_at_format = format.formatDate(item.created_at, 'YYYY-MM-DD')
          item.show_all_item = false
          return item
        })
        this.setData({
          orderList: orderOffset === 0 ? dataList : this.data.orderList.concat(dataList),
          orderOffset: orderOffset + 20,
          refreshTriggered: false,
        }, () => {
          _getOrderListLocked = !res.data.meta.next
          wx.hideLoading()
        })
      })
    },

    showOrderAllItem(e) {
      const targetIndex = e.currentTarget.dataset.index
      let orderList = [...this.data.orderList]
      orderList[targetIndex].show_all_item = true
      this.setData({
        orderList,
      })
    },

    handleSearchOrder(e) {
      const {value} = e.detail
      this.setData({
        orderOffset: 0,
        searchText: value.trim()
      }, this.getOrderList)
    },

    navToOrderDetail(e) {
      const {index} = e.currentTarget.dataset
      app.globalData.orderInfo = this.data.orderList[index]
      router.push({
        name: 'order',
      })
    },
  }
})
