const io = require('../io/base')
// const constants = require('../config/constants')
// const moment = require('moment')

let USER_INFO

module.exports = async event => {
  try {
    USER_INFO = event.request.user
    const storeParams = event.data
    console.log('start =>', USER_INFO, storeParams)
  
    // 1. 验证邀请码
    // const verifyRes = await BaaS.invoke('verify_invitation_code', {invitation_code: storeParams.invitation_code})
    // if (verifyRes.data !== 'success') throw new Error(verifyRes.error.message)

    // 1. 验证用户是否已经是商家
    const verifyStoreRes = await verifyUserStoreInfo()
    if (verifyStoreRes.length > 0) throw new Error('用户已经是商家')
    // 2. 消耗邀请码
    await logInvitationCodeUsed(storeParams.invitation_code)
    // 3. 新建商家
    const res = await createStore(storeParams)
    // 4. 更新用户信息
    await updateUserInfo()

    return res
  } catch (err) {
    throw err
  }
}

async function verifyUserStoreInfo() {
  try {
    let query = io.query
    query.compare('created_by', '=', USER_INFO.id)
    query.compare('active', '=', true)
    const res = await io.store.setQuery(query).find()
    return res.data.objects
  } catch (err) {
    console.log('error: 验证用户是否已经是商家出错', err)
    throw err
  }
}

async function logInvitationCodeUsed(invitation_code) {
  try {
    let query = io.query
    query.compare('code', '=', invitation_code)
    let record = io.invitationCode.getWithoutData(query)
    record.set('used', true)
    const res = await record.update()
    return res.data
  } catch (err) {
    console.log('error: 消耗邀请码出错', err)
    throw err
  }
}

async function createStore(storeParams) {
  try {
    let record = io.store.create()
    storeParams.created_by = USER_INFO.id
    const res = await record.set(storeParams).save()
    return res.data
  } catch (err) {
    console.log('error: 新建商家出错', err)
    throw err
  }
}

async function updateUserInfo() {
  try {
    let record = io.userprofile.getWithoutData(USER_INFO.id)
    record.set('is_store_user', true)
    const res = await record.update()
    return res.data
  } catch (err) {
    console.log('error: 更新用户信息出错', err)
    throw err
  }
}
