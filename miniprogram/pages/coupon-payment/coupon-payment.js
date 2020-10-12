import io from '../../io/index'
import {timestampToTime} from '../../utils/common'

Page({
  data: {
    paymentInfo: {},
    count: 1,
    phone: '',
    bindPhone: '',
  },

  onLoad(params) {
    this.getCurrentUser()
    if (params.id) {
      if (params.type === 'coupon') {
        this.getCouponDetail(params.id)
      } else if (params.type === 'package') {
        this.getPackagesDetail(params.id)
      }
    }
  },

  getCurrentUser() {
    wx.BaaS.auth.getCurrentUser().then(user => {
      let phone = user._attribute.phone || ''
      this.setData({
        phone,
        bindPhone: phone,
      })
    })
  },

  getCouponDetail(id) {
    return io.getCouponDetail(id).then(res => {
      let paymentInfo = res.data
      paymentInfo.startTime = timestampToTime(paymentInfo.period_of_validity[0])
      paymentInfo.endTime = timestampToTime(paymentInfo.period_of_validity[1])

      this.setData({
        paymentInfo,
      })
    })
  },

  getPackagesDetail(id) {
    return io.getPackageDetail(id).then(res => {
      let paymentInfo = res.data
      paymentInfo.startTime = timestampToTime(paymentInfo.period_of_validity[0])
      paymentInfo.endTime = timestampToTime(paymentInfo.period_of_validity[1])

      this.setData({
        paymentInfo,
      })
    })
  },

  handleInput(e) {
    this.setData({
      bindPhone: e.detail.value
    })
  },

  handleBuy() {
    if (!this.data.bindPhone) {
      wx.showToast({
        title: `请输入手机号码`,
        duration: 2000,
        icon: 'none'
      })
      return
    }
    if (!this.data.phone) {
      wx.BaaS.auth.getCurrentUser()
        .then(user => {
          return user.set('phone', this.data.bindPhone).update()
        })
    }
    wx.showToast({
      title: `支付功能尚未开通，敬请期待`,
      duration: 2000,
      icon: 'none'
    })
  },

  changeCount(e) {
    let type = e.currentTarget.dataset.type
    let count = this.data.count
    let limit_buy_count = this.data.paymentInfo.limit_buy_count
    if (type === 'add') {
      if (count >= limit_buy_count) {
        wx.showToast({
          title: `可购买数量为${limit_buy_count}张`,
          duration: 2000,
          icon: 'none'
        })
        return
      }
      count += 1
    } else {
      if (count <= 1) {
        wx.showToast({
          title: `最少购买1张`,
          duration: 2000,
          icon: 'none'
        })
        return
      }
      count -= 1
    }
    this.setData({
      count,
    })
  }
})