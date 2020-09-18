const constants = require('./constants')
const moment = require('moment-timezone')
const settingTableId = constants.BAAS_TABLE_ID.settings
const SettingTable = new BaaS.TableObject(settingTableId)
const ONE_DAY = 24 * 60 * 60 * 1000

// 过期提醒设置
function getExpiredWarningSetting() {
  const query = new BaaS.Query()
  query.compare('label', '=', 'default')
  return SettingTable.limit(1)
    .offset(0)
    .setQuery(query)
    .find()
    .then(res => {
      return res.data.objects[0] || []
    })
    .catch(() => {
      throw new Error('获取库存预警设置失败！')
    })
}

function checkTickets(num) {
  const tableId = constants.BAAS_TABLE_ID.ticket_inventory
  const TicketTable = new BaaS.TableObject(tableId)
  const nowMoment = moment().tz(constants.TIMEZONE)
  const now = nowMoment.format()
  // 3天后的时间戳
  const expiredTimeVlaue = nowMoment.valueOf() + num * ONE_DAY
  const expiredDate = moment.tz(expiredTimeVlaue, constants.TIMEZONE).format()
  const query = new BaaS.Query()
  query.compare('sold', '=', 0)
  query.compare('expires_at', '<=', expiredDate)
  query.compare('expires_at', '>', now)
  return TicketTable.setQuery(query)
    .offset(0)
    .limit(500)
    .expand(['ticket'])
    .find()
    .then(res => res.data.objects)
    .catch(err => {
      console.log('error: 获取门票库存票数据时出错', err)
    })
}

// 同一 sku 以及 过期时间相同的数组去重
function unique(array) {
  const res = []
  for (var i = 0; i < array.length; i++) {
    for (var j = 0; j < res.length; j++) {
      if (array[i].sku === res[j].sku && array[i].expires_at === res[j].expires_at) {
        break
      }
    }
    if (j === res.length) {
      res.push(array[i])
    }
  }
  return res
}

/**
 *
 * @param {*} recipient 收件人
 * @param {*} subject 邮件标题
 * @param {*} body 邮件内容
 */
function sendEmail(recipient = '', subject = '', body = '') {
  console.log('body', body)
  const data = {
    recipient,
    subject,
    body,
  }

  return BaaS.sendEmail(data).catch(() => {
    throw new Error(`邮件发送失败，收件人地址：${recipient}`)
  })
}

module.exports = async function(event, callback) {
  try {
    const expiredWarningSetting = await getExpiredWarningSetting()
    const {enable_expired_warning, expired_warning_threshold, expired_warning_email, id} = expiredWarningSetting
    // console.log(expiredWarningSetting)

    const tickList = await checkTickets(expired_warning_threshold)
    if (!enable_expired_warning || !expired_warning_email.length || !tickList.length) {
      return callback(null, {message: 'No need to send email.'})
    }

    const res = unique(tickList)

    const title = 'Expiry alert'
    const content = ['<p>The following products from Wechat Store will soon be expired:</p>']
    res.forEach(item => {
      content.push(
        `<p>${item.ticket.english_name} Expired date: ${moment(item.expires_at)
          .tz(constants.TIMEZONE)
          .format('DD/MM/YYYY')}</p>`
      )
    })

    const promises = expired_warning_email.map(item => {
      return sendEmail(item, title, content.join(''))
    })

    Promise.all(promises)
      .then(() => {
        callback(null, {status: 'success', message: 'send email success!'})
      })
      .catch(err => {
        callback(err)
      })
  } catch (err) {
    callback(err)
  }
}
