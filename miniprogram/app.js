// app.js
import * as constants from './config/constants'
import moment from './lib/moment-timezone'
import io from './io/index'
moment.tz.add(constants.TIMEZONE_DATA)

// import pay from './utils/pay'

App({
  isDev: constants.DEV,
  stickerPhoto: null, // 贴纸游戏拍摄相片
  stickerImage: null, // 贴纸游戏贴纸图片

  onLaunch() {
    this.applicationHotUpdate()
    wx.BaaS = requirePlugin('sdkPlugin')
    wx.BaaS.wxExtend(wx.login, wx.getUserInfo, wx.requestPayment)
    wx.BaaS.init(constants.BAAS_CLIENT_ID, {autoLogin: true})

    // wx.BaaS._config.DEBUG = true
    // wx.BaaS.init('90c434bd89286374f67b', { autoLogin: true })
    // wx.BaaS._config.API_HOST = 'https://viac2-p.eng-vm.can.corp.ifanr.com'
    // wx.BaaS._config.API_HOST_PATTERN = /^https:\/\/[\w-.]+\.ifanr\.com/
    // wx.BaaS.auth.getCurrentUser()
    // return pay('23424535536', [1, 2, 33333], 'test name', 2)

    io.updateUserLoginTime()
  },

  onShow() {
    io.updateUserLastLogin()
  },

  auth(url) {
    return new Promise((resolve, reject) => {
      const userInfo = wx.BaaS.storage.get('userinfo')
      if (!userInfo || !userInfo.unionid) {
        wx.reLaunch({
          url: `/${constants.ROUTE.AUTH}?url=${encodeURIComponent(url)}`,
        })
        reject(new Error('用户未授权'))
      } else {
        resolve(userInfo)
      }
    })
  },

  getUserID() {
    if (this.userID) {
      return this.userID
    }
    let userID = wx.BaaS.storage.get('uid')
    this.userID = userID ? Number(userID) : userID
    return this.userID
  },

  /**
   * 热更新程序代码
   */
  applicationHotUpdate() {
    // console.log('热更新')
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function(res) {
      // 请求完新版本信息的回调
      console.log('hasUpdate: ', res.hasUpdate)
    })
    updateManager.onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        },
      })
    })
    updateManager.onUpdateFailed(function() {
      // 新版本下载失败
      wx.BaaS.ErrorTracker.track('热更新失败')
      console.log('热更新失败')
    })
  },

  setStickerPhoto(tempPath) {
    this.stickerPhoto = tempPath
  },

  getStickerPhoto() {
    return this.stickerPhoto
  },

  setStickerImage(tempPath) {
    this.stickerImage = tempPath
  },

  getStickerImage() {
    return this.stickerImage
  },
})
