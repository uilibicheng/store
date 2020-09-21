import device from '../../lib/device'
import router from '../../lib/router'
import baas from '../../lib/baas'

// const INDEX_ROUTE = '/pages/index/index'
// const ORDER_ROUTE = '/pages/order-list/order-list'
// const TAILORED_ROUTE = '/pages/tailored/tailored'
// const WIKI_ROUTE = 'pages/wiki/wiki'
const indexFlag = 'index'
const orderFlag = 'order-list'
const tailoredFlag = 'tailored'
const wikiFlag = 'wiki'
const ROUTE_MAP = {
  [indexFlag]: '/pages/index/index',
  [orderFlag]: '/pages/order-list/order-list',
  [tailoredFlag]: '/pages/tailored/tailored',
  [wikiFlag]: 'pages/wiki/wiki',
}
const ROUTE_LIST = [
  {
    route: indexFlag,
    name: '首页'
  },
  {
    route: orderFlag,
    name: '订单'
  },
  {
    route: tailoredFlag,
    name: '量体'
  },
  {
    route: wikiFlag,
    name: '小百科'
  },
]

Component({
  data: {
    isIpx: false,
    routeList: ROUTE_LIST,
    active: ROUTE_LIST[0].route,
    isAuth: baas.isAuth(),
  },

  lifetimes: {
    attached() {
      const route = /\/pages\/(.+)\//.exec(router.genCurrentRoute())
      this.setData({
        isIpx: device.isIpx(),
        active: route[1],
        isAuth: baas.isAuth(),
      })
    },
  },

  methods: {
    handleNavEvent(e) {
      const route = e.currentTarget.dataset.route

      if (!baas.isAuth() && (route === orderFlag || route === tailoredFlag)) {
        // wx.showToast({
        //   title: '请先授权小程序并添加手机号',
        //   icon: 'none',
        // })
        return
      }

      const currentPage = router.genCurrentRoute()
      if (ROUTE_MAP[route] === currentPage) return false
      if (route === tailoredFlag) {
        router.push({
          name: route,
        })
      } else {
        router.switchTab({
          name: route,
        })
      }
    },

    userInfoHandler(data) {
      wx.showLoading({
        mask: true,
      })
      baas.authLogin(data)
        .then(res => {
          this.setData({
            isAuth: baas.isAuth(),
          })
          this.navToAuth()
        })
        .catch(err => {
          console.log('err:', err)
        })
        .then(wx.hideLoading)
    },

    navToAuth() {
      router.relaunch({
        name: 'auth',
      })
    },
  },
})
