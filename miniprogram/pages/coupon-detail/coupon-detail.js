import io from '../../io/index'
import {timestampToTime} from '../../utils/common'
import {CONSUMPTION_TYPE} from '../../config/constants'

let id = ''

Page({
  data: {
    couponInfo: {},
    merchantInfo: {},
  },

  onLoad(params) {
    if (params.id) {
      id = params.id
      this.getCouponDetail(params.id)
    }
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

  jumpToPayment() {
    wx.navigateTo({
      url: `/pages/coupon-payment/coupon-payment?id=${id}&type=coupon`
    })
  },

  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.merchantInfo.contact_number,
    })
  }
})