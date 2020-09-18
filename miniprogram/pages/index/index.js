// index.js
import io from '../../io/index'
import {ROUTE, PRIZE_TYPE, PARK_MINAPP_ID} from '../../config/constants'
const app = getApp()

Page({
  data: {
    ticketBundles: [],
    settings: {},
    promotionalBundlePrize: null,
    isPromotionalBundleRedeemed: true,
    showPromotionalBundleTooltip: false,
    lotterySettings: {},
  },

  onLoad() {
    this.dataInit()
  },

  dataInit() {
    wx.showLoading({
      mask: true,
    })
    return Promise.all([this.fetchTicketBundle(), this.getSettings(), this.getLotterySettings()])
      .catch(err => console.log(err))
      .then(wx.hideLoading)
  },

  onShow() {
    this.checkPromotionalBundleRedeemed().catch(err => console.log(err))
    this.getPromotionalBundlePrize().catch(err => console.log(err))
  },

  checkPromotionalBundleRedeemed() {
    return io
      .checkPromotionalBundleRedeemed()
      .then(isRedeemed =>
        this.setData({
          isPromotionalBundleRedeemed: isRedeemed,
        })
      )
      .catch(err => {
        console.log('判断是否已兑换优惠大礼包时错误', err)
        throw err
      })
  },

  handleCloseTooltip() {
    this.setData({
      showPromotionalBundleTooltip: false,
    })
  },

  fetchTicketBundle() {
    return io
      .fetchTicketBundle(false)
      .then(res =>
        this.setData({
          ticketBundles: res.data.objects,
        })
      )
      .catch(err => {
        console.log('获取套票列表时错误', err)
        throw err
      })
  },

  getPromotionalBundlePrize() {
    return io
      .fetchPrize(PRIZE_TYPE.PROMOTIONAL_BUNDLE)
      .then(res => {
        if (!res.data.objects.length) {
          throw new Error('优惠大礼包未找到')
        }
        if (res.data.objects[0].total_count - res.data.objects[0].redeemed_count <= 0) {
          throw new Error('优惠大礼包已无库存')
        }
        this.setData({
          promotionalBundlePrize: res.data.objects[0],
          showPromotionalBundleTooltip: true,
        })
      })
      .catch(err => {
        this.setData({
          showPromotionalBundleTooltip: false,
        })
        console.log('获取优惠大礼包时错误', err)
        throw err
      })
  },

  handleRedeemPromotionalBundle() {
    wx.navigateTo({
      url: `/${ROUTE.PRIZE}?id=${this.data.promotionalBundlePrize.id}`,
    })
  },

  getSettings() {
    return io
      .getSettings()
      .then(res =>
        this.setData({
          settings: res.data,
        })
      )
      .catch(err => {
        console.log('获取配置信息时错误', err)
        throw err
      })
  },

  getLotterySettings() {
    return io
      .getLotterySettings()
      .then(res =>
        this.setData({
          lotterySettings: res.data,
        })
      )
      .catch(err => {
        console.log('获取配置信息时错误', err)
        throw err
      })
  },

  navToTicket(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/${ROUTE.TICKET}?id=${id}`,
    })
  },

  handleBannerClick(e) {
    let url = e.currentTarget.dataset.url
    if (!/^\//.test(url)) {
      url = '/' + url
    }
    wx.navigateTo({url: url.trim()})
  },

  redirectToPersonal() {
    wx.redirectTo({
      url: `/${ROUTE.PERSONAL}`,
    })
  },

  redirectToInfo() {
    wx.redirectTo({
      url: `/${ROUTE.AQUARIUM_INFO}`,
    })
  },

  handleViewMoreTicket() {
    wx.navigateTo({
      url: `/${ROUTE.TICKET_BUNDLE_LIST}`,
    })
  },

  navToLottery() {
    wx.navigateTo({
      url: `/${ROUTE.LOTTERY}`,
    })
  },

  onPullDownRefresh() {
    this.dataInit().then(wx.stopPullDownRefresh)
  },

  onShareAppMessage() {
    return {
      title: `日本乐高商店`,
      path: `/${ROUTE.INDEX}`,
    }
  },

  navToPark() {
    wx.navigateToMiniProgram({
      appId: PARK_MINAPP_ID,
      // envVersion: 'develop',
    })
  },
})
