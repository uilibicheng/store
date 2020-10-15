// pages/coupon/coupon.js
import io from '../../io/index'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    bannerList: [],
    merchantDetail: {},
    restaurant_service:[],
    couponList:[],
    couponPackagesList:[],
    menuList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(params) {
    if (params.id) {
      this.getBannerListDetails(params.id)
      this.getMerchantDetails(params.id)
      this.getCouponLists(params.id)
      this.getCouponPackages(params.id)
      this.getMenuList(params.id)
    }
  },
  getBannerListDetails: function(id) {
    return io.getBannerListDetail(id).then(res => {
      this.setData({
        bannerList: res.data.objects
      })
    })
  },
  getMerchantDetails: function(id) {
    const tempMoney = {
      0: '100以下',
      1: '100-200',
      2: '200-300',
      3: '300以上'
    }
    return io.getMerchantDetail(id).then(res => {
      res.data.objects[0].consumption_person_money = tempMoney[res.data.objects[0].consumption_person]
      this.getServerListDetails(res.data.objects[0].service_list)
      this.setData({
        merchantDetail: res.data.objects[0]
      })
    })
  },
  getServerListDetails: function (service_list) {
    return io.getServerListDetail(service_list).then(res => {
      this.setData({
        restaurant_service: res.data.objects
      })
    })
  },
  handCallPhone:function(){
    wx.makePhoneCall({
      phoneNumber: this.data.merchantDetail.contact_number
    })
  },
  getCouponLists:function(id){
    const arr = [id]
    return io.getCouponList(arr).then(res => {
      this.setData({
        couponList: res.data.objects
      })
    })
  },
  getCouponPackages: function (id) {
    return io.getCouponPackages([id]).then(res => {
      this.setData({
        couponPackagesList: res.data.objects
      })
    })
  },
  getMenuList: function(id){
    return io.getMenuListDetail([id]).then(res => {
      this.setData({
        menuList: res.data.objects
      })
    })
  }   
})