const io = require('../io/base')
// const constants = require('../config/constants')
// const moment = require('moment')

let USER_INFO

module.exports = async event => {
  USER_INFO = event.request.user
  const batchNo = event.data.batch_no
  console.log('start =>', USER_INFO, batchNo)

  // 1. 根据批次号查订单
  const orderList = await getOrderByBatchNo(batchNo)
  const orderIdList = orderList.map(item => {
    return item.order_id
  })

  // 2. 根据商家 id 查商家信息
  let storeInfo = await getStoreInfoByStoreId(orderList[0].store_id)
  storeInfo.order_id_list = orderIdList

  return storeInfo
}

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

async function getStoreInfoByStoreId(storeId) {
  try {
    const res = await io.store.get(storeId)
    return res.data
  } catch (err) {
    console.log('error: 根根据商家 id 查商家信息出错', err)
    throw err
  }
}
