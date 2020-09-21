import router from '../../lib/router'
import baas from '../../lib/baas'
import * as constants from '../../config/constants'

Component({
  properties: {
  },

  data: {
    isAuth: baas.isAuth(),
  },

  methods: {
    onLoad(options) {
      this.options = options
      wx.showLoading({mask: true})

      wx.checkSession({
        success: res => {
          console.log('checkSession success', res)
          if(!baas.isLogin()) {
            baas.authLogin().then(() => {
              this.setData({
                isAuth: baas.isAuth(),
              })
              wx.hideLoading()
            })
          } else {
            this.setData({
              isAuth: baas.isAuth(),
            })
            wx.hideLoading()
          }
        },
        fail: err => {
          console.log('checkSession fail', err)
          wx.BaaS.auth.logout()
          baas.authLogin().then(() => {
            this.setData({
              isAuth: baas.isAuth(),
            })
            wx.hideLoading()
          })
        },
      })

      // wx.BaaS.auth.logout()
      // baas.authLogin().then(() => {
      //   this.setData({
      //     isAuth: baas.isAuth(),
      //   })
      //   wx.hideLoading()
      // })
    },

    userInfoHandler(data) {
      wx.showLoading({
        mask: true,
      })
      baas.authLogin(data)
        .then(res => {
          this.setData({
            isAuth: baas.isAuth(),
          })
        })
        .catch(err => {
          console.log('err:', err)
        })
        .then(wx.hideLoading)
    },

    getPhoneNumber(data) {
      console.log('phone===', data)
      if (!data.detail.encryptedData) return
      wx.showLoading({mask: true})

      wx.BaaS.wxDecryptData(data.detail.encryptedData, data.detail.iv, 'phone-number')
        .then(decrytedData => {
          console.log('decrytedData: ', decrytedData)
          let phoneNumber = decrytedData.phoneNumber

          wx.BaaS.invoke(constants.REMOTE_FUNCTION.add_phone_number, { phone: phoneNumber }).then(res => {
            wx.hideLoading()
            if (res.code === 0) {
              wx.showToast({
                title: '绑定成功',
                icon: 'success',
                mask: true,
              })
              setTimeout(() => {
                if (this.options.scene) {
                  router.relaunch({
                    name: 'relate-order',
                    data: {
                      scene: this.options.scene,
                    },
                  })
                } else {
                  this.navToIndex()
                }
              }, 1000)
            } else {
              wx.showToast({
                title: res.error.message,
                icon: 'none',
                mask: true,
              })
            }
          }).catch(err => {
            console.log(err)
          })

        }, err => {
          wx.hideLoading()
          console.log('err:', err)
        })
    },

    navToIndex() {
      router.relaunch({
        name: 'index',
      })
    },
  }
})
