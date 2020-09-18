import * as time from './time'
import * as localStorage from './local-storage'

export default {
  ...time,
  ...localStorage,
  convertToTable(data) {
    data = data.toString()
    let table = []
    let rows = []
    let splitStr = data.indexOf('\r\n') > -1 ? '\r\n' : '\r'
    rows = data.split(splitStr)
    for (let i = 0; i < rows.length; i++) {
      table.push(rows[i].split(',').map(v => v.toString()))
    }
    return table
  },
  isPC() {
    let ua = navigator.userAgent
    let reg = /Android|iPhone|SymbianOS|Windows Phone|iPad|iPod|Mobile/gi

    return !reg.test(ua)
  },
}
