// components/contact-entrance/contact-entrance.js
import router from '../../lib/router'
import baas from '../../lib/baas'

Component({
  properties: {
  },

  data: {
    isAuth: baas.isAuth(),
  },

  lifetimes: {
    attached() {
      this.setData({
        isAuth: baas.isAuth(),
      })
    },
  },

  methods: {
    userInfoHandler(data) {
      wx.showLoading({
        mask: true,
      })
      baas.authLogin(data)
        .then(res => {
          this.setData({
            isAuth: baas.isAuth(),
          })
          this.navToAuth()
        })
        .catch(err => {
          console.log('err:', err)
        })
        .then(wx.hideLoading)
    },

    navToAuth() {
      router.relaunch({
        name: 'auth',
      })
    },
  }
})
