import router from '../../lib/router'
import device from '../../lib/device'
import baas from '../../lib/baas'
import format from '../../lib/format'
import io from '../../io/index'
import * as constants from '../../config/constants'

const app = getApp()

const simpleClone = obj => JSON.parse(JSON.stringify(obj))

Component({
  properties: {
  },

  data: {
    statusBarHeight: device.getStatusBarHeight(),
    navBarHeight: device.getNavbarHeight(),

    articleInfo: null,
    tagName: null,
  },

  methods: {
    onLoad() {
      let articleInfo = simpleClone(app.globalData.articleInfo)
      articleInfo.description = articleInfo.description.replace(/<img/g, '<img style="width: 100%; height: auto;"')
      articleInfo.description = articleInfo.description.replace(/rgb\(255, 255, 255\)/g, 'rgba(255, 255, 255, 0)')
      articleInfo.description = articleInfo.description.replace(/<p/g, '<p style="margin-bottom: 16px;"')
      console.log(articleInfo, app.globalData.tagName)
      this.setData({
        articleInfo,
        tagName: app.globalData.tagName,
      })
    },

    previewCover() {
      wx.previewImage({
        urls: [this.data.articleInfo.cover],
      })
    },
  }
})
