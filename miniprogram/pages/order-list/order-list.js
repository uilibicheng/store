// pages/order-list/order-list.js
import io from '../../io/index'
import moment from '../../lib/moment-timezone.js'
import {ROUTE} from '../../config/constants'
import pay from '../../utils/pay'
const app = getApp()

Page({
  offset: 0,
  limit: 10,
  status: 'all',
  isLoading: false,
  errorMsg: '',
  data: {
    orders: [],
    hasMore: true,
  },

  onLoad(options) {
    this.status = options.status
  },

  onShow() {
    this.offset = 0
    app
      .auth(`/${ROUTE.ORDER_LIST}?status=${this.status || 'all'}`)
      .then(this.dataInit)
      .catch(err => console.log(err))
  },

  dataInit() {
    wx.showLoading({
      mask: true,
    })
    return Promise.all([this.fetchOrder()])
      .catch(err => console.log(err))
      .then(wx.hideLoading)
  },

  fetchOrder() {
    this.isLoading = true
    return io
      .fetchOrder(this.status, this.offset, this.limit)
      .then(res => {
        let orders = res.data.objects.map(order => {
          order.reservation_date = moment(order.reservation_date)
            .tz('Asia/Tokyo')
            .format('YYYY-MM-DD')
          return order
        })
        if (this.offset > 0) {
          orders = this.data.orders.concat(orders)
        }
        this.offset = this.offset + this.limit
        this.isLoading = false
        this.setData({
          orders,
          hasMore: !!res.data.meta.next,
        })
      })
      .catch(err => {
        console.log('获取订单列表时错误', err)
        this.isLoading = false
        throw err
      })
  },

  closeErrorAlert() {
    this.setData({
      errorMsg: '',
    })
  },

  navToOrderDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/${ROUTE.ORDER}?id=${id}`,
    })
  },

  handlePay(e) {
    const order = e.currentTarget.dataset.order
    wx.showLoading({
      mask: true,
    })
    return pay(order.id, order.tickets, order.tickets[0].bundle_name, order.amount)
      .then(() => {
        wx.showLoading({
          mask: true,
        })
        setTimeout(() => {
          this.offset = 0
          this.fetchOrder()
            .then(wx.hideLoading)
            .catch(wx.hideLoading)
        }, 1000)
      })
      .catch(err => {
        if (/payment\scancelled/.test(err.message)) {
          this.setData({
            errorMsg: '',
          })
        } else {
          this.setData({
            errorMsg: '付款失败',
          })
        }
        console.log(err)
      })
      .then(wx.hideLoading)
  },

  onReachBottom() {
    if (this.data.hasMore && !this.isLoading) {
      this.fetchOrder()
    }
  },

  onPullDownRefresh() {
    this.offset = 0
    this.fetchOrder().then(wx.stopPullDownRefresh)
  },
})
