export default {
  genURL,
  genRoute,
  genCurrentRoute,
  genCurrentURL,

  push(params) {
    const {url, success, fail, complete} = parseParams(params)
    wx.navigateTo({url, success, fail, complete})
  },

  replace(params) {
    const {url, success, fail, complete} = parseParams(params)
    wx.redirectTo({url, success, fail, complete})
  },

  relaunch(params) {
    const {url, success, fail, complete} = parseParams(params)
    wx.reLaunch({url, success, fail, complete})
  },

  /**
   * 跳转页面, 不能带 query 参数
   * @param {object} params {name, success, fail, complete}
   */
  switchTab(params) {
    const {url, success, fail, complete} = parseParams(params, false)
    wx.switchTab({url, success, fail, complete})
  },

  /**
   * 返回上一级或多级页面
   * @param {object} params {delta, success, fail, complete}
   */
  back(params) {
    wx.navigateBack(params)
  },
}

/**
 * 解析传入的参数
 * @param {object} params {name, data, success, fail, complete}
 * @param {boolean} withQuery 是否带 query 参数
 */
function parseParams(params, withQuery = true) {
  const {name, data, success = () => {}, fail = () => {}, complete = () => {}} = params
  if (!name) throw Error('Route name is required.')

  const url = withQuery ? genURL(name, data) : genRoute(name)
  return {url, success, fail, complete}
}

/**
 * 构造完整 URL，包括 route 和 query
 * @param {string} name 与页面文件名相同
 * @param {object} data 用来构造 query 的对象
 */
function genURL(name, data) {
  let url = genRoute(name)
  const query = genQuery(data)

  if (query) url += `?${query}`

  return url
}

/**
 * 构造当前页面完整的 URL，包括 route 和 query
 * @param {object} data 用来构造 query 的对象
 */
function genCurrentURL(data) {
  let url = genCurrentRoute()
  const query = genQuery(data)

  if (query) url += `?${query}`

  return url
}

function genRoute(name) {
  return `/pages/${name}/${name}`
}

function genCurrentRoute() {
  const currentPage = getCurrentPages().slice(-1)[0]
  return '/' + currentPage.route
}

function genQuery(data) {
  if (!data) return ''
  return Object.keys(data)
    .map(key => {
      const val = data[key]
      return `${key}=${String(val)}`
    })
    .join('&')
}
