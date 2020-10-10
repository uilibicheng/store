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
    ],
    couponList: [],
    couponPackagesList:[],
    iconActive:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getMerchantTypeLists()
    this.getCouponLists()
    this.getCouponPackages()
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
  },
  getCouponLists: function() {
    const tempMoney = {
      0: '100以下',
      1: '100-200',
      2: '200-300',
      3: '300以上'
    }
    return io.getCouponList().then(res => {
      res.data.objects.forEach(item => {
        item.merchant_id.consumption_person_money = tempMoney[item.merchant_id.consumption_person]
      })
      this.setData({
        couponList: res.data.objects
      })
    })
  },
  getCouponPackages: function () {
    return io.getCouponPackages().then(res => {
      this.setData({
        couponPackagesList: res.data.objects
      })
    })
  },
  onChange: function (active){
    this.setData({
      active: active.detail.index
    })
  },
  onSwitch1Change: function (value){
    console.log(value)
  },
  couponIconChange: function (event){
    this.setData({
      iconActive: event.detail.event.index
    })
    return io.getCouponList().then(res => {
      if (event.detail.event.index==0){
        this.setData({
          couponList: res.data.objects
        })
      }else{
        const arr = []
        res.data.objects.forEach(item => {
          if (event.detail.event.item.type == item.merchant_id.merchant_type) {
            arr.push(item)
          }
        })
        this.setData({
          couponList: arr
        })
      }
      
    })
  }
})