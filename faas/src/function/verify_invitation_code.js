const io = require('../io/base')
// const constants = require('../config/constants')
const moment = require('moment')

let USER_INFO

module.exports = async event => {
  USER_INFO = event.request.user
  const invitationCode = event.data.invitation_code
  console.log('start =>', USER_INFO, invitationCode)

  // 获取邀请码信息
  const invitationCodeList = await getInvitationCodeInfo(invitationCode)

  if (invitationCodeList.length === 0) throw new Error('邀请码不存在')
  const invitationCodeInfo = invitationCodeList[0]
  if (invitationCodeInfo.expired_at <= moment().unix()) throw new Error('邀请码已过期')
  if (invitationCodeInfo.used) throw new Error('邀请码已被使用')
  if (!invitationCodeInfo.active) throw new Error('邀请码不可用')

  return 'success'
}

async function getInvitationCodeInfo(invitationCode) {
  try {
    let query = io.query
    query.compare('code', '=', invitationCode)
    const res = await io.invitationCode.setQuery(query).find()
    return res.data.objects
  } catch (err) {
    console.log('error: 获取邀请码信息出错', err)
    throw err
  }
}
