import io from '../../io/index'
import {timestampToTime} from '../../utils/common'

let id = ''

Page({
  data: {
    packageInfo: {},
    merchantInfo: {},
  },

  onLoad(params) {
    if (params.id) {
      id = params.id
      this.getPackagesDetail(params.id)
    }
  },

  getPackagesDetail(id) {
    return io.getPackageDetail(id).then(res => {
      let packageInfo = res.data
      packageInfo.startTime = timestampToTime(packageInfo.period_of_validity[0])
      packageInfo.endTime = timestampToTime(packageInfo.period_of_validity[1])

      this.setData({
        packageInfo,
      })
    })
  },

  jumpToPayment() {
    wx.navigateTo({
      url: `/pages/coupon-payment/coupon-payment?id=${id}&type=package`
    })
  },
})