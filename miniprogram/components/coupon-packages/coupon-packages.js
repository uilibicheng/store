// components/coupon-packages/coupon-packages.js
import router from '../../lib/router'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    couponItem: {
      type: Object,
      value: {}
    },
    isShowShop:{
      type: Number,
      value: 1
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    buyCoupon: function(event) {
      router.push({
        name: 'package-detail',
        data: {
          id: event.currentTarget.dataset.item.id,
        },
      })
    }
  }
})