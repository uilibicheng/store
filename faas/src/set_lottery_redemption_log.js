// 当有奖品未兑换过期 / 被核销时，检查该记录是否是抽奖奖品，如果是则把抽奖奖品记录状态改为已过期 / 已使用
const constants = require('./constants')

module.exports = function(event, callback) {
  if (event.data.prize_redemption_log_id) {
    const prizeRedemptionLogId = event.data.prize_redemption_log_id
    const logTableId = constants.BAAS_TABLE_ID.redemption_log_lottery
    const LogTable = new BaaS.TableObject(logTableId)
    const record = LogTable.getWithoutData(prizeRedemptionLogId)
    if (event.data.status === 'closed') {
      record.set('status', 'expired')
    } else if (event.data.status === 'redeemed') {
      record.set('status', 'used')
    }

    record
      .update()
      .then(res => {
        if (res.status === 200) callback(null, {})
        else callback('设置 prize_redemption_log 已过期出错')
      })
      .catch(err => {
        console.log('设置 prize_redemption_log 已过期出错', err)
        callback('设置 prize_redemption_log 已过期出错')
      })
  } else callback(null, {})
}
