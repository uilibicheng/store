const constants = require('./constants')

module.exports = function(event, callback) {
  if (event.data.prize_redemption_log_id) {
    const utmSource = event.data.utm_source
    const prizeRedemptionLogId = event.data.prize_redemption_log_id
    const logTableId =
      utmSource === constants.TICKET_UTM_SOURCE.ASSISTANCE
        ? constants.BAAS_TABLE_ID.redemption_log_assistance
        : constants.BAAS_TABLE_ID.redemption_log_lottery
    const LogTable = new BaaS.TableObject(logTableId)
    const record = LogTable.getWithoutData(prizeRedemptionLogId)
    let query = {
      locked: 0,
      status: 'initial',
      used_at: null,
    }
    record.set(query)
    record
      .update()
      .then(res => {
        if (res.status === 200) callback(null, {})
        else callback('回滚 prize_redemption_log 出错')
      })
      .catch(err => {
        console.log('回滚 prize_redemption_log 出错', err)
        callback('回滚 prize_redemption_log 出错')
      })
  } else callback(null, {})
}
