// pages/discount-ticket-list/discount-ticket-list.js
import io from '../../io/index'
import {ROUTE} from '../../config/constants'
const app = getApp()

Page({
  offset: 0,
  limit: 10,
  isLoading: false,
  data: {
    ticketBundles: [],
    hasMore: true,
  },

  onLoad(options) {
    app
      .auth(`/${ROUTE.DISCOUNT_TICKET_LIST}`)
      .then(this.dataInit)
      .catch(err => console.log(err))
  },

  dataInit() {
    wx.showLoading({
      mask: true,
    })
    return Promise.all([this.fetchTicketBundle()])
      .catch(err => console.log(err))
      .then(wx.hideLoading)
  },

  fetchTicketBundle() {
    this.isLoading = true
    return io
      .fetchTicketBundle(true, this.offset, this.limit)
      .then(res => {
        let ticketBundles = res.data.objects
        if (this.offset > 0) {
          ticketBundles = this.data.ticketBundles.concat(ticketBundles)
        }
        this.offset = this.offset + this.limit
        this.isLoading = false
        this.setData({
          ticketBundles,
          hasMore: !!res.data.meta.next,
        })
      })
      .catch(err => {
        this.isLoading = false
        console.log('获取套票列表时错误', err)
        throw err
      })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.isLoading) {
      this.fetchTicketBundle()
    }
  },

  onPullDownRefresh() {
    this.offset = 0
    this.fetchTicketBundle().then(wx.stopPullDownRefresh)
  },

  navToTicket(e) {
    const id = e.currentTarget.dataset.id
    const utm_source = 'share'
    wx.navigateTo({
      url: `/${ROUTE.TICKET}?id=${id}&utm_source=${utm_source}`,
    })
  },

  navToIndex() {
    wx.reLaunch({
      url: `/${ROUTE.INDEX}`,
    })
  },
})
