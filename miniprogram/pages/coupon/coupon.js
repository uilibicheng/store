// pages/coupon/coupon.js
import io from '../../io/index'
const DEFAULT_MERCHANT_TYPE = '全部美食'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    merchantTypeList: [],
    value1: -1,
    option1: [{
        text: '全 部',
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
    allCouponList: [],
    couponPackagesList:[],
    allCouponPackagesList:[],
    iconActive:0,
    searchMerchantIds: [],
    consumptionPersonType: -1,
    merchantType: DEFAULT_MERCHANT_TYPE,
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
        type: DEFAULT_MERCHANT_TYPE,
        image: './images/all.png'
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
    return io.getCouponList(this.data.searchMerchantIds).then(res => {
      res.data.objects.forEach(item => {
        item.merchant_id.consumption_person_money = tempMoney[item.merchant_id.consumption_person]
      })
      this.setData({
        couponList: res.data.objects,
        allCouponList: res.data.objects,
      })
    })
  },
  getCouponPackages: function () {
    return io.getCouponPackages(this.data.searchMerchantIds).then(res => {
      this.setData({
        couponPackagesList: res.data.objects,
        allCouponPackagesList: res.data.objects,
      })
    })
  },
  onChange: function (active){
    this.setData({
      active: active.detail.index
    })
  },
  onSwitch1Change: function (e){
    this.setData({
      consumptionPersonType: e.detail
    }, () => {
      this.couponListChange()
    })
  },
  couponIconChange: function (event){
    let type = event.detail.event.item.type
    this.setData({
      iconActive: event.detail.event.index,
      merchantType: type,
    }, () => {
      this.couponListChange()
    })
  },
  listFilter(type, arr, key) {
    let newArr = []
    if (type === -1 || type === DEFAULT_MERCHANT_TYPE) {
      newArr = arr
    } else {
      newArr = arr.filter(item => {
        return type === item.merchant_id[key]
      })
    }
    return newArr
  },
  couponListChange() {
    let consumptionPersonType = this.data.consumptionPersonType
    let merchantType = this.data.merchantType

    let couponList = this.listFilter(merchantType, this.data.allCouponList, 'merchant_type')
    couponList = this.listFilter(consumptionPersonType, couponList, 'consumption_person')

    let couponPackagesList = this.listFilter(merchantType, this.data.allCouponPackagesList, 'merchant_type')
    couponPackagesList = this.listFilter(consumptionPersonType, couponPackagesList, 'consumption_person')

    this.setData({
      couponList,
      couponPackagesList,
    })
  },
  onSearch(e) {
    io.getMerchantList({name: e.detail.value}).then(res => {
      let searchMerchantIds = res.data.objects.map(item => {
        return item.id
      })
      this.setData({
        searchMerchantIds,
      })
      this.getCouponLists()
      this.getCouponPackages()
    })
  }
})