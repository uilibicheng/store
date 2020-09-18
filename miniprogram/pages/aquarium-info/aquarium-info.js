// pages/aquarium-info/aquarium-info.js
import io from '../../io/index'
import {ROUTE, PARK_MINAPP_ID} from '../../config/constants'
import wxParser from '../../lib/wxParser/index'
const app = getApp()

Page({
  data: {
    info: {},
  },

  onLoad(options) {
    this.dataInit()
  },

  dataInit() {
    wx.showLoading({
      mask: true,
    })
    return Promise.all([this.getAquariumInfo()])
      .catch(err => console.log(err))
      .then(wx.hideLoading)
  },

  getAquariumInfo() {
    return io
      .getSettings()
      .then(res => {
        wxParser.parse({
          bind: 'introduction',
          html: JSON.parse(res.data.introduction).content,
          target: this,
          enablePreviewImage: false,
        })
        this.setData({
          info: JSON.parse(res.data.introduction),
        })
      })
      .catch(err => {
        console.log('获取场馆信息时错误', err)
        throw err
      })
  },

  redirectToPersonal() {
    wx.redirectTo({
      url: `/${ROUTE.PERSONAL}`,
    })
  },

  redirectToIndex() {
    wx.redirectTo({
      url: `/${ROUTE.INDEX}`,
    })
  },

  onShareAppMessage() {
    return {
      title: `日本乐高商店`,
      path: `/${ROUTE.AQUARIUM_INFO}`,
    }
  },

  navToPark() {
    wx.navigateToMiniProgram({
      appId: PARK_MINAPP_ID,
      // envVersion: 'develop',
    })
  },
})
