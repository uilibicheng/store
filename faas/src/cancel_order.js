const constants = require('./constants')
let OrderTable

function cancelOrder(orderId, userId) {
  return OrderTable.get(orderId)
    .then(res => {
      if (res.data.created_by !== userId) {
        throw new Error('订单未找到')
      }
      if (res.data.status !== constants.ORDER_STATUS.NOT_PAID) {
        throw new Error('只能取消未支付的订单')
      }
    })
    .then(() => {
      const record = OrderTable.getWithoutData(orderId)
      record.set('status', constants.ORDER_STATUS.CANCELLED)
      record.set('cancelled_at', parseInt(Date.now() / 1000))
      return record.update()
    })
    .catch(err => {
      console.log('error: 取消订单时出错', err)
      throw err
    })
}

module.exports = function(event, callback) {
  let {orderId} = event.data
  const tableId = constants.BAAS_TABLE_ID.order
  OrderTable = new BaaS.TableObject(tableId)
  const userId = event.request.user.id
  cancelOrder(orderId, userId)
    .then(() => callback(null, {message: 'success'}))
    .catch(err => {
      console.log('订单取消失败', err)
      callback('订单取消失败')
    })
}
