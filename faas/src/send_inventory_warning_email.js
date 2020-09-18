const moment = require('moment-timezone')
const constants = require('./constants')
const settingTableId = constants.BAAS_TABLE_ID.settings
const SettingTable = new BaaS.TableObject(settingTableId)
const TIME_RANGE = [8, 20]

// 库存预警设置
function getInventoryWarningSetting() {
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

function updateInventoryWarningSetting(settingId = '', productId = '') {
  const settingRecord = SettingTable.getWithoutData(settingId)
  settingRecord.uAppend('has_send_email_list', productId)
  return settingRecord.update().catch(() => {
    throw new Error('更新记录已发送邮件预警的产品 ID 失败')
  })
}

/**
 *
 * @param {*} recipient 收件人
 * @param {*} subject 邮件标题
 * @param {*} body 邮件内容
 */
function sendEmail(recipient = '', subject = '', body = '') {
  let data = {
    recipient,
    subject,
    body,
  }

  return BaaS.sendEmail(data).catch(() => {
    throw new Error(`邮件发送失败，收件人地址：${recipient}`)
  })
}

module.exports = async function(event, callback) {
  const {inventory, is_active, english_name, id: productId} = event.data
  console.log('data',event.data)
  const hours = new Date(moment.tz(constants.TIMEZONE).format()).getHours()
  try {
    const inventoryWarningsetting = await getInventoryWarningSetting()
    const {
      inventory_warning_threshold,
      has_send_email_list,
      inventory_warning_email,
      enable_inventory_warning,
      id: settingId,
    } = inventoryWarningsetting
    // console.log(inventoryWarningsetting)

    // 不在 8:00 - 20:00 时间范围内、未上架、未启用库存预警、
    // 未设置预警提醒邮箱、当日已发送过邮件的产品、未小于预警值时不发送预警邮件
    if (
      hours < TIME_RANGE[0] ||
      hours > TIME_RANGE[1] ||
      !is_active ||
      !enable_inventory_warning ||
      !inventory_warning_email.length ||
      !Array.isArray(has_send_email_list) ||
      (Array.isArray(has_send_email_list) && has_send_email_list.findIndex(v => v === productId) > -1) ||
      inventory > inventory_warning_threshold
    ) {
      return callback(null, {message: 'No need to send email.'})
    }

    const title = 'Wechat store-low inventory'
    const content = '<p>The following products from Wechat Store are in low inventory:</p>' + `<p>${english_name}，Current Qty: ${inventory}.</p>`
    const promises = inventory_warning_email.map(item => {
      return sendEmail(item, title, content)
    })

    Promise.all(promises)
      .then(res => {
        res.forEach(item => {
          if (Error.prototype.isPrototypeOf(item)) {
            throw item
          }
        })
        updateInventoryWarningSetting(settingId, productId).then(res => {
          if (res.status === 200) {
            console.log(`total length: ${promises.length}`)
            callback(null, {status: 'success', message: 'send email success!'})
          }
        })
      })
      .catch(err => {
        callback(err)
      })
  } catch (error) {
    callback(error)
  }
}
