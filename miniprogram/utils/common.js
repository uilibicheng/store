import {ROUTE} from '../config/constants'

export const formatResponse = res => {
  // hide loading toast
  wx.util.hideLoading()

  const hasServerErrorMsg = res.response && res.response.data && res.response.data.error_msg
  const message = hasServerErrorMsg ? res.response.data.error_msg : res.message
  wx.showModal({
    title: '提示',
    content: message,
    showCancel: false,
  })
}

export const dateFormat = function(date, fmt) {
  const _date = new Date(date)
  var o = {
    'M+': _date.getMonth() + 1, // 月份
    'd+': _date.getDate(), // 日
    'h+': _date.getHours(), // 小时
    'm+': _date.getMinutes(), // 分
    's+': _date.getSeconds(), // 秒
    'q+': Math.floor((_date.getMonth() + 3) / 3), // 季度
    S: _date.getMilliseconds(), // 毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (_date.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
  return fmt
}

export const searchStr2Obj = searchStr => {
  let params = searchStr.split('&')
  let obj = {}

  params.forEach(paramStr => {
    let objArr = paramStr.split('=')
    obj[objArr[0]] = objArr[1]
  })

  return obj
}

// 字符串转 utf-8
export const toUtf8 = str => {
  try {
    return decodeURIComponent(escape(str))
  } catch (e) {
    return str
  }
}

/**
 * 获得当前的时间往前的几天内
 * 如：
 * days = 1, 表示今天 00:00 ～ 23:59
 * days = 2, 表示昨天 00:00 ～ 今天 23:59
 * timeZone = -8, 表示东八区
 */
export function getDaysPeriod(days = 1, timeZone = new Date().getTimezoneOffset() / 60, asDatabaseTimeStamp = true) {
  const oneDayMilliseconds = 24 * 60 * 60 * 1000
  const timeZoneOffsetMilliseconds = timeZone * 60 * 60 * 1000
  const todayStartTime =
    Math.floor((new Date().getTime() - timeZoneOffsetMilliseconds) / oneDayMilliseconds) * oneDayMilliseconds +
    timeZoneOffsetMilliseconds
  const startTime = todayStartTime - (days - 1) * oneDayMilliseconds
  const endTime = todayStartTime + oneDayMilliseconds - 1
  if (asDatabaseTimeStamp) {
    return [Math.floor(startTime / 1000), Math.floor(endTime / 1000)]
  } else {
    return [startTime, endTime]
  }
}

/**
 * 将时间转成数据库 timestamp 的格式
 */
export function getDatabaseTimeStamp(time) {
  return Math.floor(time / 1000)
}

/**
 * 是否能退回首页
 */
export function canNavigateToPage(route = ROUTE.INDEX) {
  var curPages = getCurrentPages()
  return curPages.length > 1 && `/${curPages[curPages.length - 2].route}` === route
}

export function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
