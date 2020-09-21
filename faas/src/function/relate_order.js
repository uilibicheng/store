const io = require('../io/base')
// const constants = require('../config/constants')
const moment = require('moment')

let USER_INFO

module.exports = async event => {
  USER_INFO = event.request.user
  const batchNo = event.data.batch_no
  console.log('start =>', USER_INFO, batchNo)

  // 1. 检查订单是否已被绑定
  const orderList = await getOrderByBatchNo(batchNo)
  if (orderList[0].user_id) throw new Error('该订单已关联')

  // 2. 关联订单
  const res = await Promise.all(orderList.map(order => {
    return relateOrder(order.id, order)
  }))

  return res
}

// async function getOrderInfoByOrderId(orderId) {
//   try {
//     const res = await io.order.get(orderId)
//     return res.data
//   } catch (err) {
//     console.log('error: 检查该订单是否已被绑定出错', err)
//     throw err
//   }
// }

async function getOrderByBatchNo(batchNo) {
  try {
    let query = io.query
    query.compare('batch_no', '=', batchNo)
    const res = await io.order.setQuery(query).limit(200).find()
    return res.data.objects
  } catch (err) {
    console.log('error: 根据批次号查订单', err)
    throw err
  }
}

async function relateOrder(orderId, orderInfo) {
  try {
    const userRes = await io.userprofile.get(USER_INFO.id)
    const userPhone = userRes.data.phone[0]
    let order = io.order.getWithoutData(orderId)
    order.set('avatar', USER_INFO.avatar_url)
    order.set('user_id', USER_INFO.id)
    order.set('related_at', moment().unix())
    order.set('contact_phone', userPhone)
    order.set('read_perm', [...orderInfo.read_perm, `user:${USER_INFO.id}`])
    // const res = await order.update()
    // return res.data
    return order.update().then(res => res.data)
  } catch (err) {
    console.log('error: 关联订单出错', err)
    throw err
  }
}
