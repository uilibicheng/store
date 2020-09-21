const io = require('../io/base')
const constants = require('../config/constants')
const moment = require('moment')
const pyfl = require('pyfl').default

module.exports = async function(event, callback) {
  try {
    const res = await initializeData(event)
    callback(null, res)
  } catch (err) {
    callback(err, null)
  }
}

async function initializeData(event) {
  try {
    const orderList = event.data
    const promiseList = orderList.reduce((result, item) => {
      if (item[0] === '订单号') {
        return result
      }
      const obj = {}
      obj.order_id = item[0]
      obj.store_id = item[1]
      obj.store_phone = item[2]
      obj.contact_name = item[3]
      obj.contact_name_spelling = pyfl(item[3]).toUpperCase()
      obj.contact_phone = item[4]
      obj.product_list = []
      obj.product_status = []
      obj.imported_at = moment().unix()
      for (let index = 5; index < item.length; index++) {
        const product = {}
        const clothes = item[index].split('-')
        product.clothes_type = constants.CLOTHES_NAME[clothes[0].match(/[\u4e00-\u9fa5]+/g)[0]]
        product.clothes_type_index = clothes[0].match(/\d+$/g)[0]
        const findIndex = clothes[1].indexOf('第')
        const statusName = findIndex > -1 ? clothes[1].substring(0, findIndex) : clothes[1]
        product.status = constants.ORDER_STATUS_TYPE[statusName]
        if (findIndex > -1) {
          product[`${product.status}_count`] = clothes[1].match(/\d+/g)[0]
        }
        product.tailoring_data = []
        obj.product_list.push(product)
        obj.product_status.push(product.status)
      }
      result.push(createOrder(obj, event.request.user))
      return result
    }, [])
    return Promise.all(promiseList).then(() => {
      return 'success'
    })
  } catch (err) {
    throw err
  }
}

async function getUserData(phone) {
  try {
    const query = io.query
    query.in('phone', [phone])
    let res = await io.userprofile.setQuery(query).find()
    return res.data.objects
  } catch (err) {
    throw err
  }
}

async function getStoreData(id) {
  try {
    let res = await io.store.get(id)
    return res.data
  } catch (err) {
    throw err
  }
}

async function createOrder(params, creator) {
  try {
    let user = await getUserData(params.contact_phone)
    let store = await getStoreData(params.store_id)
    let order = io.order.create()
    params.read_perm = [`user:${creator.id}`, `user:${store.created_by}`]
    if (user.length) {
      params.avatar = user[0].avatar
      params.user_id = user[0].id
      params.related_at = moment().unix()
      params.read_perm.push(`user:${user[0].id}`)
    }
    order.set(params)
    let res = await order.save()
    return res
  } catch (err) {
    throw err
  }
}
