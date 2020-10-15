// app.js
import * as constants from './config/constants'
import baas from './lib/baas'

App({
  isDev: constants.DEV,

  onLaunch() {
    this.applicationHotUpdate()
    wx.BaaS = requirePlugin('sdkPlugin')
    wx.BaaS.wxExtend(wx.login, wx.getUserInfo, wx.requestPayment)
    wx.BaaS.init(constants.BAAS_CLIENT_ID, {autoLogin: true, env: constants.DEV ? constants.ENV_ID : undefined})

    baas.authLogin().then(user => {
      console.log('app.js user =>', user)
      this.globalData.isStoreUser = !!user.is_store_user
    })

    let coverIndex = baas.getStorage('cover_index')
    if (!coverIndex) coverIndex === 0
    baas.setStorage('cover_index', ++coverIndex)
  },

  /**
   * 热更新程序代码
   */
  applicationHotUpdate() {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function(res) {
      // 请求完新版本信息的回调
      // console.log('hasUpdate: ', res.hasUpdate)
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
  globalData: {
  }
})
