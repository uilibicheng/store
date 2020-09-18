import retry from './retry'

const AUTH_SETTING_SCOPE_MAP = {
  getUserInfo: 'userInfo',
  getLocation: 'userLocation',
  chooseLocation: 'userLocation',
  chooseAddress: 'address',
  chooseInvoiceTitle: 'invoiceTitle',
  chooseInvoice: 'invoice',
  getWeRunData: 'werun',
  startRecord: 'record',
  saveImageToPhotosAlbum: 'writePhotosAlbum',
  saveVideoToPhotosAlbum: 'writePhotosAlbum',
  camera: 'camera',
}

const AUTH_SETTING_SCOPE_NAME_MAP = {
  address: '通讯地址',
  camera: '摄像头',
  invoice: '获取发票',
  invoiceTitle: '发票抬头',
  record: '录音功能',
  userInfo: '用户信息',
  userLocation: '地理位置',
  werun: '微信运动步数',
  writePhotosAlbum: '保存到相册',
}

export default {
  /**
   * wx.getStorageSync && wx.setStorageSync 有概率出错
   * 引入报错重试机制
   */
  getStorageSync: retry(key => wx.getStorageSync(key)),
  setStorageSync: retry((key, value) => wx.setStorageSync(key, value)),

  /**
   * 检查小程序登录态，微信 session_key 是否过期
   */
  checkSession() {
    return new Promise((resolve, reject) => {
      wx.checkSession({
        success: resolve,
        fail: reject,
      })
    })
  },
  /**
   * 判断用户是否已经授权某种权限
   * @param {String} key 授权 scope 值
   * 包括 userInfo, userLocation, address, invoiceTitle, werun, record, writePhotosAlbum, camera
   */
  getSetting(key) {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: res => {
          resolve(res.authSetting[`scope.${key}`])
        },
        fail: reject,
      })
    })
  },
  /**
   * 用户发生点击行为后，跳转打开设置页
   */
  openSetting() {
    return new Promise((resolve, reject) => {
      wx.openSetting({
        success: res => {
          resolve(res.authSetting)
        },
        fail: reject,
      })
    })
  },

  getAuthSettingScopeName(key) {
    if (!key) return AUTH_SETTING_SCOPE_NAME_MAP

    return AUTH_SETTING_SCOPE_NAME_MAP[key]
  },

  getAuthSettingScope(method) {
    return AUTH_SETTING_SCOPE_MAP[method]
  },

  /**
   * 检查并提示小程序版本更新
   * @param {Boolean} showCancel 是否显示取消按钮
   */
  checkUpdateManager(showCancel = true) {
    if (!wx.getUpdateManager) return

    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(() => {
      wx.showModal({
        showCancel,
        title: '小程序更新提示',
        content: '新版本已下载，立即更新并重启？',
        success: res => {
          if (res.confirm) updateManager.applyUpdate()
        },
      })
    })
  },

  /**
   * 比较小程序基础库版本号
   */
  compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')

    const len = Math.max(v1.length, v2.length)
    while (v1.length < len) v1.push('0')
    while (v2.length < len) v2.push('0')

    for (let i = 0; i < len; i++) {
      const num1 = parseInt(v1[i], 10)
      const num2 = parseInt(v2[i], 10)
      if (num1 > num2) return 1
      if (num1 < num2) return -1
    }
    return 0
  },
}
