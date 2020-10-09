// pages/coupon/coupon.js
import io from '../../io/index'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    merchantTypeList: [],
    value1: -1,
    option1: [{
      text: '全部',
        value: -1
      },
      {
        text: '100以下',
        value: 0
      },
      {
        text: '100-200',
        value: 1
      },
      {
        text: '200-300',
        value: 2
      },
      {
        text: '300以上',
        value: 3
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getMerchantTypeLists()
  },

  getMerchantTypeLists: function() {
    return io.getMerchantTypeList().then(res => {
      res.data.objects.unshift({
        type: '全部美食',
        image: 'https://cloud-minapp-26038.cloud.ifanrusercontent.com/1kLO4Prjdyiq8Fid.png'
      })
      this.setData({
        merchantTypeList: res.data.objects
      })
    })
  }

})