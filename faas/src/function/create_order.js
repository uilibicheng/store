const io = require('../io/base')
// const constants = require('../config/constants')
// const moment = require('moment')
const pyfl = require('pyfl').default

let USER_INFO

module.exports = async event => {
  try {
    USER_INFO = event.request.user
    const contactName = event.data.contact_name
    const orderList = event.data.order_list
    console.log('start =>', USER_INFO, contactName, orderList)
  
    // 1. 获取商家信息
    const storeInfo = await getStoreInfo()

    // 2. 生成批次号
    const batchNo = await genBatchNo()

    // 3. 批量新建订单
    const res = await createOrder(orderList, contactName, storeInfo, batchNo)

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

async function genBatchNo() {
  try {
    let randomBatchNo = Math.random().toString(36).substr(2, 20)

    let query = io.query
    query.compare('batch_no', '=', randomBatchNo)

    const res = await io.order.setQuery(query).find()
    if (res.data.objects > 0) {
      return await genBatchNo()
    } else {
      return randomBatchNo
    }
  } catch (err) {
    console.log('error: 生成批次号出错', err)
    throw err
  }
}

async function createOrder(orderList, contactName, storeInfo, batchNo) {
  try {
    let records = orderList.map(item => {
      let params = {}
      params.order_id = item.order_id
      params.batch_no = batchNo
      params.contact_name = contactName
      params.contact_name_spelling = pyfl(contactName).toLocaleUpperCase()
      params.tailored_image = item.tailored_image
      params.product_list = formatProductList(item.clothes)
      params.product_status = formatProductStatus(item.clothes)
      params.store_note = item.store_note
      params.store_id = storeInfo.id
      params.store_name = storeInfo.name
      params.store_phone = storeInfo.phone
      params.created_by = USER_INFO.id
      return params
    })
    const res = await io.order.createMany(records)
    return res.data
  } catch (err) {
    console.log('error: 批量新建订单出错', err)
    throw err
  }
}

function formatProductList(clothes) {
  try {
    let productList = []
    Object.keys(clothes).forEach(item => {
      for(let i = 0; i < clothes[item]; i++) {
        let product = {
          clothes_type: item,
          clothes_type_index: i + 1,
          status: 'measured',
          tailoring_data: [],
        }
        productList.push(product)
      }
    })
    return productList
  } catch (err) {
    console.log('error: formatProductList 出错', err)
    throw err
  }
}

function formatProductStatus(clothes) {
  try {
    let statusList = []
    Object.keys(clothes).forEach(item => {
      for(let i = 0; i < clothes[item]; i++) {
        statusList.push('measured')
      }
    })
    return statusList
  } catch (err) {
    console.log('error: formatProductStatus 出错', err)
    throw err
  }
}
