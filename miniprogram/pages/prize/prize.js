// pages/prize-redemption/prize-redemption.js
import {ROUTE, PRIZE_TYPE} from '../../config/constants'
import io from '../../io/index'
const app = getApp()

Page({
  data: {
    prize: null,
    PRIZE_TYPE,
    // showCard: false,
    showRedeemConfirmation: false,
    pointNotEnoughErrorMsg: '',
    showRedeemFailModal: false,
    point: 0,
    isLotteryPrize: false,
    // 20190618 新需求：用户买了票才能领取优惠大礼
    // 20190620 新需求：要由工作人员点击领取，礼品直接已核销
    // 20190703 新需求：点击兑换按钮时才提示没买票
    showNewUserModal: false,
    redemptionQuantity: 0,
  },

  onLoad(options) {
    this.options = options
    let url = `/${ROUTE.PRIZE}?id=${options.id}`
    if (options.prize_redemption_log_id) {
      url += `&prize_redemption_log_id=${options.prize_redemption_log_id}`
      this.setData({
        isLotteryPrize: true,
      })
    }
    app
      .auth(url)
      .then(this.dataInit)
      .catch(err => console.log(err))
  },

  // onShow() {
  //   if (!this.options.prize_redemption_log_id) this.getPoint()
  // },

  dataInit() {
    wx.showLoading({
      mask: true,
    })
    return Promise.all([this.getPrize()])
      .catch(err => console.log(err))
      .then(wx.hideLoading)
  },

  getPrize() {
    return io.getPrize(this.options.id).then(prize => {
      this.setData({
        prize,
      })

      // 20190618 新需求：用户买了票才能领取优惠大礼
      // 20190620 新需求：要由工作人员点击领取，礼品直接已核销
      // 20190703 新需求：点击兑换按钮时才提示没买票
      if (prize.type === PRIZE_TYPE.PROMOTIONAL_BUNDLE) {
        return io
          .fetchOrder('paid', 0, 100)
          .then(res => {
            let redemptionQuantity = res.data.objects.reduce(
              (acc, cur) => acc + cur.tickets.length,
              0
            )
            this.setData({
              redemptionQuantity
            })
          })
      }

    })
  },

  handleRedeem() {
    this.setData({
      showRedeemConfirmation: false,
    })
    wx.showLoading({
      mask: true,
    })
    let params = {
      prizeId: this.data.prize.id,
    }
    if (this.options.prize_redemption_log_id) params.prize_redemption_log_id = this.options.prize_redemption_log_id
    return io
      .redeemPrize(params)
      .then(res => {
        const log = res.data
        wx.redirectTo({
          url: `/${ROUTE.PRIZE_LOG}?id=${log.id}`,
        })
      })
      .catch(err => {
        if (/积分不够/.test(err.message)) {
          this.setData({
            pointNotEnoughErrorMsg: err.message,
          })
        } else {
          this.handleShowRedeemFailModal()
        }
      })
      .then(wx.hideLoading)
  },

  onShareAppMessage() {
    return {
      title: `我正在日本乐高商店兑换${this.data.prize.name}，快来一起领取吧`,
      path: `/${ROUTE.PRIZE}?id=${this.data.prize.id}`,
      imageUrl: this.data.prize.images[0],
    }
  },

  handleShowRedeemConfirmation() {
    // 20190618 新需求：用户买了票才能领取优惠大礼
    // 20190620 新需求：要由工作人员点击领取，礼品直接已核销
    // 20190703 新需求：点击兑换按钮时才提示没买票
    if (this.data.redemptionQuantity === 0) {
      this.setData({
        showNewUserModal: true,
      })
      return
    }
    if (this.data.prize.type === PRIZE_TYPE.PROMOTIONAL_BUNDLE) {
      this.setData({
        showRedeemConfirmation: true,
      })
      return
    }
    if (this.options.prize_redemption_log_id) this.handleRedeem()

    // if (this.data.prize.type === PRIZE_TYPE.PROMOTIONAL_BUNDLE || this.options.prize_redemption_log_id) {
    //   this.handleRedeem()
    // } else {
    //   this.setData({
    //     showRedeemConfirmation: true,
    //   })
    // }
  },

  // 20190618 新需求：用户买了票才能领取优惠大礼
  // 20190620 新需求：要由工作人员点击领取，礼品直接已核销
  // 20190703 新需求：点击兑换按钮时才提示没买票
  closeNewUserModal() {
    this.setData({
      showNewUserModal: false,
    })
    // wx.navigateBack({
    //   delta: 1
    // })
  },

  closeRedeemConfirmation() {
    this.setData({
      showRedeemConfirmation: false,
    })
  },

  closeNotEnoughErrorModal() {
    this.setData({
      pointNotEnoughErrorMsg: '',
    })
  },

  handleShowRedeemFailModal() {
    this.setData({
      showRedeemFailModal: true,
    })
  },

  closeRedeemFailModal() {
    this.setData({
      showRedeemFailModal: false,
    })
  },
})
