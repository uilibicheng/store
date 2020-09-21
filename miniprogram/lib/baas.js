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

  // isLogin() {
  //   return !!getStorage('auth_token')
  // },
  isLogin() {
    return !!getStorage('auth_token') && !!getStorage('auth_userinfo')
  },

  ensureLogin() {
    return this.isLogin() ? Promise.resolve() : wx.BaaS.login(false)
  },

  // isAuth() {
  //   return this.isLogin() && !!this.getUnionid()
  // },
  isAuth() {
    const userInfo = this.getAuthUserInfo() || {}
    return this.isLogin() && userInfo.is_authorized
  },

  authLogin(data = undefined) {
    return wx.BaaS.auth.loginWithWechat(data)
      .then(() => {
        return wx.BaaS.auth.getCurrentUser()
      })
      .then(user => {
        const userInfo = user.toJSON()
        console.log('authLogin =>', userInfo)
        setStorage('auth_userinfo', userInfo)
        return userInfo
      })
  },

  getAuthUserInfo() {
    return getStorage('auth_userinfo')
  },
}
