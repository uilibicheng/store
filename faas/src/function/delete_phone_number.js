const io = require('../io/base')
// const constants = require('../config/constants')
// const moment = require('moment')

let USER_INFO
let deletePhone

module.exports = async event => {
  USER_INFO = event.request.user
  deletePhone = event.data.phone
  console.log('start =>', USER_INFO, deletePhone)

  // 1. 删除手机号
  await deleteUserPhone()

  // await updateImportedOrderReadPerm()
  // await updateStoreOrderReadPerm()
  // 2. 查询是否有这个手机号的导入订单，并给这批订单去除用户读权限
  // 3. 查询是否有这个手机号的商家新建订单，取消关联（去除用户读权限）

  await updateOrderReadPerm()

  return 'success'
}

async function deleteUserPhone() {
  try {
    let MyUser = () => new BaaS.User()
    let user = MyUser().getWithoutData(USER_INFO.id)
    const res = await user.remove('phone', deletePhone).update()
    return res
  } catch (err) {
    console.log('error: 删除手机号出错', err)
    throw err
  }
}

// async function updateImportedOrderReadPerm() {
//   try {
//     let query = io.query
//     // query.contains('contact_phone', deletePhone)
//     query.isNotNull('imported_at')
//     query.compare('user_id', '=', USER_INFO.id)
//     let records = io.order.getWithoutData(query)
//     records.unset('avatar')
//     records.unset('user_id')
//     records.unset('related_at')
//     records.remove('read_perm', `user:${USER_INFO.id}`)
//     let res = await records.update()
//     return res
//   } catch (err) {
//     console.log('error: 更新导入订单读权限出错', err)
//     throw err
//   }
// }

// async function updateStoreOrderReadPerm() {
//   try {
//     let query = io.query
//     // query.contains('contact_phone', deletePhone)
//     query.compare('user_id', '=', USER_INFO.id)
//     query.isNull('imported_at')
//     let records = io.order.getWithoutData(query)
//     records.unset('avatar')
//     records.unset('user_id')
//     records.unset('related_at')
//     records.unset('contact_phone')
//     records.remove('read_perm', `user:${USER_INFO.id}`)
//     let res = await records.update()
//     return res
//   } catch (err) {
//     console.log('error: 更新商家新建订单读权限出错', err)
//     throw err
//   }
// }

async function updateOrderReadPerm() {
  try {
    let query = io.query
    query.compare('user_id', '=', USER_INFO.id)
    let orders = await io.order.setQuery(query).limit(200).find()
    orders = orders.data.objects
    if (orders.length === 0) {
      console.log('没有关联的订单')
      return 'success'
    }
    const finalRes = await Promise.all(orders.map(item => {
      let record = io.order.getWithoutData(item.id)
      record.unset('avatar')
      record.unset('user_id')
      record.unset('related_at')
      if (!item.imported_at) record.unset('contact_phone')
      let readPermList = item.read_perm.filter(readItem => {
        return readItem.indexOf(USER_INFO.id) === (-1)
      })
      record.set('read_perm', readPermList)
      return record.update()
    }))

    return finalRes
  } catch (err) {
    console.log('error: 更新订单读权限出错', err)
    throw err
  }
}
