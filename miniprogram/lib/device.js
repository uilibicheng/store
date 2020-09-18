const ANDROID_NAV_BAR_BASE_HEIGHT = 48
const IOS_NAV_BAR_BASE_HEIGHT = 44
const IOS_STATUS_BAR_HEIGHT = 20

let systemInfo = null

function getSystemInfo() {
  if (systemInfo) return systemInfo
  systemInfo = wx.getSystemInfoSync()
  return systemInfo
}

export default {
  getSystemInfo,

  getWindowWidth() {
    return getSystemInfo().windowWidth
  },

  getWindowHeight() {
    return getSystemInfo().windowHeight
  },

  getPixelRatio() {
    return getSystemInfo().pixelRatio
  },

  rpx2px(width) {
    const ratio = this.getWindowWidth() / 750
    return parseFloat((width * ratio).toPrecision(12), 10)
  },

  px2rpx(width) {
    const ratio = width / this.getWindowWidth()
    return Math.ceil((ratio * 750).toPrecision(12))
  },

  isIos() {
    return getSystemInfo()
      .system.toLowerCase()
      .includes('ios')
  },

  isIpx() {
    return this.isIos() && this.getStatusBarHeight() > IOS_STATUS_BAR_HEIGHT
  },

  getStatusBarHeight() {
    return getSystemInfo().statusBarHeight
  },

  getNavbarHeight() {
    const baseHeight = this.isIos() ? IOS_NAV_BAR_BASE_HEIGHT : ANDROID_NAV_BAR_BASE_HEIGHT
    return baseHeight + this.getStatusBarHeight()
  },
}
