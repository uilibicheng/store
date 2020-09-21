import router from '../../lib/router'
import device from '../../lib/device'
import baas from '../../lib/baas'
import format from '../../lib/format'
import io from '../../io/index'
import * as constants from '../../config/constants'

const app = getApp()

Component({
  properties: {
  },


  data: {
    inputText: '',
    showErrorMsg: false,
  },

  methods: {
    onLoad() {
      wx.showLoading({
        mask: true,
      })
      if(!baas.isLogin()) {
        baas.authLogin().then(res => {
          this.initOnLoad()
        })
      } else {
        this.initOnLoad()
      }
    },

    initOnLoad() {
      wx.BaaS.auth.getCurrentUser().then(user => {
        const userInfo = user.toJSON()
        wx.hideLoading()
        if (!userInfo.is_authorized) {
          router.relaunch({
            name: 'index',
          })
          return
        }
        // 如果是商家，重定向到商家首页
        if (userInfo.is_store_user) {
          app.globalData.isStoreUser = true
          router.relaunch({
            name: 'business-index',
          })
        }
      })
    },

    handleScanCode() {
      wx.scanCode({
        success: res => {
          if (res.result) {
            this.setData({
              inputText: res.result,
              showErrorMsg: false,
            })
          } else {
            wx.showToast({
              title: '读取信息错误，请重试',
              icon: 'none',
            })
          }
        }
      })
    },

    handleCodeInput(e) {
      this.setData({
        inputText: e.detail.value.trim(),
        showErrorMsg: false,
      })
    },

    submitInvitationCode() {
      if (!this.data.inputText) {
        wx.showToast({
          title: '请先输入邀请码',
          icon: 'none',
        })
        return
      }
      wx.showLoading({
        mask: true,
      })
      wx.BaaS.invoke(
        constants.REMOTE_FUNCTION.verify_invitation_code,
        {invitation_code: this.data.inputText}
      ).then(res => {
        wx.hideLoading()
        if (res.code === 0) {
          wx.showToast({
            title: '验证成功',
            mask: true,
          })
          setTimeout(() => {
            router.push({
              name: 'business-info',
              data: {
                invitation_code: this.data.inputText,
              }
            })
          }, 500)
        } else {
            wx.showToast({
              title: res.error.message,
              icon: 'none',
              mask: true,
            })
          }
      })
      .catch(err => {
        wx.hideLoading()
        console.log(err)
      })
    },
  }
})
