// components/footer-ipx/footer-ipx.js
import device from '../../lib/device.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    isiPhoneX: false,
  },

  lifetimes: {
    attached() {
      // const systemInfo = wx.getSystemInfoSync()
      // const deviceModel = systemInfo.model
      // const res = /iPhone X/.test(deviceModel) || /iPhone11/.test(deviceModel)
      this.setData({
        isiPhoneX: device.isIpx(),
      })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {},
})
