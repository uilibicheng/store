import router from '../../lib/router'
import device from '../../lib/device'
import baas from '../../lib/baas'
import format from '../../lib/format'
import io from '../../io/index'
import * as constants from '../../config/constants'

const app = getApp()

const simpleClone = obj => JSON.parse(JSON.stringify(obj))

const sortType = {
  contact_name_spelling: 'contact_name_spelling',
  created_at: 'created_at',
}
const sortMode = {
  descending: 'descending',
  ascending: 'ascending',
}

let _getBusinessOrderLocked = false
let _timeoutTimer

Component({
  properties: {
  },

  data: {
    statusBarHeight: device.getStatusBarHeight(),
    navBarHeight: device.getNavbarHeight(),
    orderStatusType: constants.ORDER_STATUS,
    clothesType: constants.CLOTHES_TYPE,
    orderStatusList: constants.ORDER_STATUS_LIST,
    showStatusSelector: false,
    refreshTriggered: false,
    orderList: [],
    orderOffset: 0,
    searchText: '',
    orderSortType: sortType.created_at,
    orderSortMode: sortMode.descending,
    orderStatus: constants.ORDER_STATUS_LIST[0],

    storeInfo: null,
    showRelateOrderModal: false,
    relateOrderObj: null,
    relateOrderQRCode: '',

    showModifyOrderModal: false,
    modifiedOrderObj: null,
    modifiedOrderObjIndex: 0,
    orderStatusListPicker: constants.ORDER_STATUS_LIST_PICKER,
    orderStatusListIndex: {
      measured: 0,
      booked: 1,
      arrived: 2,
      making: 3,
      send_out: 4,
      send_back: 5,
      delivered: 6,
    },
  },

  methods: {
    onLoad() {
      this.getOrderList()
      this.getUserStoreInfo()
    },

    onShow() {
      if (app.globalData.modifiedOrderInfo) {
        wx.showLoading({mask: true})
        let orderList = simpleClone(this.data.orderList)
        let modifiedOrderInfo = simpleClone(app.globalData.modifiedOrderInfo)
        modifiedOrderInfo.created_at_format = format.formatDate(modifiedOrderInfo.created_at, 'YYYY-MM-DD')
        modifiedOrderInfo.show_all_item = orderList[app.globalData.orderInfoIndex].show_all_item
        orderList.splice(app.globalData.orderInfoIndex, 1, modifiedOrderInfo)
        this.setData({
          orderList,
        })
        app.globalData.modifiedOrderInfo = null
        wx.hideLoading()
      }
    },

    getUserStoreInfo() {
      const uid = baas.getUid()
      return io.getUserStoreInfo(uid).then(res => {
        this.setData({
          storeInfo: res.data.objects[0],
        })
      })
    },

    getOrderList() {
      _getBusinessOrderLocked = true
      const {orderOffset, searchText, orderSortType, orderSortMode, orderStatus} = this.data
      let params = {
        uid: baas.getUid(),
        offset: orderOffset,
        order_by: (orderSortMode === sortMode.descending ? '-' : '') + orderSortType,
      }
      if (searchText) params.search_text = searchText
      if (orderStatus.value) params.status = orderStatus.value
      return io.getStoreOrderList(params).then(res => {
        const dataList = res.data.objects.map(item => {
          item.created_at_format = format.formatDate(item.created_at, 'YYYY-MM-DD')
          item.show_all_item = false
          return item
        })
        this.setData({
          orderList: orderOffset === 0 ? dataList : this.data.orderList.concat(dataList),
          refreshTriggered: false,
        }, () => {
          _getBusinessOrderLocked = !res.data.meta.next
        })
      })
    },

    onRefresh() {
      console.log('onRefresh')
      this.setData({
        orderOffset: 0,
      }, this.getOrderList)
    },

    onScrollToLower() {
      if (_getBusinessOrderLocked) return
      _getBusinessOrderLocked = true
      console.log('onScrollToLower')
      this.setData({
        orderOffset: this.data.orderOffset + 20,
      }, this.getOrderList)
    },

    handleOrderTypeChange(e) {
      const {type} = e.currentTarget.dataset
      if (type === this.data.orderSortType) {
        this.setData({
          orderOffset: 0,
          orderSortMode: this.data.orderSortMode === sortMode.descending
            ? sortMode.ascending : sortMode.descending,
        }, this.getOrderList)
      } else {
        this.setData({
          orderOffset: 0,
          orderSortType: type,
        }, this.getOrderList)
      }
    },

    handleShowStatusSelector() {
      const {showStatusSelector} = this.data
      this.setData({
        showStatusSelector: !showStatusSelector,
      })
    },

    handleOrderStatusSelected(e) {
      const {status} = e.currentTarget.dataset
      this.setData({
        orderOffset: 0,
        orderStatus: status,
        showStatusSelector: false,
      }, this.getOrderList)
    },

    handleSearchOrder(e) {
      const {value} = e.detail
      this.setData({
        orderOffset: 0,
        searchText: value.trim()
      }, this.getOrderList)
    },

    showOrderAllItem(e) {
      const targetIndex = e.currentTarget.dataset.index
      let orderList = simpleClone(this.data.orderList)
      orderList[targetIndex].show_all_item = true
      this.setData({
        orderList,
      })
    },

    navToOrderDetail(e) {
      const targetIndex = e.currentTarget.dataset.index
      let orderInfo = simpleClone(this.data.orderList[targetIndex])
      app.globalData.orderInfo = orderInfo
      app.globalData.orderInfoIndex = targetIndex
      router.push({
        name: 'business-order',
      })
    },

    showOrderQRCode(e) {
      const targetIndex = e.currentTarget.dataset.index
      const {orderList} = this.data
      let relateOrderObj = simpleClone(orderList[targetIndex])

      const qrcodeParams = {
        scene: relateOrderObj.batch_no,
        page: 'pages/index/index',
        is_hyaline: true,
      }
      wx.showLoading({mask: true})
      wx.BaaS.getWXACode('wxacodeunlimit', qrcodeParams).then(res => {
        this.setData({
          relateOrderQRCode: res.image,
          relateOrderObj,
          showRelateOrderModal: true,
        })
        wx.hideLoading()
        if (!orderList[targetIndex].related_at) {
          this.checkOrderRelateStatus(orderList[targetIndex].id, targetIndex)
        }
      })
    },

    checkOrderRelateStatus(id, index) {
      _timeoutTimer = setTimeout(() => {
        io.getStoreOrder(id).then(res => {
          if (res.data.related_at) {
            this.hideRelateOrderModal(res.data, index)
          } else {
            this.checkOrderRelateStatus(id, index)
          }
        })
      }, 3000)
    },

    hideRelateOrderModal(order, index) {
      if (_timeoutTimer) clearTimeout(_timeoutTimer)
      this.setData({
        showRelateOrderModal: false,
        relateOrderObj: null,
        relateOrderQRCode: '',
      })
      if (order && order.related_at) {
        // order.created_at_format = format.formatDate(order.created_at, 'YYYY-MM-DD')
        // order.show_all_item = orderList[index].show_all_item
        // let orderList = simpleClone(this.data.orderList)
        // orderList.splice(index, 1, order)
        // this.setData({
        //   orderList,
        // })
        wx.showModal({
          title: '订单关联成功',
          content: '同批次创建订单已关联客户，点击确定刷新订单列表',
          confirmColor: '#8C7565',
          cancelColor: '#bbbbbb',
          success: res => {
            if (res.confirm) {
              this.onRefresh()
            }
          },
        })
      }
    },

    handleMakePhoneCall(e) {
      const {tel} = e.currentTarget.dataset
      wx.makePhoneCall({
        phoneNumber: tel,
      })
    },

    handleModifyOrderShow(e) {
      const targetIndex = e.currentTarget.dataset.index
      this.setData({
        showModifyOrderModal: true,
        modifiedOrderObj: simpleClone(this.data.orderList[targetIndex]),
        modifiedOrderObjIndex: targetIndex,
      })
    },

    hideModifyOrderModal() {
      this.setData({
        showModifyOrderModal: false,
        modifiedOrderObj: null,
        modifiedOrderObjIndex: 0,
      })
    },

    handleModifyStoreNoteInput(e) {
      const {value} = e.detail
      let modifiedOrderObj = simpleClone(this.data.modifiedOrderObj)
      modifiedOrderObj.store_note = value
      this.setData({
        modifiedOrderObj,
      })
    },

    handleModifyOrderStatus(e) {
      const valueIndex = e.detail.value * 1
      const productIndex = e.currentTarget.dataset.productIndex
      const {orderStatusListPicker} = this.data
      let modifiedOrderObj = simpleClone(this.data.modifiedOrderObj)
      modifiedOrderObj.product_list[productIndex].status = orderStatusListPicker[valueIndex].value
      const status = modifiedOrderObj.product_list[productIndex].status
      if ((status === 'send_out' || status === 'send_back') &&
        !modifiedOrderObj.product_list[productIndex][status + '_count']) {
          modifiedOrderObj.product_list[productIndex][status + '_count'] = 1
        }
      this.setData({
        modifiedOrderObj,
      })
    },

    addStatusCount(e) {
      const productIndex = e.currentTarget.dataset.productIndex
      let modifiedOrderObj = simpleClone(this.data.modifiedOrderObj)
      const status = modifiedOrderObj.product_list[productIndex].status
      if (!modifiedOrderObj.product_list[productIndex][status + '_count']) {
        modifiedOrderObj.product_list[productIndex][status + '_count'] = 2
      } else {
        modifiedOrderObj.product_list[productIndex][status + '_count']++
      }
      this.setData({
        modifiedOrderObj,
      })
    },

    minusStatusCount(e) {
      const productIndex = e.currentTarget.dataset.productIndex
      let modifiedOrderObj = simpleClone(this.data.modifiedOrderObj)
      const status = modifiedOrderObj.product_list[productIndex].status
      if (modifiedOrderObj.product_list[productIndex][status + '_count'] === 1 || 
        !modifiedOrderObj.product_list[productIndex][status + '_count']) return
      modifiedOrderObj.product_list[productIndex][status + '_count']--
      this.setData({
        modifiedOrderObj,
      })
    },

    submitModifyOrder() {
      console.log('submit', this.data.modifiedOrderObj)
      wx.showLoading({mask: true})

      wx.BaaS.invoke(
        constants.REMOTE_FUNCTION.modify_order,
        {modified_order: this.data.modifiedOrderObj}
      ).then(res => {
        if (res.code === 0) {
          let orderList = simpleClone(this.data.orderList)
          res.data.created_at_format = format.formatDate(res.data.created_at, 'YYYY-MM-DD')
          res.data.show_all_item = orderList[this.data.modifiedOrderObjIndex].show_all_item
          orderList.splice(this.data.modifiedOrderObjIndex, 1, res.data)
          this.setData({
            orderList,
          })
          wx.showToast({
            title: '修改成功',
            mask: true,
          })
          this.hideModifyOrderModal()
          wx.hideLoading()
        } else {
          wx.showToast({
            title: res.error.message,
            icon: 'none',
            mask: true,
          })
          wx.hideLoading()
        }
      })
      .catch(err => {
        wx.hideLoading()
        console.log(err)
      })
    },

    noop() {},
  }
})
