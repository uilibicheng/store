// components/coupon-icon/coupon-icon.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    couponMerchantType:{
      type:Object,
      value:{}
    },
    iconActive:{
      type: Number,
      value: 0
    },
    index:{
      type: Number,
      value: 0
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
    handleIcon:function(event){
      this.triggerEvent('couponIconChange', { event: event.currentTarget.dataset })
    }
  }
})
