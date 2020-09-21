import router from '../../lib/router'
// import device from '../../lib/device'
// import baas from '../../lib/baas'
// import format from '../../lib/format'
import io from '../../io/index'
import * as constants from '../../config/constants'

// const app = getApp()

Component({
  properties: {
  },

  data: {
    batchNo: '',
    storeInfo: null,
  },

  methods: {
    onLoad(options) {
      wx.showLoading({mask: true})
      this.setData({
        batchNo: options.scene,
      })
      this.getStoreInfo(options.scene)
      io.getOrderByBatchNo(options.scene).then(res => {
        // 如果查询到订单说明已经关联了，直接跳回首页
        if (res.data.objects.length > 0) {
          wx.showToast({
            title: '此订单已关联',
            mask: true,
          })
          setTimeout(() => {
            router.relaunch({
              name: 'index',
            })
          }, 1000)
        }
      }).catch(err => console.log(err))
    },

    getStoreInfo(batchNo) {
      wx.BaaS.invoke(constants.REMOTE_FUNCTION.get_store_by_batch_no, { batch_no: batchNo })
        .then(res => {
          if (res.code === 0) {
            this.setData({
              storeInfo: res.data,
            })
          } else {
            wx.showToast({
              title: res.error.message,
              icon: 'none',
              mask: true,
            })
          }
          wx.hideLoading()
        })
        .catch(err => {
          console.log(err)
        })
    },

    handleRelateOrder() {
      wx.showLoading({mask: true})
      wx.BaaS.invoke(constants.REMOTE_FUNCTION.relate_order, {batch_no: this.data.batchNo})
        .then(res => {
          wx.hideLoading()
          if (res.code === 0) {
            wx.showToast({
              title: '关联成功',
              icon: 'success',
              mask: true,
            })
            // wx.showLoading({mask: true})
            setTimeout(() => {
              router.relaunch({
                name: 'index',
              })
              wx.hideLoading()
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
