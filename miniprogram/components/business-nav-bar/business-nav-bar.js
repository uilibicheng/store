import device from '../../lib/device'
import router from '../../lib/router'

const INDEX_ROUTE = '/pages/business-index/business-index'
const ORDER_ROUTE = '/pages/business-order-list/business-order-list'
const WIKI_ROUTE = 'pages/wiki/wiki'
const indexFlag = 'business-index'
const orderFlag = 'business-order-list'
const wikiFlag = 'wiki'
const ROUTE_MAP = {
  [indexFlag]: INDEX_ROUTE,
  [orderFlag]: ORDER_ROUTE,
  [wikiFlag]: WIKI_ROUTE,
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
    route: wikiFlag,
    name: '小百科'
  },
]

Component({
  data: {
    isIpx: false,
    routeList: ROUTE_LIST,
    active: ROUTE_LIST[0].route,
  },

  lifetimes: {
    attached() {
      const route = /\/pages\/(.+)\//.exec(router.genCurrentRoute())
      this.setData({ isIpx: device.isIpx(), active: route[1] })
    },
  },

  methods: {
    handleNavEvent(e) {
      const route = e.currentTarget.dataset.route
      const currentPage = router.genCurrentRoute()
      if (ROUTE_MAP[route] === currentPage) return false
      router.switchTab({
        name: route,
      })
    },
  },
})
