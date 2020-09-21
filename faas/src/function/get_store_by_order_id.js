const io = require('../io/base')
// const constants = require('../config/constants')
// const moment = require('moment')

let USER_INFO

module.exports = async event => {
  USER_INFO = event.request.user
  const orderId = event.data.order_id
  console.log('start =>', USER_INFO, orderId)

  // 1. 根据订单号查订单信息
  const orderInfo = await getOrderInfoByOrderId(orderId)

  // 2. 根据商家 id 查商家信息
  let storeInfo = await getStoreInfoByStoreId(orderInfo.store_id)
  storeInfo.order_id = orderInfo.order_id

  return storeInfo
}

async function getOrderInfoByOrderId(orderId) {
  try {
    const res = await io.order.get(orderId)
    return res.data
  } catch (err) {
    console.log('error: 根据订单号查订单信息出错', err)
    throw err
  }
}

async function getStoreInfoByStoreId(storeId) {
  try {
    const res = await io.store.get(storeId)
    return res.data
  } catch (err) {
    console.log('error: 根根据商家 id 查商家信息出错', err)
    throw err
  }
}
