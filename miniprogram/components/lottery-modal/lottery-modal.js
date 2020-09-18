import {ROUTE} from '../../config/constants'
import wxUtils from '../../lib/wx-utils'

const KEY = 'lottery_modal_latest_show_at'

Component({
  data: {
    show: false,
  },

  attached() {
    this.init()
  },

  methods: {
    init() {
      const now = Date.now()
      const time = wxUtils.getStorageSync(KEY)
      if (!time || now - time > 3600 * 24 * 7 * 1000) {
        this.setData({show: true})
      }
    },

    onClose() {
      this.setData({show: false})
      const now = Date.now()
      wxUtils.setStorageSync(KEY, now)
    },

    navToLottery() {
      wx.navigateTo({url: `/${ROUTE.LOTTERY}`})
    },
  },
})
