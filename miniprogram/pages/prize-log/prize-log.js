// pages/prize-log/prize-log.js
import {ROUTE, PRIZE_TYPE} from '../../config/constants'
import io from '../../io/index'
import moment from '../../lib/moment-timezone.js'
// import CanvasUtils from '../../lib/canvas_utils.js'
import barcode from '../../lib/barcode/index.js'
const app = getApp()

Page({
  data: {
    log: null,
    prize: null,
    PRIZE_TYPE,
    logStatus: {
      pending: '待兑换',
      redeemed: '已兑换',
      closed: '已过期',
    },
    isLotteryPrize: false,
  },

  onLoad(options) {
    this.options = options
    app
      .auth(`/${ROUTE.PRIZE_LOG}?id=${options.id}`)
      .then(this.dataInit)
      .catch(err => console.log(err))
  },

  // onShow: function() {
  //   wx.getSetting({
  //     success: res => {
  //       if (res.authSetting['scope.writePhotosAlbum'] == undefined) {
  //         this.setData({authStatus: 0})
  //       } else {
  //         this.setData({authStatus: res.authSetting['scope.writePhotosAlbum'] ? 1 : 2})
  //       }
  //     },
  //   })
  //   const info = wx.getLaunchOptionsSync()
  //   this.setData({
  //     isReferrer: !!info.referrerInfo.appId && info.referrerInfo.appId === GAME_MINAPP_ID,
  //   })
  // },

  dataInit() {
    wx.showLoading({
      mask: true,
    })
    return Promise.all([this.getPrizeRedemptionLog()])
      .catch(err => console.log(err))
      .then(wx.hideLoading)
  },

  getPrizeRedemptionLog() {
    return io.getPrizeRedemptionLog(this.options.id).then(log => {
      barcode.barcode('barcode', log.redemption_code, 340, 100)
      log.valid_time = moment((log.created_at + 86400) * 1000)
        .tz('Asia/Tokyo')
        .format('YYYY-MM-DD HH:mm')
      log.created_time = moment(log.created_at * 1000)
        .tz('Asia/Tokyo')
        .format('YYYY-MM-DD HH:mm')
      this.setData({
        log,
        prize: log.prize,
      })
      if (log.prize_redemption_log_id) {
        this.setData({
          isLotteryPrize: true,
        })
      }
      if (log.type === PRIZE_TYPE.PROMOTIONAL_BUNDLE) {
        return this.getPrize(log.prize.id)
      }
    })
  },

  getPrize(id) {
    return io.getPrize(id).then(prize => {
      this.setData({
        prize,
      })
    })
  },

  onShareAppMessage() {
    return {
      title: `我在日本乐高商店兑换了${this.data.prize.name}，快来一起领取吧`,
      path: `/${ROUTE.PRIZE}?id=${this.data.prize.id}`,
      imageUrl: this.data.prize.images[0],
    }
  },

  // navigateBackMiniProgram() {
  //   wx.navigateBackMiniProgram({})
  // },
})
