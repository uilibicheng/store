const constants = require('./constants')

function getOrder(orderId, userId) {
  const tableId = constants.BAAS_TABLE_ID.order
  const OrderTable = new BaaS.TableObject(tableId)
  return OrderTable.get(orderId)
    .then(res => {
      const order = res.data
      if (order.created_by !== userId) {
        throw new Error('订单未找到')
      } else {
        return order
      }
    })
    .catch(err => {
      console.log('获取订单时出错: ', err)
      throw err
    })
}

function genOrderData(order) {
  if (order.status === constants.ORDER_STATUS.PAID) {
    order.tickets = order.tickets_with_barcode
  }
  delete order.tickets_with_barcode
  delete order.tickets_barcode_list
  return order
}

module.exports = function(event, callback) {
  let {orderId} = event.data
  const userId = event.request.user.id
  getOrder(orderId, userId)
    .then(order => genOrderData(order))
    .then(order => {
      callback(null, {
        message: 'success',
        order,
      })
    })
    .catch(err => {
      console.log('获取订单失败', err)
      callback(err)
    })
}
