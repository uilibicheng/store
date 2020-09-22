// components/index-icon/index-icon.js
import router from '../../lib/router'
import Toast from '@vant/weapp/toast/toast';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    programList: {
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
    handleIcon(event) {
      if (event.currentTarget.dataset.index === 0) {
       
      } else {
        Toast('敬请期待~');
      }
    }
  }
})