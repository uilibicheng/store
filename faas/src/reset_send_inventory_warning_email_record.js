const constants = require('./constants')
const settingTableId = constants.BAAS_TABLE_ID.settings
const SettingTable = new BaaS.TableObject(settingTableId)

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
    .catch(err => {
      console.log('获取库存预警出错')
      throw err
    })
}

function updateInventoryWarningSetting(id = '') {
  const settingRecord = SettingTable.getWithoutData(id)
  settingRecord.set({
    has_send_email_list: [],
  })
  return settingRecord.update()
}

module.exports = async function(event, callback) {
  try {
    console.log(event)
    const inventoryWarningsetting = await getInventoryWarningSetting()
    const {id} = inventoryWarningsetting
    console.log(inventoryWarningsetting)

    updateInventoryWarningSetting(id)
      .then(res => {
        if (res.status === 200) {
          callback(null, {status: 'success', message: 'reset success!'})
        } else {
          throw new Error('清空已发送邮件记录失败！')
        }
      })
      .catch(err => {
        callback(err)
      })
  } catch (error) {
    callback(error)
  }
}
