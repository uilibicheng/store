// components/page-header/page-header.js
import device from '../../lib/device.js'
import router from '../../lib/router.js'

const app = getApp()

const INDEX_ROUTE = 'pages/index/index'
const B_INDEX_ROUTE = 'pages/business-index/business-index'
const ROUTE_WHITE_LIST = [
  'pages/index/index',
  'pages/business-index/business-index',
  'pages/order-list/business-index',
  'pages/business-index/business-index',
]

Component({
  properties: {
    title: {
      type: String,
      value: '小美团',
    },

    selfStyle: {
      type: String,
      value: '',
    },

    whiteMode: {
      type: Boolean,
      value: false,
    },

    showPlaceholder: {
      type: Boolean,
      value: true,
    },

    showIndexBtn: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    showBackBtn: false,
    statusBarHeight: device.getStatusBarHeight(),
    navBarHeight: device.getNavbarHeight(),
  },

  pageLifetimes: {
    show() {
      const pageStack = getCurrentPages()
      // console.log('pageStack =>', pageStack)
      this.setData({
        showBackBtn: pageStack.length > 1,
      })
    },
  },

  methods: {
    goBack() {
      wx.navigateBack({
        delta: 1,
      })
    },

    goIndex() {
      router.relaunch({
        name: app.globalData.isStoreUser ? 'business-index' : 'index',
      })
    }
  },
})
