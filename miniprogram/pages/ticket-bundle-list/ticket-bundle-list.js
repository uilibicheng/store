// pages/ticket-bundle-list/ticket-bundle-list.js
import io from '../../io/index'
import {ROUTE} from '../../config/constants'
const app = getApp()

Page({
  offset: 0,
  limit: 20,
  isLoading: false,
  data: {
    ticketBundles: [],
    hasMore: true,
  },

  onLoad(options) {
    this.dataInit()
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
      .fetchTicketBundle(false, this.offset, this.limit)
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
        console.log('获取套票列表时错误', err)
        this.isLoading = false
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
    wx.navigateTo({
      url: `/${ROUTE.TICKET}?id=${id}`,
    })
  },

  onShareAppMessage() {
    return {
      title: `日本乐高商店`,
      path: `/${ROUTE.TICKET_BUNDLE_LIST}`,
    }
  },
})
