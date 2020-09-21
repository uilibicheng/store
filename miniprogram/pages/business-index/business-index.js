import router from '../../lib/router'
import device from '../../lib/device'
import baas from '../../lib/baas'
import format from '../../lib/format'
import io from '../../io/index'

const app = getApp()

Component({
  properties: {
  },

  data: {
    storeInfo: null,
    pageHeaderStyle: '',
  },

  methods: {
    onLoad() {
      this.getUserStoreInfo()
    },

    onScrollerScroll(e) {
      this.setData({
        pageHeaderStyle: e.detail.scrollTop > 40 ? 'background-color: #E7E0D6;' : '',
      })
    },

    // onPageScroll(e) {
    //   this.setData({
    //     pageHeaderStyle: e.scrollTop > 70 ? 'background-color: #E7E0D6;' : '',
    //   })
    // },

    getUserStoreInfo() {
      const uid = baas.getUid()
      return io.getUserStoreInfo(uid).then(res => {
        this.setData({
          storeInfo: res.data.objects[0],
        })
      })
    },

    navToEditInfo() {
      app.globalData.userStoreInfo = this.data.storeInfo
      router.push({
        name: 'business-info',
        data: {
          modify: true,
        },
      })
    },
  }
})
