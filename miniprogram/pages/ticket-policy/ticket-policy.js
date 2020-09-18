// pages/ticket-policy/ticket-policy.js
import io from '../../io/index'
import wxParser from '../../lib/wxParser/index'

Page({
  data: {
    ticketPolicy: {},
  },

  onLoad(options) {
    this.options = options
    this.dataInit()
  },

  dataInit() {
    const id = this.options.id
    wx.showLoading({
      mask: true,
    })
    return Promise.all([this.getTicketBundle(id)])
      .catch(err => console.log(err))
      .then(wx.hideLoading)
  },

  getTicketBundle(bundleId) {
    return io
      .getTicketBundle(bundleId)
      .then(res => {
        wxParser.parse({
          bind: 'ticketPolicy',
          html: res.data.ticket_policy,
          target: this,
          enablePreviewImage: false,
        })
      })
      .catch(err => {
        console.log('获取套票信息时错误', err)
        throw err
      })
  },
})
