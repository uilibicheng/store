import breadcrumb from './breadcrumb'
import pagination from './pagination'
import common from './common'
import form from './form'
import format from './format'
import time from './time'

export default {
  breadcrumb,
  pagination,
  ...common,
  form,
  format,
  time,
  convertToTable(data) {
    data = data.toString()
    const table = []
    let rows = []
    rows = data.split(/[\r\n]/)
    for (let i = 0; i < rows.length; i++) {
      if (rows[i]) {
        table.push(rows[i].split(',').map(v => v.toString()))
      }
    }
    return table
  },
}
