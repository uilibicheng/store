const getUserInfo = require('./getUserInfo')
let unionid = null

module.exports = function getUnionid(userId) {
  if (unionid !== null) {
    return Promise.resolve(unionid)
  } else {
    return getUserInfo(userId)
      .then(res => {
        unionid = res.unionid
        return unionid
      })
      .catch(err => {
        console.log('error: 获取用户 unionid 时出错', err)
        throw err
      })
  }
}
