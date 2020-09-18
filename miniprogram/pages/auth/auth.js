// pages/auth/auth.js
import io from '../../io/index'

Page({
  onLoad: function(options) {
    this.options = options
  },

  userInfoHandler(data) {
    wx.showLoading({
      mask: true,
    })
    wx.BaaS.auth.loginWithWechat(data)
      .then(res => {
        const user = res
        io.getUserById(user.id)
          .then(res => {
            if (!res.data) {
              return io.createUser(user.unionid)
            }
          })
          .then(() => {
            wx.redirectTo({
              url: decodeURIComponent(this.options.url),
            })
          })
      })
      .catch(err => {
        console.log(err)
        wx.hideLoading()
      })
      .then(wx.hideLoading)
  },
})
