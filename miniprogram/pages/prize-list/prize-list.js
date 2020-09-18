// pages/prize-list/prize-list.js
import io from '../../io/index'
import {ROUTE, PRIZE_TYPE} from '../../config/constants'
const app = getApp()

Page({
  offset: 0,
  limit: 10,
  isLoading: false,
  data: {
    prizes: [],
    hasMore: true,
    showRedemptionAlert: false,
    point: 0,
  },

  onLoad(options) {
    app
      .auth(`/${ROUTE.PRIZE_LIST}`)
      .then(this.dataInit)
      .catch(err => console.log(err))
  },

  onShow() {
    this.getPoint()
  },

  dataInit() {
    wx.showLoading({
      mask: true,
    })
    return Promise.all([this.fetchPrize()])
      .catch(err => console.log(err))
      .then(wx.hideLoading)
  },

  fetchPrize() {
    this.isLoading = true
    return io
      .fetchPrize(PRIZE_TYPE.NORMAL, this.offset, this.limit)
      .then(res => {
        let prizes = res.data.objects
        if (this.offset > 0) {
          prizes = this.data.prizes.concat(prizes)
        }
        this.offset = this.offset + this.limit
        this.isLoading = false
        this.setData({
          prizes,
          hasMore: !!res.data.meta.next,
        })
      })
      .catch(err => {
        this.isLoading = false
        console.log('获取奖品列表时错误', err)
        throw err
      })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.isLoading) {
      this.fetchPrize()
    }
  },

  onPullDownRefresh() {
    this.offset = 0
    this.fetchPrize().then(wx.stopPullDownRefresh)
  },

  handleRedeem(e) {
    wx.showLoading({
      mask: true,
    })
    const id = e.currentTarget.dataset.id
    const limitation = e.currentTarget.dataset.limitation
    io.checkOverLimit(id, limitation)
      .then(result => {
        if (!result) {
          wx.navigateTo({
            url: `/${ROUTE.PRIZE}?id=${id}`,
          })
        } else {
          this.setData({
            showRedemptionAlert: true,
          })
        }
      })
      .catch(err => console.log(err))
      .then(wx.hideLoading)
  },

  handleRedemptionAlertConfirm() {
    this.setData({
      showRedemptionAlert: false,
    })
  },

  onShareAppMessage() {
    return {
      title: `日本乐高商店`,
      path: `/${ROUTE.PRIZE_LIST}`,
    }
  },
})
