// components/index-card/index-card.js
import router from '../../lib/router'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    merchantList: {
      type: Array,
      value: [],
    },
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
    goTo(e) {
      router.push({
        name: 'merchant-detail',
        data: {
          id: e.currentTarget.dataset.item.id,
        },
      })
    }
  }
})