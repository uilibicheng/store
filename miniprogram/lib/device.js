import retry from './retry'

const ANDROID_NAV_BAR_BASE_HEIGHT = 48
const IOS_NAV_BAR_BASE_HEIGHT = 44
const IOS_STATUS_BAR_HEIGHT = 20

const getSystemInfo = retry(() => wx.getSystemInfoSync())

export default {
  getSystemInfo,

  isIos() {
    return getSystemInfo()
      .system.toLowerCase()
      .includes('ios')
  },

  getWindowWidth() {
    return getSystemInfo().windowWidth
  },

  getWindowHeight() {
    return getSystemInfo().windowHeight
  },

  getStatusBarHeight() {
    return getSystemInfo().statusBarHeight
  },

  getPixelRatio() {
    return getSystemInfo().pixelRatio
  },

  isIpx() {
    return this.isIos() && this.getStatusBarHeight() > IOS_STATUS_BAR_HEIGHT
  },

  getNavbarHeight() {
    const baseHeight = this.isIos() ? IOS_NAV_BAR_BASE_HEIGHT : ANDROID_NAV_BAR_BASE_HEIGHT
    return baseHeight + this.getStatusBarHeight()
  },

  // 获取基础库版本
  getBaseLibVersion() {
    return this.getSystemInfo().SDKVersion
  },

  rpx2px(width) {
    const ratio = this.getWindowWidth() / 750
    return parseFloat((width * ratio).toPrecision(12), 10)
  },

  px2rpx(width) {
    const ratio = width / this.getWindowWidth()
    return Math.ceil((ratio * 750).toPrecision(12))
  },
}
