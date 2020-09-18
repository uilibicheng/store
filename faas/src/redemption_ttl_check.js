const moment = require('moment-timezone')
const constants = require('./constants')

function closeRedemptionLogs(offset = 0, limit = 500) {
  let tableId = constants.BAAS_TABLE_ID.prize_redemption_log
  const LogTable = new BaaS.TableObject(tableId)
  const date =
    new Date(
      moment()
        .subtract(24, 'hours')
        .format()
    ).getTime() / 1000
  const query = new BaaS.Query()
  query.compare('status', '=', constants.REDEMPTION_LOG_STATUS.PENDING)
  query.compare('created_at', '<', date)
  const logs = LogTable.offset(offset)
    .limit(limit)
    .getWithoutData(query)
  logs.set({
    status: constants.REDEMPTION_LOG_STATUS.CLOSED,
    closed_at: parseInt(Date.now() / 1000),
  })
  return logs
    .update()
    .then(res => {
      if (res.data.next !== null) {
        return closeRedemptionLogs(res.data.offset + limit)
      }
    })
    .catch(err => {
      console.log('error: 关闭未核销兑换记录列表时出错', err)
      throw err
    })
}

module.exports = function(event, callback) {
  closeRedemptionLogs()
    .then(() => callback(null, {message: 'success'}))
    .catch(err => callback(err))
}
