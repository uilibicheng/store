// components/coupon-card/coupon-card.js
import router from '../../lib/router'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    couponItem:{
      type: Object,
      value: {}
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
    buyCoupon: function (event){
      console.log()
      router.push({
        name: 'coupon-detail',
        data: {
          id: event.currentTarget.dataset.item.id,
        },
      })
    }
  }
})
