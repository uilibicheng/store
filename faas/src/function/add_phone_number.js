const io = require('../io/base')
// const constants = require('../config/constants')
const moment = require('moment')

let USER_INFO
let newPhone

module.exports = async event => {
  USER_INFO = event.request.user
  newPhone = event.data.phone
  console.log('start =>', USER_INFO, newPhone)

  // 1. 检查手机号是否已经被其他用户绑定
  const verifiedResult = await verifyPhone()
  if (verifiedResult > 0) throw new Error('此手机号已被绑定')

  // 2. 添加手机号
  await addPhone()

  // 3. 查询是否有这个手机号的导入订单，并给这批订单加用户读权限
  await updateOrderReadPerm()

  return 'success'
}

async function verifyPhone() {
  try {
    let query = io.query
    query.in('phone', [newPhone])
    const res = await io.userprofile.setQuery(query).count()
    return res
  } catch (err) {
    console.log('error: 验证手机号出错', err)
    throw err
  }
}

async function addPhone() {
  try {
    let MyUser = () => new BaaS.User()
    let user = MyUser().getWithoutData(USER_INFO.id)
    const res = await user.append('phone', newPhone).update()
    return res
  } catch (err) {
    console.log('error: 添加手机号出错', err)
    throw err
  }
}

// async function updateOrderReadPerm() {
//   try {
//     let query = io.query
//     query.contains('contact_phone', newPhone)
//     query.notExists('user_id')
//     query.isNotNull('imported_at')
//     let records = io.order.getWithoutData(query)
//     records.set('avatar', USER_INFO.avatar_url)
//     records.set('user_id', USER_INFO.id)
//     records.set('related_at', moment().unix())
//     records.uAppend('read_perm', `user:${USER_INFO.id}`)
//     let res = await records.update()
//     return res
//   } catch (err) {
//     console.log('error: 更新订单读权限出错', err)
//     throw err
//   }
// }

async function updateOrderReadPerm() {
  try {
    let query = io.query
    query.contains('contact_phone', newPhone)
    query.notExists('user_id')
    query.isNotNull('imported_at')
    let orders = await io.order.setQuery(query).limit(200).find()
    orders = orders.data.objects
    if (orders.length === 0) {
      console.log('没有适配的导入订单')
      return 'success'
    }
    const finalRes = await Promise.all(orders.map(item => {
      let record = io.order.getWithoutData(item.id)
      record.set('avatar', USER_INFO.avatar_url)
      record.set('user_id', USER_INFO.id)
      record.set('related_at', moment().unix())
      record.set('read_perm', [...item.read_perm, `user:${USER_INFO.id}`])
      return record.update()
    }))

    return finalRes
  } catch (err) {
    console.log('error: 更新订单读权限出错', err)
    throw err
  }
}
