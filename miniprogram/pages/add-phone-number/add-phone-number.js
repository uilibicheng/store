import * as constants from '../../config/constants'
import router from '../../lib/router'
import baas from '../../lib/baas'

Component({
  properties: {
  },

  data: {
    userPhoneList: [],
  },

  methods: {
    onLoad() {
      // this.getUserPhoneList()
      wx.showLoading({mask: true})

      wx.checkSession({
        success: res => {
          console.log('checkSession success', res)
          baas.authLogin().then(user => {
            this.setData({
              userPhoneList: user.phone,
            })
            wx.hideLoading()
          })
        },
        fail: err => {
          console.log('checkSession fail', err)
          wx.BaaS.auth.logout()
          baas.authLogin().then(user => {
            this.setData({
              userPhoneList: user.phone,
            })
            wx.hideLoading()
          })
        },
      })

      // wx.BaaS.auth.logout()
      // baas.authLogin().then(user => {
      //   this.setData({
      //     userPhoneList: user.phone,
      //   })
      //   wx.hideLoading()
      // })
    },

    getUserPhoneList() {
      wx.BaaS.auth.getCurrentUser().then(user => {
        const userInfo = user.toJSON()
        this.setData({
          userPhoneList: userInfo.phone,
        })
        wx.hideLoading()
      })
    },

    getPhoneNumber(data) {
      console.log('phone===', data)
      if (!data.detail.encryptedData) return
      wx.showLoading({mask: true})

      wx.BaaS.wxDecryptData(data.detail.encryptedData, data.detail.iv, 'phone-number')
        .then(decrytedData => {
          console.log('decrytedData: ', decrytedData)
          let phoneNumber = decrytedData.phoneNumber

          wx.BaaS.invoke(constants.REMOTE_FUNCTION.add_phone_number, {phone: phoneNumber}).then(res => {
            wx.hideLoading()
            if (res.code === 0) {
              wx.showToast({
                title: '绑定成功',
                icon: 'success',
                mask: true,
              })
            } else {
              wx.showToast({
                title: res.error.message,
                icon: 'none',
                mask: true,
              })
            }
            this.getUserPhoneList()
          }).catch(err => {
            console.log(err)
          })

        }, err => {
          wx.hideLoading()
          console.log('err:', err)
        })
    },

    handleDeletePhone(e) {
      const {phone} = e.currentTarget.dataset
      wx.showModal({
        content: `确定解绑号码 ${phone}？解绑号码后相应订单也将会被解绑`,
        success: res => {
          if (res.confirm) {
            wx.showLoading({mask: true})
            wx.BaaS.invoke(constants.REMOTE_FUNCTION.delete_phone_number, {phone}).then(res => {
              if (res.code === 0) {
                wx.hideLoading()
                wx.showToast({
                  title: '解绑成功',
                  icon: 'success',
                  mask: true,
                })
              } else {
                wx.hideLoading()
                wx.showToast({
                  title: res.error.message,
                  icon: 'none',
                  mask: true,
                })
              }
              this.getUserPhoneList()
            }).catch(err => {
              console.log(err)
            })
          }
        }
      })
    },

    navToIndex() {
      router.relaunch({
        name: 'index',
      })
    },

  }
})
