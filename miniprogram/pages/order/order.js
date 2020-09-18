// pages/order/order.js
import io from '../../io/index'
import moment from '../../lib/moment-timezone.js'
import qrcode from '../../lib/wxqrcode.js'
import {ROUTE, REMOTE_FUNCTION, EXCHANGE_RATE} from '../../config/constants'
import pay from '../../utils/pay'

const app = getApp()

Page({
  data: {
    order: null,
    showCancelOrderAlert: false,
    errorMsg: '',
    rmbAmount: 0,
    ticketPolicy: '',
  },

  onLoad(options) {
    this.options = options
    app
      .auth(`/${ROUTE.ORDER}?id=${options.id}`)
      .then(this.dataInit)
      .catch(err => console.log(err))
  },

  dataInit() {
    wx.showLoading({
      mask: true,
    })
    return Promise.all([this.getOrder(this.options.id)])
      .catch(err => console.log(err))
      .then(wx.hideLoading)
  },

  getOrder(id) {
    return io
      .getOrder(id)
      .then(res => {
        let order = res.data
        order.reservation_date = moment(order.reservation_date)
          .tz('Asia/Tokyo')
          .format('YYYY-MM-DD')
        order.created_at = moment(order.created_at * 1000)
          .tz('Asia/Tokyo')
          .format('YYYY-MM-DD HH:mm:ss')
        if (order.status === 'paid') {
          order.tickets = order.tickets.map(ticket => {
            if (ticket.barcode) {
              ticket.qrcode = qrcode.createQrCodeImg(ticket.barcode, 300)
            }
            return ticket
          })
        }
        this.getTicketBundle(order.ticket_skus[0].split('-')[0])
        this.setData({
          order,
          rmbAmount: Math.round(order.amount * EXCHANGE_RATE * 100) / 100,
        })
      })
      .catch(err => {
        console.log('获取订单时错误', err)
        this.setData({
          errorMsg: '获取订单详情错误',
        })
        throw err
      })
  },

  getTicketBundle(id) {
    return io.getTicketBundle(id).then(res => {
      this.setData({
        ticketPolicy: res.data.ticket_policy,
      })
    })
  },

  closeErrorAlert() {
    this.setData({
      errorMsg: '',
    })
  },

  handleCancelOrderClick(e) {
    this.setData({
      showCancelOrderAlert: true,
    })
  },

  handleCancelOrderAlertCancel() {
    this.setData({
      showCancelOrderAlert: false,
    })
  },

  handleCancelOrderAlertConfirm() {
    this.setData({
      showCancelOrderAlert: false,
    })
    this.cancelOrder(this.data.order.id).then(() => this.dataInit())
  },

  cancelOrder(orderId) {
    return wx.BaaS.invokeFunction(REMOTE_FUNCTION.CANCEL_ORDER, {
      isDev: app.isDev,
      orderId: orderId,
    })
      .then(res => {
        if (res.error && res.error.message) {
          throw res.error
        }
      })
      .catch(err => {
        console.log('订单取消失败', err)
        if (err.message) {
          this.setData({
            errorMsg: '订单取消失败',
          })
        }
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
          this.getOrder(this.options.id)
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

  onPullDownRefresh() {
    this.getOrder(this.options.id).then(wx.stopPullDownRefresh)
  },
})
