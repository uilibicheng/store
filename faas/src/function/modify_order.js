const io = require('../io/base')
// const constants = require('../config/constants')
// const moment = require('moment')
const pyfl = require('pyfl').default

let USER_INFO

module.exports = async event => {
  try {
    USER_INFO = event.request.user
    const modifiedOrder = event.data.modified_order
    console.log('start =>', USER_INFO, modifiedOrder)

    // if (modifiedOrder.created_by !== USER_INFO.id) throw new Error('修改订单失败')

    // 修改订单信息
    const res = await modifyOrder(modifiedOrder)

    return res
  } catch (err) {
    throw err
  }
}

async function getStoreInfo() {
  try {
    let query = io.query
    query.compare('created_by', '=', USER_INFO.id)
    const res = await io.store.setQuery(query).find()
    return res.data.objects[0]
  } catch (err) {
    console.log('error: 获取商家信息出错', err)
    throw err
  }
}

async function modifyOrder(modifiedOrder) {
  try {
    let record = io.order.getWithoutData(modifiedOrder.id)

    let params = {}
    params.order_id = modifiedOrder.order_id
    params.contact_name = modifiedOrder.contact_name
    params.contact_name_spelling = pyfl(modifiedOrder.contact_name).toLocaleUpperCase()
    params.tailored_image = modifiedOrder.tailored_image
    params.product_list = modifiedOrder.product_list
    params.product_status = modifiedOrder.product_list.map(item => item.status)
    params.store_note = modifiedOrder.store_note
    params.tailored_body_data = modifiedOrder.tailored_body_data

    const res = await record.set(params).update()
    return res.data
  } catch (err) {
    console.log('error: 修改订单信息出错', err)
    throw err
  }
}
