const moment = require('moment-timezone')
const constants = require('../constants')

/**
 * 获得当前的时间往前的几天内
 * 如：
 * days = 1, 表示今天 00:00 ～ 23:59
 * days = 2, 表示昨天 00:00 ～ 今天 23:59
 */
function getDaysPeriod(days = 1, timeZone = new Date().getTimezoneOffset() / 60, asDatabaseTimeStamp = true) {
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
function getDatabaseTimeStamp(time) {
  return Math.floor(time / 1000)
}

function timeWithTimeZone(time) {
  return moment.tz(time, constants.TIMEZONE).unix()
}

module.exports = {
  getDaysPeriod,
  getDatabaseTimeStamp,
  timeWithTimeZone
}
