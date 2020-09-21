import baas from '../../lib/baas'
import wxUtils from '../../lib/wx-utils'

Component({
  properties: {
    method: {
      type: String,
      value: 'getUserInfo',
    },
    params: {
      type: Object,
      value: {},
    },
  },

  data: {
    event: 'noop',
  },

  attached() {
    this.init()
  },

  methods: {
    init() {
      const {method} = this.data
      const authSettingScope = wxUtils.getAuthSettingScope(method)
      this.setData({authSettingScope})
      if (authSettingScope === 'userInfo') {
        this.setData({isAuth: baas.isAuth()})
      } else {
        wxUtils.getSetting(authSettingScope).then(res => {
          console.log('getSetting', authSettingScope, res)

          // 从未请求过授权时也进入 onAuth，让小程序自动唤起第一次授权
          const event = res === undefined || res ? 'onAuth' : 'onWithoutAuth'
          this.setData({event})
        })
      }
    },

    onGetUserInfo(e) {
      if (this.data.isAuth) {
        const uid = baas.getUid()
        const userinfo = baas.getUserInfo()

        this.onSuccess({uid, userinfo})
      } else {
        const {errMsg} = e.detail
        if (/auth deny/.test(errMsg)) {
          console.log('auth deny')
          this.setData({event: 'onWithoutAuth'})
          this.onFail({errMsg})
        } else {
          wx.BaaS.auth.loginWithWechat(e).then(res => {
            this.onSuccess(res.data)
            this.setData({isAuth: baas.isAuth()})
          })
        }
      }
    },

    /**
     * 第一次调用时唤起授权方法的授权弹窗
     * 用户拒绝授权后将事件设置为 onWithoutAuth
     */
    onAuth() {
      const {method, params} = this.data

      const authSettingScope = wxUtils.getAuthSettingScope(method)
      this.setData({authSettingScope})
      wxUtils.getSetting(authSettingScope).then(res => {
        console.log('getSetting', authSettingScope, res)

        if (res || res === undefined) {
          wx[method]({
            ...params,
            success: res => {
              this.onSuccess(res)
            },
            fail: err => {
              const {errMsg} = err
              if (/auth deny/.test(errMsg)) {
                console.log('auth deny')
                this.setData({event: 'onWithoutAuth'})
              }
              this.onFail(err)
            },
          })
        } else {
          this.onWithoutAuth()
        }
      })
    },

    onWithoutAuth() {
      const {authSettingScope} = this.data
      const authSettingScopeName = wxUtils.getAuthSettingScopeName(authSettingScope)
      wx.showModal({
        title: '授权提示',
        content: `需要授权${authSettingScopeName}权限`,
        confirmText: '前往授权',
        success: res => {
          if (res.confirm) {
            wxUtils.openSetting().then(authSetting => {
              if (authSetting[`scope.${authSettingScope}`]) {
                this.setData({event: 'onAuth'})
              }
            })
          }
        },
      })
    },

    onSuccess(res) {
      this.triggerEvent('onSuccess', res, {})
    },

    onFail(err) {
      this.triggerEvent('onFail', err, {})
    },

    noop() {},
  },
})
