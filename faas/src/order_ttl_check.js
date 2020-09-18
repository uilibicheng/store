const moment = require('moment-timezone')
const constants = require('./constants')

/**
 * 批量关闭过期订单
 */
function closeOrders(offset = 0, limit = 500) {
  let tableId = constants.BAAS_TABLE_ID.order
  const OrderTable = new BaaS.TableObject(tableId)
  const date =
    new Date(
      moment()
        .subtract(3, 'hours')
        .format()
    ).getTime() / 1000
  const query = new BaaS.Query()
  query.compare('status', '=', constants.ORDER_STATUS.NOT_PAID)
  query.compare('created_at', '<', date)
  const orders = OrderTable.offset(offset)
    .limit(limit)
    .getWithoutData(query)
  orders.set({
    status: constants.ORDER_STATUS.CLOSED,
    closed_at: parseInt(Date.now() / 1000),
  })
  return orders
    .update()
    .then(res => {
      if (res.data.next !== null) {
        return closeOrders(res.data.offset + limit)
      }
    })
    .catch(err => {
      console.log('error: 关闭订单列表时出错', err)
      throw err
    })
}

module.exports = function(event, callback) {
  closeOrders()
    .then(() => callback(null, {message: 'success'}))
    .catch(err => callback(err))
}
