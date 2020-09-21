/**
 * 转换 Date 对象
 * @param {Date} date
 * @returns {Object}
 */
function standardizedDate(date) {
  const stdDate = {}
  const format = num => `00${num}`.substr(-2)

  stdDate.year = String(date.getFullYear())
  stdDate.month = format(date.getMonth() + 1)
  stdDate.day = format(date.getDate())
  stdDate.hour = format(date.getHours())
  stdDate.minute = format(date.getMinutes())
  stdDate.second = format(date.getSeconds())

  return stdDate
}

/**
 * 将时间对象或时间戳或 UTCString 转换为毫秒数
 * @param {Date|Number|string} date
 */
function date2ms(date) {
  if (date instanceof Date) return +date

  if (+date) {
    date = +date
    return date / 1e10 > 1 ? date : date * 1000
  } else {
    return +new Date(date)
  }
}

module.exports = {
  date2ms,

  /**
   * 将时间对象或毫秒数或 UTCString 转换为时间戳
   * @param {Date|Number|string} date
   */
  date2timestamp(date) {
    date = date2ms(date)
    return Math.ceil(date / 1000)
  },

  /**
   * 格式化时间戳为相应时间字符串
   * @param {Number} date 时间对象或时间戳或毫秒数或 UTCString
   * @param {String} format 'YYYY-MM-DD hh:mm:ss'
   * @return {String}
   */
  formatDate(date, format) {
    date = date2ms(date)
    const stdDate = standardizedDate(new Date(date))
    const map = {
      YYYY: 'year',
      MM: 'month',
      DD: 'day',
      hh: 'hour',
      mm: 'minute',
      ss: 'second',
    }

    const matchList = format.match(/(YYYY|MM|DD|hh|mm|ss)/g) || []
    matchList.forEach(item => {
      format = format.replace(item, stdDate[map[item]])
    })
    return format
  },

  /**
   * 计算两个时间的天数差
   */
  diffDay(date1, date2) {
    date1 = date2ms(date1)
    date2 = date2ms(date2)
    return Math.floor(Math.abs(date1 - date2) / 1000 / 3600 / 24)
  },

  getServerTimestamp(res) {
    return this.date2timestamp(res.header.Date)
  },
}
