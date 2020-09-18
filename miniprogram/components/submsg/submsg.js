import wxUtils from '../../lib/wx-utils'

Component({
  externalClasses: ['ext-class'],
  properties: {
    tmplIds: {type: Array, value: []},
  },
  data: {},
  methods: {
    onTap(e) {
      const {tmplIds} = this.data
      const key = tmplIds.join(',')
      const now = Math.floor(Date.now() / 1000)
      const last = wxUtils.getStorageSync(key) || 0

      if (now - last < 3600 * 24) return

      wx.requestSubscribeMessage({
        tmplIds,
        success: res => {
          let subscription = []
          tmplIds.forEach(item => {
            if (res[item] === 'accept') {
              subscription.push({
                template_id: item,
                subscription_type: 'once',
              })
            }
          })
          if (!subscription.length) return
          wx.BaaS.subscribeMessage({subscription}).then(res => {
            console.log('订阅成功', subscription)
          })
        },
        fail: err => console.log('fail', err),
        complete: () => {
          this.triggerEvent('onTap')
          wxUtils.setStorageSync(key, now)
        },
      })
    },
  },
})
