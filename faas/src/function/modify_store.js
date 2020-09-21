const io = require('../io/base')
// const constants = require('../config/constants')
// const moment = require('moment')

let USER_INFO

module.exports = async event => {
  try {
    USER_INFO = event.request.user
    const storeParams = event.data
    console.log('start =>', USER_INFO, storeParams)
  
    // 修改商家信息
    const res = await modifyStoreInfo(storeParams)

    return res
  } catch (err) {
    throw err
  }
}

async function modifyStoreInfo(storeParams) {
  try {
    let query = io.query
    query.compare('created_by', '=', USER_INFO.id)
    let record = io.store.getWithoutData(query)
    const res = await record.set(storeParams).update()
    return res.data
  } catch (err) {
    console.log('error: 修改商家信息出错', err)
    throw err
  }
}
