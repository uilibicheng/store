import io from '../../io/index'
import {timestampToTime} from '../../utils/common'
import {CONSUMPTION_TYPE} from '../../config/constants'

Page({
  data: {
    couponInfo: {},
    merchantInfo: {},
    count: 1,
    phone: '',
    bindPhone: '',
  },

  onLoad(params) {
    this.getCurrentUser()
    if (params.id) {
      this.getCouponDetail(params.id)
    }
  },

  getCurrentUser() {
    wx.BaaS.auth.getCurrentUser().then(user => {
      let phone = user._attribute._phone || ''
      this.setData({
        phone,
        bindPhone: phone,
      })
    })
  },

  getCouponDetail(id) {
    return io.getCouponDetail(id).then(res => {
      let couponInfo = res.data
      let merchantInfo = res.data.merchant_id
      merchantInfo.consumption_type = CONSUMPTION_TYPE[merchantInfo.consumption_person]
      couponInfo.startTime = timestampToTime(couponInfo.period_of_validity[0])
      couponInfo.endTime = timestampToTime(couponInfo.period_of_validity[1])

      this.setData({
        couponInfo,
        merchantInfo,
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
          return user.setMobilePhone(this.data.bindPhone)
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
    let limit_buy_count = this.data.couponInfo.limit_buy_count
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