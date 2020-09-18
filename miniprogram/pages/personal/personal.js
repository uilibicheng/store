// pages/personal/personal.js
import io from '../../io/index'
import {ROUTE, PRIZE_TYPE, PARK_MINAPP_ID} from '../../config/constants'
import moment from '../../lib/moment-timezone.js'
import baas from '../../lib/baas'

const app = getApp()
const LOG_TYPE_TAB_LABELS = {
  PROMOTIONAL_BUNDLE: 'promotional_bundle',
  ASSISTANCE: 'assistance',
  LOTTERY: 'lottery',
}
const LOTTERY_PRIZE_TYPE = {
  NORMAL: 'normal',
  DISCOUNT_TICK: 'discount_tick',
}

Page({
  offset: 0,
  limit: 10,
  isLoadingPrizeRedemptionLog: false,
  data: {
    logs: [],
    hasMore: true,
    showPointPolicy: false,
    point: 0,
    promotionalBundlePrize: null,
    isPromotionalBundleRedeemed: true,
    showPromotionalBundleTooltip: false,
    LOG_TYPE_TAB_LABELS,
    selectedLogTab: LOG_TYPE_TAB_LABELS.PROMOTIONAL_BUNDLE,
    statusMap: {
      redeemed: '已兑换',
      closed: '已过期',
      pending: '待兑换',
    },
  },

  onLoad(options) {
    this.options = options
  },

  onShow() {
    let url = `/${ROUTE.PERSONAL}`
    if (this.options.tab) {
      this.setData({
        selectedLogTab:
          this.options.tab === LOG_TYPE_TAB_LABELS.ASSISTANCE
            ? LOG_TYPE_TAB_LABELS.ASSISTANCE
            : LOG_TYPE_TAB_LABELS.LOTTERY,
      })
      url += `?tab=${this.options.tab}`
    }
    this.offset = 0

    if (baas.isAuth()) {
      this.dataInit()
    } else {
      this.setData({showLoginModal: true})
    }
  },

  dataInit() {
    wx.showLoading({
      mask: true,
    })
    return Promise.all([
      this.fetchPrizeRedemptionLog(),
      // this.checkPromotionalBundleRedeemed(),
      // this.getPromotionalBundlePrize(),
    ])
      .catch(err => console.log(err))
      .then(wx.hideLoading)
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

  fetchPrizeRedemptionLog() {
    this.isLoadingPrizeRedemptionLog = true
    let fetchData
    switch (this.data.selectedLogTab) {
      case LOG_TYPE_TAB_LABELS.PROMOTIONAL_BUNDLE:
        fetchData = io.fetchPromotionalBundlePrizeLog
        break
      case LOG_TYPE_TAB_LABELS.ASSISTANCE:
        fetchData = io.fetchPrizeRedemptionLogFromAssistance
        break
      case LOG_TYPE_TAB_LABELS.LOTTERY:
        fetchData = io.fetchPrizeRedemptionLogFromLottery
        break
    }
    return fetchData(this.offset, this.limit)
      .then(res => {
        let logs = res.data.objects
        if (this.offset > 0) {
          logs = this.data.logs.concat(logs)
        }
        this.offset = this.offset + this.limit
        this.isLoadingPrizeRedemptionLog = false
        const hasMore = !!res.data.meta.next
        if (this.data.selectedLogTab === LOG_TYPE_TAB_LABELS.ASSISTANCE) {
          logs.forEach(item => {
            item.valid_date = `${moment(item.valid_from * 1000).format('YYYY.MM.DD HH:mm')} - ${moment(
              item.valid_until * 1000
            ).format('YYYY.MM.DD HH:mm')}`
          })
        }
        this.setData({
          logs,
          hasMore,
        })
      })
      .catch(err => {
        console.log('获取奖品兑换记录列表时错误', err)
        this.isLoadingPrizeRedemptionLog = false
        throw err
      })
  },

  switchTab() {
    wx.redirectTo({
      url: `/${ROUTE.INDEX}`,
    })
  },

  handleNavToOrderList(e) {
    const status = e.currentTarget.dataset.status
    wx.navigateTo({
      url: `/${ROUTE.ORDER_LIST}?status=${status}`,
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.isLoadingPrizeRedemptionLog) {
      this.fetchPrizeRedemptionLog()
    }
  },

  onPullDownRefresh() {
    this.offset = 0
    this.fetchPrizeRedemptionLog().then(wx.stopPullDownRefresh)
  },

  // handleShowPointPolicyAlert() {
  //   this.setData({
  //     showPointPolicy: true,
  //   })
  // },

  // handlePointPolicyAlertConfirm() {
  //   this.setData({
  //     showPointPolicy: false,
  //   })
  // },

  handleLogClick(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/${ROUTE.PRIZE_LOG}?id=${id}`,
    })
  },

  handleLogTabChange(e) {
    const label = e.currentTarget.dataset.label
    if (label !== this.data.selectedLogTab) {
      this.setData({
        logs: [],
        selectedLogTab: label,
        hasMore: true,
      })
      this.offset = 0
      this.fetchPrizeRedemptionLog()
    }
  },

  onShareAppMessage() {
    return {
      title: `日本乐高商店`,
      path: `/${ROUTE.PERSONAL}`,
    }
  },

  handleAssistancePrizeClick(e) {
    wx.showLoading({
      mask: true,
    })
    const prize_redemption_log_id = e.currentTarget.dataset.item.id
    const id = e.currentTarget.dataset.item.prize.related_prize.id
    const utm_source = 'assistance'
    const utm_medium = e.currentTarget.dataset.item.prize.english_name

    io.getTicketBundle(id)
      .then(res => {
        wx.hideLoading()
        if (res.statusCode === 200 && res.data.is_active) {
          let url = `/${ROUTE.TICKET}?id=${id}`
          url += `&prize_redemption_log_id=${prize_redemption_log_id}`
          url += `&utm_source=${utm_source}&utm_medium=${utm_medium}`
          wx.navigateTo({
            url,
          })
        } else {
          wx.showToast({
            title: '奖品相关门票已下架',
            icon: 'none',
          })
        }
      })
      .catch(err => {
        console.log('获取套票信息时错误', err)
        wx.hideLoading()
        wx.showToast({
          title: '奖品相关门票已下架',
          icon: 'none',
        })
        throw err
      })
  },

  handleLotteryPrizeClick(e) {
    wx.showLoading({
      mask: true,
    })
    const data = e.currentTarget.dataset.item
    const prize_redemption_log_id = data.id
    const id = data.prize.related_prize.id
    if (data.prize.related_prize.type === LOTTERY_PRIZE_TYPE.DISCOUNT_TICK) {
      if (data.status === 'expired') {
        wx.hideLoading()
        return
      }
      const utm_source = 'lottery'
      const utm_medium = data.prize.english_name
      io.getTicketBundle(id)
        .then(res => {
          wx.hideLoading()
          if (res.statusCode === 200 && res.data.is_active) {
            let url = `/${ROUTE.TICKET}?id=${id}`
            url += `&prize_redemption_log_id=${prize_redemption_log_id}`
            url += `&utm_source=${utm_source}&utm_medium=${utm_medium}`
            wx.navigateTo({
              url,
            })
          } else {
            wx.showToast({
              title: '奖品相关门票已下架',
              icon: 'none',
            })
          }
        })
        .catch(err => {
          console.log('获取套票信息时错误', err)
          wx.hideLoading()
          wx.showToast({
            title: '奖品相关门票已下架',
            icon: 'none',
          })
          throw err
        })
    } else {
      if (data.status === 'initial') {
        io.getPrize(id)
          .then(() => {
            wx.hideLoading()
            wx.navigateTo({
              url: `/${ROUTE.PRIZE}?id=${id}&prize_redemption_log_id=${prize_redemption_log_id}`,
            })
          })
          .catch(err => {
            console.log('获取奖品信息时错误', err)
            wx.hideLoading()
            wx.showToast({
              title: '相关奖品已下架',
              icon: 'none',
            })
          })
      } else if (data.status === 'redeemed' || data.status === 'expired') {
        wx.hideLoading()
        wx.navigateTo({
          url: `/${ROUTE.PRIZE_LOG}?id=${data.prize.code}`,
        })
      }
    }
  },

  navToLottery() {
    wx.navigateTo({
      url: `/${ROUTE.LOTTERY}`,
    })
  },

  redirectToInfo() {
    wx.redirectTo({
      url: `/${ROUTE.AQUARIUM_INFO}`,
    })
  },

  navToPark() {
    wx.navigateToMiniProgram({
      appId: PARK_MINAPP_ID,
      // envVersion: 'develop',
    })
  },
})
