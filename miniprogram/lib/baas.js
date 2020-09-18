import retry from './retry'

const getStorage = retry(key => wx.BaaS.storage.get(key))
const setStorage = retry((key, value) => wx.BaaS.storage.set(key, value))

export default {
  getStorage,
  setStorage,

  getUid() {
    return getStorage('uid')
  },

  getOpenid() {
    return getStorage('openid')
  },

  getUserInfo() {
    return getStorage('userinfo')
  },

  getUnionid() {
    const userInfo = this.getUserInfo() || {}
    return getStorage('unionid') || userInfo.unionid
  },

  isLogin() {
    return !!getStorage('auth_token')
  },

  isAuth() {
    return this.isLogin() && !!this.getUnionid()
  },

  ensureLogin() {
    return this.isLogin() ? Promise.resolve() : wx.BaaS.auth.loginWithWechat()
  },
}
